/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Pencil,
  Building2,
  Users,
  DollarSign,
  CreditCard,
  Crown,
  Zap,
  Shield,
} from "lucide-react";
import { getPlans, deletePlan, seedDefaultPlans, IPlan } from "@/services/plan.services";
import CreatePlanModal from "./CreatePlanModal";
import EditPlanModal from "./EditPlanModal";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeInOut' as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SkeletonPulse className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <SkeletonPulse key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function PlansManagement() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IPlan | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });

  const plans: IPlan[] = data?.data || [];

  const { mutate: seed, isPending: isSeeding } = useMutation({
    mutationFn: seedDefaultPlans,
    onSuccess: () => {
      toast.success("Default plans created successfully.");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to seed plans."),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      toast.success("Plan deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete plan."),
  });

  const handleDelete = (plan: IPlan) => {
    toast.error(`Delete "${plan.name}"?`, {
      description: "This action cannot be undone. Tenants on this plan will be affected.",
      action: {
        label: "Delete",
        onClick: () => remove(plan.id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const totalTenants = plans.reduce((sum, p) => sum + (p._count?.tenants ?? 0), 0);
  const avgPrice =
    plans.length > 0
      ? (plans.reduce((sum, p) => sum + (p.price || 0), 0) / plans.length).toFixed(2)
      : "0.00";

  const getPlanAccent = (index: number) => {
    const accents = [
      "from-primary/10 to-primary/5",
      "from-indigo-500/10 to-indigo-500/5",
      "from-emerald-500/10 to-emerald-500/5",
      "from-amber-500/10 to-amber-500/5",
      "from-rose-500/10 to-rose-500/5",
    ];
    return accents[index % accents.length];
  };

  const getPlanIcon = (index: number) => {
    const icons = [Crown, Zap, Shield, Sparkles, CreditCard];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  if (isLoading) return <PlansSkeleton />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        custom={0}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <CreditCard className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Subscription Plans
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Manage pricing tiers, branch limits, and student capacity for all tenants.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Add Plan
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {plans.length > 0 && (
        <motion.div
          variants={fadeInUp}
          custom={1}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              label: "Total Plans",
              value: plans.length,
              icon: CreditCard,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Avg. Monthly Price",
              value: `$${avgPrice}`,
              icon: DollarSign,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Subscribed Tenants",
              value: totalTenants,
              icon: Building2,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-500/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              custom={i + 1}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 size-20 rounded-full bg-muted/50 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Sparkles className="size-8" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-bold text-foreground">No subscription plans yet</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Create default plans to get started quickly, or add a custom plan manually.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => seed()}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {isSeeding && <Loader2 className="size-4 animate-spin" />}
              <Zap className="size-4" />
              {isSeeding ? "Seeding..." : "Seed Default Plans"}
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Add Manually
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          custom={2}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {plans.map((plan, i) => {
              const PlanIcon = getPlanIcon(i);
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeInUp}
                  custom={i}
                  layout
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                >
                  {/* Gradient accent top */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getPlanAccent(i)}`}
                  />
                  <div className={`absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br ${getPlanAccent(i)} blur-2xl opacity-50 transition-opacity group-hover:opacity-80`} />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${getPlanAccent(i)}`}
                        >
                          <PlanIcon className="size-5 text-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDelete(plan)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                        title="Delete plan"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-5">
                      <p className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </p>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                          <Building2 className="size-3.5" />
                        </div>
                        <span>
                          Up to <span className="font-semibold text-foreground">{plan.maxBranches}</span>{" "}
                          branch{plan.maxBranches !== 1 ? "es" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                          <Users className="size-3.5" />
                        </div>
                        <span>
                          Up to <span className="font-semibold text-foreground">{plan.maxStudents}</span>{" "}
                          student{plan.maxStudents !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                          <CreditCard className="size-3.5" />
                        </div>
                        <span>
                          <span className="font-semibold text-foreground">
                            {plan._count?.tenants ?? 0}
                          </span>{" "}
                          tenant{(plan._count?.tenants ?? 0) !== 1 ? "s" : ""} subscribed
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditTarget(plan)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/30 active:scale-[0.98]"
                    >
                      <Pencil className="size-3.5" />
                      Edit Plan
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
     <CreatePlanModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {editTarget && (
        <EditPlanModal
          isOpen={true}
          onClose={() => setEditTarget(null)}
          plan={editTarget}
        />
      )}
    </motion.div>
  );
}