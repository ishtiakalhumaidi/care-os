/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  ImagePlus,
  X,
  Baby,
  User,
  Calendar,
  HeartPulse,
  Stethoscope,
  Users,
  Send,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { applyForChild } from "@/services/child.services";

const applySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  relationship: z.string().min(2, "Relationship is required"),
  medicalNotes: z.string().optional(),
  allergies: z.string().optional(),
});

const validateWithZod =
  (schema: z.ZodTypeAny) =>
  ({ value }: { value: any }) => {
    const result = schema.safeParse(value);
    if (!result.success) return result.error.errors[0].message;
    return undefined;
  };

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "block text-sm font-semibold text-foreground";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeInOut" as const },
  }),
};

interface RegisterChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterChildModal({ isOpen, onClose }: RegisterChildModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoFileRef = useRef<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: applyForChild,
    onSuccess: () => {
      toast.success("Application submitted successfully!", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
        description: "A staff member will review it shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      router.refresh();
      // ─── CLOSE MODAL IMMEDIATELY ON SUCCESS ───
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit application.");
    },
  });

  const handlePhotoChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    photoFileRef.current = file;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoChange(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoChange(file);
  }, []);

  const removePhoto = () => {
    photoFileRef.current = null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  // MOVE FORM DECLARATION ABOVE handleClose
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      relationship: "",
      medicalNotes: "",
      allergies: "",
    },
    
    onSubmit: ({ value }) => {
      const result = applySchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const formData = new FormData();
      formData.append("firstName", value.firstName);
      formData.append("lastName", value.lastName);
      formData.append("dateOfBirth", value.dateOfBirth);
      formData.append("relationship", value.relationship);
      if (value.medicalNotes) formData.append("medicalNotes", value.medicalNotes);
      if (value.allergies) formData.append("allergies", value.allergies);
      if (photoFileRef.current) formData.append("photo", photoFileRef.current);

      mutate(formData);
    },
  });

  const handleClose = useCallback(() => {
    photoFileRef.current = null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setIsDragging(false);
    form.reset();
    onClose();
  }, [onClose, photoPreview, form]);

  /* ─── escape key ─── */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isPending, handleClose]);

  /* ─── lock body scroll ─── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5 py-4 sm:px-6">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <Baby className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">
                    Add a Child
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Submit an application for enrollment review
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <form
                id="register-child-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-6 p-5 sm:p-6"
              >
                {/* Photo upload */}
                <motion.div variants={fadeInUp} custom={0} initial="hidden" animate="visible">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                      <ImagePlus className="size-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Child&apos;s Photo</h3>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>

                  {photoPreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative inline-block"
                    >
                      <div className="relative size-24 overflow-hidden rounded-2xl border-2 border-border shadow-sm">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={isPending}
                        className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-all hover:bg-destructive/90 hover:scale-110 active:scale-95 disabled:opacity-50"
                      >
                        <X className="size-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all sm:p-8 ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div
                          className={`flex size-12 items-center justify-center rounded-2xl transition-colors ${
                            isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
                          }`}
                        >
                          {isDragging ? <UploadCloud className="size-6" /> : <ImagePlus className="size-6" />}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          {isDragging ? "Drop photo here" : "Click or drag photo here"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        disabled={isPending}
                        className="hidden"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Personal Information */}
                <motion.div variants={fadeInUp} custom={1} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                      <User className="size-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="firstName"
                      validators={{ onChange: validateWithZod(applySchema.shape.firstName) }}
                    >
                      {(field) => (
                        <div>
                          <label className={labelClass}>First name</label>
                          <input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isPending}
                            placeholder="e.g. Emma"
                            className={inputClass}
                          />
                          {field.state.meta.errors[0] && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 flex items-center gap-1 text-xs text-destructive"
                            >
                              <AlertCircle className="size-3" />
                              {field.state.meta.errors[0]}
                            </motion.p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="lastName"
                      validators={{ onChange: validateWithZod(applySchema.shape.lastName) }}
                    >
                      {(field) => (
                        <div>
                          <label className={labelClass}>Last name</label>
                          <input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isPending}
                            placeholder="e.g. Johnson"
                            className={inputClass}
                          />
                          {field.state.meta.errors[0] && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 flex items-center gap-1 text-xs text-destructive"
                            >
                              <AlertCircle className="size-3" />
                              {field.state.meta.errors[0]}
                            </motion.p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <form.Field
                    name="dateOfBirth"
                    validators={{ onChange: validateWithZod(applySchema.shape.dateOfBirth) }}
                  >
                    {(field) => (
                      <div className="sm:w-1/2">
                        <label className={labelClass}>Date of birth</label>
                        <div className="relative mt-1.5">
                          <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="date"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isPending}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                        {field.state.meta.errors[0] && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 flex items-center gap-1 text-xs text-destructive"
                          >
                            <AlertCircle className="size-3" />
                            {field.state.meta.errors[0]}
                          </motion.p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="relationship"
                    validators={{ onChange: validateWithZod(applySchema.shape.relationship) }}
                  >
                    {(field) => (
                      <div>
                        <label className={labelClass}>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-muted-foreground" />
                            Your relationship to this child
                          </span>
                        </label>
                        <input
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isPending}
                          placeholder="e.g. Mother, Father, Guardian"
                          className={inputClass}
                        />
                        {field.state.meta.errors[0] && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 flex items-center gap-1 text-xs text-destructive"
                          >
                            <AlertCircle className="size-3" />
                            {field.state.meta.errors[0]}
                          </motion.p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </motion.div>

                {/* Health Information */}
                <motion.div variants={fadeInUp} custom={2} initial="hidden" animate="visible" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10">
                      <HeartPulse className="size-4 text-rose-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Health Information</h3>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>

                  <form.Field name="allergies">
                    {(field) => (
                      <div>
                        <label className={labelClass}>Allergies</label>
                        <textarea
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isPending}
                          rows={2}
                          placeholder="List any known allergies..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="medicalNotes">
                    {(field) => (
                      <div>
                        <label className={labelClass}>
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="size-3.5 text-muted-foreground" />
                            Medical notes
                          </span>
                        </label>
                        <textarea
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isPending}
                          rows={2}
                          placeholder="Any medical conditions or special requirements..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    )}
                  </form.Field>
                </motion.div>
              </form>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-5 py-4 sm:px-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="register-child-form"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}