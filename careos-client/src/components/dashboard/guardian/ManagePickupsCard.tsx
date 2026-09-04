"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Users,
  User,
  Mail,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  IChildGuardianEntry,
  updatePickupPermission,
  selfUnlinkGuardian,
} from "@/services/child.services";
import { getApiErrorMessage } from "@/lib/errorUtils";
import AddGuardianModal from "./AddGuardianModal";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: 'easeInOut' as const },
  }),
};

export default function ManagePickupsCard({
  childId,
  guardians,
  viewerLink,
}: {
  childId: string;
  guardians: IChildGuardianEntry[];
  viewerLink?: IChildGuardianEntry;
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();
  const isPrimary = Boolean(viewerLink?.isPrimary);

  const toggleMutation = useMutation({
    mutationFn: ({
      linkId,
      canPickup,
    }: {
      linkId: string;
      canPickup: boolean;
    }) => updatePickupPermission(childId, linkId, { canPickup }),
    onSuccess: () => {
      toast.success("Pickup permission updated", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["my-child", childId] });
    },
    onError: (error: unknown) =>
      toast.error(getApiErrorMessage(error), {
        icon: <AlertCircle className="size-4 text-destructive" />,
      }),
  });

  const removeMutation = useMutation({
    mutationFn: (linkId: string) => selfUnlinkGuardian(childId, linkId),
    onSuccess: () => {
      toast.success("Guardian removed", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["my-child", childId] });
    },
    onError: (error: unknown) =>
      toast.error(getApiErrorMessage(error), {
        icon: <AlertCircle className="size-4 text-destructive" />,
      }),
  });

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Guardians & Authorized Pickups
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {isPrimary
                ? "As the primary guardian, you can add guardians and control who may pick up this child."
                : "Only the primary guardian can manage this list."}
            </p>
          </div>
        </div>
        {isPrimary && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <UserPlus className="size-3.5" />
            Add guardian
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-5 space-y-2">
        <AnimatePresence mode="popLayout">
          {guardians.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center"
            >
              <Users className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No guardians added yet.
              </p>
            </motion.div>
          ) : (
            guardians.map((g, i) => (
              <motion.div
                key={g.id}
                variants={fadeInUp}
                custom={i}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                layout
                className="group flex items-center justify-between rounded-xl border border-border bg-background p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  {g.user.image ? (
                    <Image
                      width={36}
                      height={36}
                    
                      src={g.user.image}
                      alt={g.user.name}
                      className="size-9 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-border">
                      <User className="size-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{g.user.name}</span>
                      {g.isPrimary && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <ShieldCheck className="size-3" />
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="size-3" />
                      <span className="truncate">{g.user.email}</span>
                      <span className="text-border">·</span>
                      <span className="shrink-0">{g.relationship}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      isPrimary &&
                      toggleMutation.mutate({
                        linkId: g.id,
                        canPickup: !g.canPickup,
                      })
                    }
                    disabled={!isPrimary || toggleMutation.isPending}
                    title={
                      g.canPickup
                        ? "Can pick up child"
                        : "Cannot pick up child"
                    }
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {g.canPickup ? (
                      <ToggleRight className="size-6 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="size-6 text-muted-foreground/50" />
                    )}
                  </button>

                  {/* Remove */}
                  {isPrimary && !g.isPrimary && (
                    <button
                      onClick={() => removeMutation.mutate(g.id)}
                      disabled={removeMutation.isPending}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-destructive group-hover:opacity-100 dark:hover:bg-red-500/10"
                      title="Remove guardian"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <AddGuardianModal
            childId={childId}
            onClose={() => setIsAddOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}