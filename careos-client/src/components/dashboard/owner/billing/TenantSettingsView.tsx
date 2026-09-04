/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { getTenantById } from "@/services/tenant.services";
import { getPlans, IPlan } from "@/services/plan.services";
import { subscribeTenant, downgradeTenant } from "@/services/billing.services";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  CreditCard,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Crown,
  Zap,
  Shield,
  Ban,
  RotateCcw,
} from "lucide-react";
import UsageBar from "./UsageBar";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function TenantSettingsView({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [downgradeTargetId, setDowngradeTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Subscription active! Updating your plan...");
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

  const {
    mutate: handleCheckout,
    isPending: isCheckingOut,
    variables: loadingPlanId,
  } = useMutation({
    mutationFn: (planId: string) => subscribeTenant(planId),
    onSuccess: (res) => {
      if (res.data?.url) window.location.href = res.data.url;
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to initiate checkout."));
    },
  });

  const { mutate: handleDowngrade, isPending: isDowngrading } = useMutation({
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
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tenant = tenantData;
  const plans: IPlan[] = plansData?.data || [];
  const branchesUsed = tenant._count?.branches ?? 0;
  const studentsUsed = tenant._count?.children ?? 0;
  const isCanceled = tenant.cancelAtPeriodEnd;
  const periodEnd = tenant.currentPeriodEnd
    ? new Date(tenant.currentPeriodEnd).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const triggerDowngradeWarning = (planName: string) => {
    toast.error(`Downgrade to ${planName}?`, {
      description:
        "Your usage exceeds this plan's limits. Excess branches and students will be locked at cycle end unless removed.",
      duration: 10000,
      action: {
        label: "I Understand",
        onClick: () => {
          handleDowngrade();
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Crown className="size-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Current Plan
              </h3>
              {isCanceled && (
                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  Canceling
                </span>
              )}
            </div>

            {tenant.plan ? (
              <>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {tenant.plan.name}
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">
                    ${tenant.plan.price}
                    <span className="text-sm font-normal">/mo</span>
                  </span>
                </div>
                {periodEnd && (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isCanceled
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isCanceled
                      ? `Moves to Free plan on ${periodEnd}`
                      : `Renews on ${periodEnd}`}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No active subscription. Choose a plan below to activate your
                center.
              </p>
            )}
          </div>

          {tenant.plan && (
            <div className="w-full max-w-sm space-y-4 rounded-lg bg-muted/30 p-4 sm:w-72">
              <UsageBar
                label="Branches"
                used={branchesUsed}
                max={tenant.plan.maxBranches}
              />
              <UsageBar
                label="Students"
                used={studentsUsed}
                max={tenant.plan.maxStudents}
              />
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = tenant.plan?.id === plan.id;
          const isDowngrade = tenant.plan && plan.price < tenant.plan.price;
          const isUpgrade = !tenant.plan || plan.price > (tenant.plan?.price || 0);
          const wouldExceed =
            branchesUsed > plan.maxBranches || studentsUsed > plan.maxStudents;
          const isLoadingThis =
            (isCheckingOut && loadingPlanId === plan.id) ||
            (isDowngrading && downgradeTargetId === plan.id);

          const planIcons: Record<string, React.ReactNode> = {
            Free: <Shield className="size-5" />,
            Starter: <Zap className="size-5" />,
            Pro: <Crown className="size-5" />,
            Enterprise: <CreditCard className="size-5" />,
          };

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-5 transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-md"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wide">
                  Current
                </div>
              )}

              <div className="mb-4 flex items-center gap-2">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${
                    isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {planIcons[plan.name] || <Zap className="size-5" />}
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  {plan.name}
                </h4>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500" />
                  <span>Up to {plan.maxBranches} branch(es)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500" />
                  <span>Up to {plan.maxStudents} students</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500" />
                  <span>Unlimited staff & guardians</span>
                </li>
              </ul>

              {isDowngrade && wouldExceed && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <p>Usage exceeds this plan. Data will be locked at cycle end.</p>
                </div>
              )}

              <button
                onClick={() => {
                  if (isDowngrade) {
                    if (wouldExceed) triggerDowngradeWarning(plan.name);
                    else handleDowngrade();
                  } else {
                    handleCheckout(plan.id);
                  }
                }}
                disabled={isCurrent || isCheckingOut || isDowngrading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isCurrent
                    ? "border border-border bg-muted text-muted-foreground"
                    : isDowngrade
                    ? "border border-border bg-background text-foreground hover:bg-muted"
                    : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                }`}
              >
                {isLoadingThis ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isCurrent ? (
                  "Active Plan"
                ) : isDowngrade ? (
                  <>
                    <ArrowDownCircle className="size-4" />
                    Downgrade
                  </>
                ) : (
                  <>
                    {isUpgrade && tenant.plan ? (
                      <ArrowUpCircle className="size-4" />
                    ) : (
                      <CreditCard className="size-4" />
                    )}
                    {tenant.plan ? "Upgrade" : "Subscribe"}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}