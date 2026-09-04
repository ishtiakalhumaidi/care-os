/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Camera,
  Save,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Hash,
  Type,
  CreditCard,
} from "lucide-react";
import { getTenantById, updateTenant } from "@/services/tenant.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50";

function SkeletonForm() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-20 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-md bg-muted" />
          <div className="h-3 w-48 rounded-md bg-muted" />
        </div>
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 rounded-md bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <Icon className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TenantProfileFormContent({
  tenantId,
  initialData,
}: {
  tenantId: string;
  initialData: any;
}) {
  const queryClient = useQueryClient();
  const logoFileRef = useRef<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [form, setForm] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    contactEmail: initialData.contactEmail || "",
    contactPhone: initialData.contactPhone || "",
    website: initialData.website || "",
    addressLine1: initialData.addressLine1 || "",
    addressLine2: initialData.addressLine2 || "",
    city: initialData.city || "",
    state: initialData.state || "",
    postalCode: initialData.postalCode || "",
    country: initialData.country || "",
    timezone: initialData.timezone || "UTC",
    currency: initialData.currency || "USD",
    taxId: initialData.taxId || "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateTenant(tenantId, formData),
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId] });
      setHasChanges(false);
      logoFileRef.current = null;
    },
    onError: (err: any) =>
      toast.error(getApiErrorMessage(err, "Failed to update profile.")),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB.");
      e.target.value = "";
      return;
    }
    logoFileRef.current = file;
    setLogoPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (logoFileRef.current) formData.append("logo", logoFileRef.current);
    mutate(formData);
  };

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setHasChanges(true);
  };

  const displayLogo = logoPreview || initialData.logoUrl;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="border-b bg-muted/30 px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Profile Details</h3>
      </div>

      <div className="space-y-8 p-6">
        {/* Logo Upload */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {displayLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayLogo}
                alt={initialData.name}
                className="size-24 rounded-xl object-cover border border-border shadow-sm"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
                <Building2 className="size-10" />
              </div>
            )}
            <label className="absolute -right-2 -bottom-2 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              <Camera className="size-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={isPending}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Center Logo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPG or PNG, up to 5MB. Square image recommended.
            </p>
            {logoPreview && (
              <button
                onClick={() => {
                  setLogoPreview(null);
                  logoFileRef.current = null;
                  setHasChanges(true);
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <X className="size-3" />
                Remove new image
              </button>
            )}
          </div>
        </div>

        {/* Identity */}
        <FormSection title="Identity" icon={Type}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Center Name
              </label>
              <input
                value={form.name}
                onChange={update("name")}
                disabled={isPending}
                className={inputClass}
                placeholder="e.g. Little Sprouts Daycare"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                disabled={isPending}
                className={inputClass}
                placeholder="little-sprouts"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Lowercase letters, numbers, and hyphens only.
              </p>
            </div>
          </div>
        </FormSection>

        {/* Contact */}
        <FormSection title="Contact" icon={Mail}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={update("contactEmail")}
                  disabled={isPending}
                  className={`${inputClass} pl-10`}
                  placeholder="admin@center.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={form.contactPhone}
                  onChange={update("contactPhone")}
                  disabled={isPending}
                  className={`${inputClass} pl-10`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={form.website}
                  onChange={update("website")}
                  disabled={isPending}
                  className={`${inputClass} pl-10`}
                  placeholder="https://www.center.com"
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Head Office" icon={MapPin}>
          <div className="space-y-3">
            <input
              value={form.addressLine1}
              onChange={update("addressLine1")}
              disabled={isPending}
              className={inputClass}
              placeholder="Street address"
            />
            <input
              value={form.addressLine2}
              onChange={update("addressLine2")}
              disabled={isPending}
              className={inputClass}
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                value={form.city}
                onChange={update("city")}
                disabled={isPending}
                className={inputClass}
                placeholder="City"
              />
              <input
                value={form.state}
                onChange={update("state")}
                disabled={isPending}
                className={inputClass}
                placeholder="State / Province"
              />
              <input
                value={form.postalCode}
                onChange={update("postalCode")}
                disabled={isPending}
                className={inputClass}
                placeholder="Postal code"
              />
              <input
                value={form.country}
                onChange={update("country")}
                disabled={isPending}
                className={inputClass}
                placeholder="Country"
              />
            </div>
          </div>
        </FormSection>

        {/* Preferences */}
        <FormSection title="Preferences" icon={Clock}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Timezone
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={form.timezone}
                  onChange={update("timezone")}
                  disabled={isPending}
                  className={`${inputClass} pl-10`}
                  placeholder="UTC"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={form.currency}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      currency: e.target.value.toUpperCase(),
                    }))
                  }
                  disabled={isPending}
                  maxLength={3}
                  className={`${inputClass} pl-10`}
                  placeholder="USD"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Tax ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={form.taxId}
                  onChange={update("taxId")}
                  disabled={isPending}
                  className={`${inputClass} pl-10`}
                  placeholder="EIN / VAT"
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => {
              setForm({
                name: initialData.name || "",
                slug: initialData.slug || "",
                contactEmail: initialData.contactEmail || "",
                contactPhone: initialData.contactPhone || "",
                website: initialData.website || "",
                addressLine1: initialData.addressLine1 || "",
                addressLine2: initialData.addressLine2 || "",
                city: initialData.city || "",
                state: initialData.state || "",
                postalCode: initialData.postalCode || "",
                country: initialData.country || "",
                timezone: initialData.timezone || "UTC",
                currency: initialData.currency || "USD",
                taxId: initialData.taxId || "",
              });
              setLogoPreview(null);
              logoFileRef.current = null;
              setHasChanges(false);
            }}
            disabled={isPending || !hasChanges}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !hasChanges}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            <Save className="size-3.5" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TenantProfileForm({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => getTenantById(tenantId).then((res) => res.data),
  });

  if (isLoading || !data) return <SkeletonForm />;

  return <TenantProfileFormContent tenantId={tenantId} initialData={data} />;
}