/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Info,
  Megaphone,
  Send,
  ShieldAlert,
  Loader2,
  Building2,
  School,
  Globe,
  ChevronDown,
} from "lucide-react";
import { createBroadcast, CreateBroadcastPayload } from "@/services/broadcast.services";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const priorities = [
  {
    key: "INFO",
    label: "Info",
    desc: "General update",
    icon: Info,
    activeClass:
      "border-primary bg-primary/5 text-primary",
    idleClass:
      "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
  },
  {
    key: "WARNING",
    label: "Warning",
    desc: "Needs attention",
    icon: AlertTriangle,
    activeClass:
      "border-amber-500 bg-amber-500/5 text-amber-500",
    idleClass:
      "border-border bg-card text-muted-foreground hover:border-amber-500/30 hover:text-foreground",
  },
  {
    key: "CRITICAL",
    label: "Critical",
    desc: "Immediate action",
    icon: ShieldAlert,
    activeClass:
      "border-destructive bg-destructive/5 text-destructive",
    idleClass:
      "border-border bg-card text-muted-foreground hover:border-destructive/30 hover:text-foreground",
  },
];

const audiences = [
  { key: "TENANT", label: "Entire Organization", icon: Globe },
  { key: "BRANCH", label: "Specific Branch", icon: Building2 },
  { key: "CLASSROOM", label: "Specific Classroom", icon: School },
];

export default function BroadcastComposer({
  branches = [],
  classrooms = [],
}: {
  branches?: { id: string; name: string }[];
  classrooms?: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateBroadcastPayload>({
    title: "",
    body: "",
    priority: "INFO",
    audience: "BRANCH",
    branchId: "",
    classroomId: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createBroadcast,
    onSuccess: () => {
      toast.success("Broadcast dispatched successfully.");
      setFormData({ ...formData, title: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch broadcast.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      return toast.error("Title and message body are required.");
    }
    if (formData.audience === "BRANCH" && !formData.branchId) {
      return toast.error("Please select a branch.");
    }
    if (formData.audience === "CLASSROOM" && !formData.classroomId) {
      return toast.error("Please select a classroom.");
    }
    mutate(formData);
  };

  const isCritical = formData.priority === "CRITICAL";

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
      {/* Header */}
      <div
        className={`flex items-center gap-3 border-b border-border px-6 py-4 ${
          isCritical ? "bg-destructive/5" : "bg-muted/30"
        }`}
      >
        <div
          className={`flex size-9 items-center justify-center rounded-xl ${
            isCritical ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          <Megaphone className="size-4" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">
            New Broadcast
          </h2>
          <p className="text-xs text-muted-foreground">
            {isCritical
              ? "This will be marked as critical and require acknowledgment."
              : "Send an announcement to your selected audience."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Priority */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="space-y-3"
        >
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorities.map((p) => {
              const Icon = p.icon;
              const active = formData.priority === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, priority: p.key as any })
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all ${
                    active ? p.activeClass : p.idleClass
                  }`}
                >
                  <Icon className="size-5" strokeWidth={2} />
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10px] opacity-70">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Audience */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="space-y-3"
        >
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Target Audience
          </label>
          <div className="relative">
            <select
              value={formData.audience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  audience: e.target.value as any,
                  branchId: "",
                  classroomId: "",
                })
              }
              className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            >
              {audiences.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Conditional selectors */}
        {formData.audience === "BRANCH" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Select Branch
            </label>
            <div className="relative">
              <select
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">Choose a branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </motion.div>
        )}

        {formData.audience === "CLASSROOM" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Select Classroom
            </label>
            <div className="relative">
              <select
                value={formData.classroomId}
                onChange={(e) =>
                  setFormData({ ...formData, classroomId: e.target.value })
                }
                className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">Choose a classroom</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="space-y-3"
        >
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Campus Closing Early Due to Weather"
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </motion.div>

        {/* Body */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="space-y-3"
        >
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Message
          </label>
          <textarea
            value={formData.body}
            onChange={(e) =>
              setFormData({ ...formData, body: e.target.value })
            }
            placeholder="Provide detailed instructions or updates here..."
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary custom-scrollbar"
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="pt-2"
        >
          <button
            type="submit"
            disabled={isPending}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
              isCritical
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isPending ? "Dispatching..." : "Send Broadcast"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}