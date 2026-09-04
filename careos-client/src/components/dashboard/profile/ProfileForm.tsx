/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Camera,
  User,
  Save,
  X,
  Mail,
  Building2,
  Shield,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { updateMe, IMe } from "@/services/user.services";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const validateWithZod = (schema: z.ZodTypeAny) => ({ value }: { value: any }) => {
  const result = schema.safeParse(value);
  if (!result.success) return result.error.errors[0].message;
  return undefined;
};

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50";

export default function ProfileForm({ user }: { user: IMe }) {
  const queryClient = useQueryClient();
  const avatarFileRef = useRef<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setHasChanges(false);
      avatarFileRef.current = null;
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      e.target.value = "";
      return;
    }
    avatarFileRef.current = file;
    setAvatarPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const form = useForm({
    defaultValues: {
      name: user.name,
    },
    onSubmit: ({ value }) => {
      const result = profileSchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const formData = new FormData();
      formData.append("name", value.name);
      if (avatarFileRef.current) formData.append("avatar", avatarFileRef.current);

      mutate(formData);
    },
  });

  const displayImage = avatarPreview || user.image;
  const roleLabel = user.role.replace("_", " ").toLowerCase();

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8 p-6"
      >
        {/* Avatar + Identity */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImage}
                  alt={user.name}
                  className="size-28 rounded-full object-cover border-4 border-border shadow-sm"
                />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-full border-4 border-border bg-muted text-muted-foreground">
                  <User className="size-12" />
                </div>
              )}
              <label className="absolute -right-1 -bottom-1 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isPending}
                  className="hidden"
                />
              </label>
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(null);
                  avatarFileRef.current = null;
                  setHasChanges(true);
                }}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <X className="size-3" />
                Remove new image
              </button>
            )}
          </div>

          {/* Read-only Info */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Mail className="size-3.5" />
                  Email
                </div>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Shield className="size-3.5" />
                  Role
                </div>
                <p className="text-sm font-medium capitalize text-foreground">{roleLabel}</p>
              </div>

              {user.branch && (
                <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Building2 className="size-3.5" />
                    Branch
                  </div>
                  <p className="text-sm font-medium text-foreground">{user.branch.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <User className="size-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Display Name</h4>
          </div>

          <form.Field
            name="name"
            validators={{ onChange: validateWithZod(profileSchema.shape.name) }}
          >
            {(field) => (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={isPending}
                    className={`${inputClass} pl-10`}
                    placeholder="Your full name"
                  />
                </div>
                {field.state.meta.errors[0] && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => {
              form.setFieldValue("name", user.name);
              setAvatarPreview(null);
              avatarFileRef.current = null;
              setHasChanges(false);
            }}
            disabled={isPending || !hasChanges}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="submit"
            disabled={isPending || !hasChanges}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            <Save className="size-3.5" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}