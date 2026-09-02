/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChildDocuments, signDocument } from "@/services/document.services";
import { toast } from "sonner";
import { Loader2, FileText, Download, PenTool, CheckCircle2, FileWarning } from "lucide-react";

export default function GuardianDocumentVault({ childId }: { childId: string }) {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["documents", childId],
    queryFn: () => getChildDocuments(childId),
  });

  const { mutate: handleSign, isPending: isSigning } = useMutation({
    mutationFn: (documentId: string) => signDocument(documentId),
    onSuccess: () => {
      toast.success("Document signed successfully");
      queryClient.invalidateQueries({ queryKey: ["documents", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;
  }

  const documents = response?.data || [];

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl text-center">
        <FileText className="size-10 text-muted-foreground/50 mb-3" />
        <p className="font-medium text-foreground">No documents found.</p>
        <p className="text-sm text-muted-foreground">Any uploaded policies or medical forms will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc: any) => (
        <div key={doc.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`p-3 rounded-lg flex-shrink-0 ${doc.status === 'SIGNED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
              <FileText className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{doc.type.replace(/_/g, " ")}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">v{doc.version}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:border-l border-border sm:pl-4">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Download className="size-4" /> View
            </a>

            {doc.status === 'SIGNED' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md">
                <CheckCircle2 className="size-4" /> Signed
              </div>
            ) : (
              <button
                onClick={() => handleSign(doc.id)}
                disabled={isSigning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSigning ? <Loader2 className="size-4 animate-spin" /> : <PenTool className="size-4" />}
                Sign Now
              </button>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}