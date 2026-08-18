/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/timeline/TeacherTimelineLogger.tsx
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Utensils, Moon, Baby, AlertTriangle, MessageSquare, BookOpen, Loader2 } from "lucide-react";
import { logTimelineEvent, EventType } from "@/services/timeline.services";

const EVENT_TYPES: { type: EventType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "MEAL", label: "Meal", icon: Utensils, color: "text-emerald-600 bg-emerald-500/10" },
  { type: "NAP", label: "Nap", icon: Moon, color: "text-indigo-600 bg-indigo-500/10" },
  { type: "BATHROOM", label: "Bathroom", icon: Baby, color: "text-sky-600 bg-sky-500/10" },
  { type: "LEARNING", label: "Learning", icon: BookOpen, color: "text-amber-600 bg-amber-500/10" },
];

export default function TeacherTimelineLogger({ 
  childId, 
  childName,
  onSuccess 
}: { 
  childId: string; 
  childName: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeNoteType, setActiveNoteType] = useState<"NOTE" | "INCIDENT" | null>(null);
  const [description, setDescription] = useState("");

 const { mutate, isPending } = useMutation({
    mutationFn: (payload: { eventType: EventType; description?: string }) =>
      logTimelineEvent(childId, payload),
    onSuccess: () => {
      toast.success("Event logged successfully");
      
      
      queryClient.invalidateQueries({ queryKey: ["timeline"] }); 
      
      setActiveNoteType(null);
      setDescription("");
      if (onSuccess) onSuccess(); 
    },
    onError: (err: any) => toast.error(err.message || "Failed to log event"),
  });

  const handleQuickLog = (eventType: EventType) => mutate({ eventType });

  const handleCustomLog = () => {
    if (!activeNoteType || !description.trim()) return;
    mutate({ eventType: activeNoteType, description });
  };

  return (
    <div className="rounded-lg bg-card text-foreground">
      <h3 className="mb-4 text-sm font-semibold">Log Activity for {childName}</h3>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        {EVENT_TYPES.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => handleQuickLog(type)}
            disabled={isPending}
            className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-muted/30 py-3 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <div className={`rounded-full p-2 ${color}`}>
              <Icon className="size-4" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {!activeNoteType ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNoteType("NOTE")}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="size-3.5" /> Add Note
          </button>
          <button
            onClick={() => setActiveNoteType("INCIDENT")}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <AlertTriangle className="size-3.5" /> Log Incident
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            placeholder={activeNoteType === "INCIDENT" ? "Describe the incident..." : "Type a note for the parents..."}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            rows={3}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setActiveNoteType(null)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomLog}
              disabled={isPending || !description.trim()}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Save {activeNoteType === "INCIDENT" ? "Incident" : "Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}