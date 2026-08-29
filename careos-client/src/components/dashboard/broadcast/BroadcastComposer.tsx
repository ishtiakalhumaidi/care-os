/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Info, Megaphone, Send, ShieldAlert, Loader2 } from "lucide-react";
import { createBroadcast, CreateBroadcastPayload } from "@/services/broadcast.services";

export default function BroadcastComposer({
  branches = [],
  classrooms = [],
}: {
  branches?: { id: string; name: string }[];
  classrooms?: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient(); 
  const [formData, setFormData] = useState<CreateBroadcastPayload>({
    title: "", body: "", priority: "INFO", audience: "BRANCH", branchId: "", classroomId: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createBroadcast,
    onSuccess: () => {
      toast.success("Broadcast dispatched successfully!");
      setFormData({ ...formData, title: "", body: "" }); // Reset form
      
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] }); 
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch broadcast");
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
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className={`p-4 border-b border-border flex items-center gap-2 ${isCritical ? 'bg-destructive/10 text-destructive' : 'bg-muted/30'}`}>
        {isCritical ? <ShieldAlert className="size-5" /> : <Megaphone className="size-5" />}
        <h2 className="font-semibold">Dispatch Broadcast</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Priority & Audience Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Priority Level</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: "INFO" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-colors ${formData.priority === "INFO" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted"}`}
              >
                <Info className="size-3.5" /> Info
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: "WARNING" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-colors ${formData.priority === "WARNING" ? "bg-amber-500 text-white border-amber-500" : "bg-background border-input hover:bg-muted"}`}
              >
                <AlertTriangle className="size-3.5" /> Warning
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: "CRITICAL" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-colors ${formData.priority === "CRITICAL" ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background border-input hover:bg-muted"}`}
              >
                <ShieldAlert className="size-3.5" /> Critical
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Target Audience</label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value as any, branchId: "", classroomId: "" })}
              className="w-full h-[38px] rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="TENANT">Entire Organization (All Branches)</option>
              <option value="BRANCH">Specific Branch</option>
              <option value="CLASSROOM">Specific Classroom</option>
            </select>
          </div>
        </div>

        {/* Conditional Target Selectors */}
        {formData.audience === "BRANCH" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
            <label className="text-sm font-medium text-foreground">Select Branch</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">-- Choose a branch --</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        {formData.audience === "CLASSROOM" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
            <label className="text-sm font-medium text-foreground">Select Classroom</label>
            <select
              value={formData.classroomId}
              onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">-- Choose a classroom --</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Campus Closing Early Due to Weather"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Provide detailed instructions or updates here..."
            rows={4}
            className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none custom-scrollbar"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
              isCritical 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:opacity-50`}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isPending ? "Dispatching..." : "Send Broadcast"}
          </button>
        </div>
      </form>
    </div>
  );
}