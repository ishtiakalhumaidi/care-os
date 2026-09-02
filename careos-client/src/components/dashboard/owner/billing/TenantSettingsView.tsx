/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { getTenantById } from "@/services/tenant.services";
import { getPlans, IPlan } from "@/services/plan.services";
import { subscribeTenant, downgradeTenant } from "@/services/billing.services";
import { toast } from "sonner";
import { Loader2, Check, CreditCard, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import UsageBar from "./UsageBar";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function TenantSettingsView({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Track which plan ID is being downgraded for the loading spinner
  const [downgradeTargetId, setDowngradeTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Subscription active! Your plan is updating...");
      router.replace("/owner/dashboard/billing");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["tenants", tenantId] });
      }, 2500);
    }
    
    if (searchParams.get("canceled")) {
      toast.error("Checkout was canceled.");
      router.replace("/owner/dashboard/billing");
    }
  }, [searchParams, router, queryClient, tenantId]);

  const { data: tenantData, isLoading: isLoadingTenant } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => getTenantById(tenantId).then((res) => res.data),
  });

  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });

  // 1. Mutation for Upgrading/Subscribing (Stripe Checkout)
  const {
    mutate: handleCheckout,
    isPending: isCheckingOut,
    variables: loadingPlanId,
  } = useMutation({
    mutationFn: (planId: string) => subscribeTenant(planId),
    onSuccess: (res) => {
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to initiate checkout."));
    },
  });

  // 2. Mutation for Downgrading (Internal API)
  const { 
    mutate: handleDowngrade, 
    isPending: isDowngrading 
  } = useMutation({
    mutationFn: () => downgradeTenant(),
    onSuccess: () => {
      toast.success("Downgrade scheduled for the end of your billing cycle.");
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId] });
      setDowngradeTargetId(null);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to schedule downgrade."));
      setDowngradeTargetId(null);
    },
  });

  if (isLoadingTenant || isLoadingPlans) {
    return <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />;
  }

  const tenant = tenantData;
  const plans: IPlan[] = plansData?.data || [];
  const branchesUsed = tenant._count?.branches ?? 0;
  const studentsUsed = tenant._count?.children ?? 0;

  const isCanceled = tenant.cancelAtPeriodEnd;
  const periodEnd = tenant.currentPeriodEnd ? new Date(tenant.currentPeriodEnd).toLocaleDateString() : null;

  const triggerDowngradeWarning = (planId: string, planName: string) => {
    toast.error(`Downgrade to ${planName}?`, {
      description: "You exceed this plan's limits. Excess branches and students will be locked at the end of your billing cycle unless removed.",
      duration: 10000,
      action: {
        label: "I Understand, Downgrade",
        onClick: () => {
          setDowngradeTargetId(planId);
          handleDowngrade();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => setDowngradeTargetId(null),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Current Plan</h3>
            {tenant.plan ? (
              <>
                <p className="mt-1 flex items-baseline text-2xl font-bold text-foreground">
                  {tenant.plan.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ${tenant.plan.price}/mo
                  </span>
                </p>
                {periodEnd && (
                  <p className={`mt-2 text-sm font-medium ${isCanceled ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {isCanceled 
                      ? `Cancels and moves to Free plan on ${periodEnd}` 
                      : `Active • Renews on ${periodEnd}`
                    }
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No active subscription. Choose a plan below to activate your center.
              </p>
            )}
          </div>
        </div>

        {tenant.plan && (
          <div className="mt-6 space-y-4 max-w-md">
            <UsageBar label="Branches" used={branchesUsed} max={tenant.plan.maxBranches} />
            <UsageBar label="Enrolled students" used={studentsUsed} max={tenant.plan.maxStudents} />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">Upgrade & Subscription</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = tenant.plan?.id === plan.id;
            const isDowngrade = tenant.plan && plan.price < tenant.plan.price;
            const isUpgrade = !tenant.plan || plan.price > (tenant.plan?.price || 0);
            
            const wouldExceedLimits = branchesUsed > plan.maxBranches || studentsUsed > plan.maxStudents;
            const isCurrentlyLoadingThis = (isCheckingOut && loadingPlanId === plan.id) || (isDowngrading && downgradeTargetId === plan.id);

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                  isCurrent 
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-lg">{plan.name}</h4>
                    {isCurrent && <Check className="size-5 text-primary" />}
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-4">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-500" /> Up to {plan.maxBranches} branch(es)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-500" /> Up to {plan.maxStudents} students
                    </li>
                  </ul>
                  
                  {isDowngrade && wouldExceedLimits && (
                    <div className="mb-4 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-md border border-amber-500/20">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <p>Your current usage exceeds this plan. Excess data will be locked at cycle end.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isDowngrade) {
                      if (wouldExceedLimits) {
                        triggerDowngradeWarning(plan.id, plan.name);
                      } else {
                        setDowngradeTargetId(plan.id);
                        handleDowngrade();
                      }
                    } else {
                      handleCheckout(plan.id);
                    }
                  }}
                  disabled={isCurrent || isCheckingOut || isDowngrading}
                  className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    isCurrent
                      ? "bg-muted text-muted-foreground border border-border"
                      : isDowngrade
                      ? "bg-background text-foreground border border-border hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isCurrentlyLoadingThis ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : isDowngrade ? (
                    <>
                      <ArrowDownCircle className="size-4" />
                      Downgrade
                    </>
                  ) : (
                    <>
                      {isUpgrade && tenant.plan ? <ArrowUpCircle className="size-4" /> : <CreditCard className="size-4" />}
                      {tenant.plan ? "Upgrade" : "Subscribe"}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}