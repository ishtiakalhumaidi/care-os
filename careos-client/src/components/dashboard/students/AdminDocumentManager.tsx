/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChildDocuments, uploadDocument, deleteDocument } from "@/services/document.services";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2, CheckCircle2, Clock } from "lucide-react";

export default function AdminDocumentManager({ childId }: { childId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Set the default state to match the first item in your Prisma enum
  const [docType, setDocType] = useState("IMMUNIZATION_RECORD");
  const [file, setFile] = useState<File | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["documents", childId],
    queryFn: () => getChildDocuments(childId),
  });

  const { mutate: handleUpload, isPending: isUploading } = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Please select a file");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      return uploadDocument(childId, formData);
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["documents", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const documents = response?.data || [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mt-6">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Document Vault</h3>
          <p className="text-xs text-muted-foreground">Manage contracts, medical forms, and center policies.</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="flex flex-col sm:flex-row items-end gap-3 mb-6 bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Type</label>
          <select 
            value={docType} 
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {/* Options matched exactly to your Prisma DocumentType Enum */}
            <option value="IMMUNIZATION_RECORD">Immunization Record</option>
            <option value="ENROLLMENT_CONTRACT">Enrollment Contract</option>
            <option value="CONSENT_FIELD_TRIP">Consent: Field Trip</option>
            <option value="CONSENT_PHOTO_RELEASE">Consent: Photo Release</option>
            <option value="CONSENT_MEDICATION">Consent: Medication</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">PDF File</label>
          <input 
            type="file" 
            accept=".pdf,image/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        <button
          onClick={() => handleUpload()}
          disabled={!file || isUploading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload
        </button>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
          No documents in the vault yet.
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {documents.map((doc: any) => (
            <li key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="size-8 text-primary/60" />
                <div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:underline text-foreground">
                    {doc.type.replace(/_/g, " ")} (v{doc.version})
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doc.status === 'SIGNED' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Signed by {doc.signedBy?.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="size-3" /> Pending Signature
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={isDeleting}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Delete Document"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}