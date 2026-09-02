/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGuardianInvoices } from "@/services/billing.services";
import GuardianDocumentVault from "@/components/dashboard/guardian/documents/GuardianDocumentVault";
import { Loader2, FolderKanban } from "lucide-react";

export default function GuardianDocumentsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["guardian-children-links"],
    queryFn: getGuardianInvoices,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const linkedChildren = response?.data || [];

  if (linkedChildren.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-12 mt-12 bg-card border border-border rounded-xl text-center">
        <FolderKanban className="size-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Document Vault</h2>
        <p className="text-muted-foreground mt-2">You are not linked to any active child profiles yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Vault</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review center policies, medical records, and e-sign pending contracts.
        </p>
      </div>

      <div className="space-y-8">
        {linkedChildren.map((childData: any) => (
          <div key={childData.childId} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted/30 px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{childData.childName}</h3>
                <p className="text-sm text-muted-foreground">{childData.branchName || "Unassigned Location"}</p>
              </div>
            </div>
            
            <div className="p-5">
              <GuardianDocumentVault childId={childData.childId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}