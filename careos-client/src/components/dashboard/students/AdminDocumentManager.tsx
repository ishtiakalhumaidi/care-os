/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getChildDocuments,
  uploadDocument,
  deleteDocument,
} from "@/services/document.services";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  FileUp,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const docTypeLabels: Record<string, string> = {
  IMMUNIZATION_RECORD: "Immunization Record",
  ENROLLMENT_CONTRACT: "Enrollment Contract",
  CONSENT_FIELD_TRIP: "Consent: Field Trip",
  CONSENT_PHOTO_RELEASE: "Consent: Photo Release",
  CONSENT_MEDICATION: "Consent: Medication",
  OTHER: "Other",
};

export default function AdminDocumentManager({
  childId,
}: {
  childId: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState("IMMUNIZATION_RECORD");
  const [file, setFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      toast.success("Document uploaded", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["documents", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents", childId] });
      setDeletingId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const documents = response?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Document Vault
          </h3>
          <p className="text-xs text-muted-foreground">
            Contracts, medical forms, and center policies
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Document Type
            </label>
            <div className="relative">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {Object.entries(docTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="size-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="sm:col-span-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,image/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={() => handleUpload()}
              disabled={!file || isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex items-center gap-2 overflow-hidden rounded-lg bg-primary/5 px-3 py-2"
          >
            <FileUp className="size-4 text-primary" />
            <span className="truncate text-xs font-medium text-primary">
              {file.name}
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </motion.div>
        )}
      </div>

      {/* Document List */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex min-h-[8rem] flex-col items-center justify-center rounded-xl border border-border bg-card">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">
              Loading documents...
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex min-h-[8rem] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-10 text-center">
            <FileText className="size-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No documents yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Upload enrollment contracts, medical forms, or consent slips
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc: any, idx: number) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.03,
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary/70" />
                  </div>
                  <div className="min-w-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {docTypeLabels[doc.type] || doc.type.replace(/_/g, " ")}{" "}
                      <span className="text-muted-foreground">
                        (v{doc.version})
                      </span>
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {doc.status === "SIGNED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          Signed by {doc.signedBy?.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          <Clock className="size-3" />
                          Pending Signature
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDeletingId(doc.id);
                    handleDelete(doc.id);
                  }}
                  disabled={deletingId === doc.id}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}