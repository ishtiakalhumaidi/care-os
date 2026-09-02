/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuardianSplits } from "@/services/child.services";
import { toast } from "sonner";
import { Loader2, PieChart, AlertCircle, Save } from "lucide-react";
import { getApiErrorMessage } from "@/lib/errorUtils";

// Helper to generate the initial math based on database values
const generateInitialSplits = (guardiansList: any[]) => {
  const initial: Record<string, number> = {};
  guardiansList.forEach((g) => {
    initial[g.id] = g.splitPercentage ?? (g.isPrimary ? 100 : 0);
  });
  return initial;
};

export default function GuardianSplitManager({ 
  childId, 
  guardians 
}: { 
  childId: string; 
  guardians: any[] 
}) {
  const queryClient = useQueryClient();
  
  // 1. Initialize state directly (lazy initialization prevents the useEffect error)
  const [splits, setSplits] = useState<Record<string, number>>(() => 
    generateInitialSplits(guardians)
  );
  
  // 2. Track previous props to update state if a guardian is added/removed
  const [prevGuardians, setPrevGuardians] = useState(guardians);

  // 3. React-recommended way to sync state with props without using useEffect
  if (guardians !== prevGuardians) {
    setPrevGuardians(guardians);
    setSplits(generateInitialSplits(guardians));
  }

  const handleSplitChange = (linkId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, Number(value) || 0));
    setSplits((prev) => ({ ...prev, [linkId]: numValue }));
  };

  const totalSplit = Object.values(splits).reduce((sum, val) => sum + val, 0);
  const isValid = totalSplit === 100;

  const { mutate: handleSave, isPending } = useMutation({
    mutationFn: () => {
      const payload = Object.entries(splits).map(([linkId, splitPercentage]) => ({
        linkId,
        splitPercentage,
      }));
      return updateGuardianSplits(childId, payload);
    },
    onSuccess: () => {
      toast.success("Billing custody splits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to update splits"));
    },
  });

  // If there's only one guardian, they are always 100%. No need to manage splits.
  if (guardians.length <= 1) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <PieChart className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Split-Custody Billing</h3>
          <p className="text-xs text-muted-foreground">Adjust the financial responsibility for future invoices.</p>
        </div>
      </div>

      <div className="space-y-4">
        {guardians.map((guardian) => (
          <div key={guardian.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {guardian.user.name || "Unnamed Guardian"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {guardian.relationship} {guardian.isPrimary && "(Primary)"}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={splits[guardian.id] ?? 0}
                onChange={(e) => handleSplitChange(guardian.id, e.target.value)}
                className="w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-right font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium text-muted-foreground">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
        
        {/* Progress Bar & Validation Warning */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Allocation</span>
            <span className={`text-sm font-bold ${isValid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {totalSplit}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isValid ? "bg-emerald-500" : totalSplit > 100 ? "bg-destructive" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(totalSplit, 100)}%` }}
            />
          </div>
          {!isValid && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="size-3" />
              Splits must equal exactly 100%
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleSave()}
          disabled={!isValid || isPending}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 w-full sm:w-auto justify-center"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Splits
        </button>
      </div>
    </div>
  );
}