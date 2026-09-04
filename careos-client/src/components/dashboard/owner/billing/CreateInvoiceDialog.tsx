/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Receipt,
  X,
  Calendar,
  DollarSign,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { createInvoice } from "@/services/billing.services";
import { getApiErrorMessage } from "@/lib/errorUtils";
import { getChildren } from "@/services/child.services";

export default function CreateInvoiceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: childrenData, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children-list", "enrolled"],
    queryFn: () => getChildren("status=ENROLLED&limit=1000"),
    enabled: isOpen,
  });

  const { mutate: handleCreateInvoice, isPending } = useMutation({
    mutationFn: (data: any) => createInvoice(data),
    onSuccess: () => {
      toast.success("Invoice created successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      form.reset();
      setIsOpen(false);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to create invoice"));
    },
  });

  const form = useForm({
    defaultValues: {
      childId: "",
      billingPeriodId: "",
      amount: "",
      dueDate: "",
    },
    onSubmit: async ({ value }) => {
      handleCreateInvoice({
        ...value,
        amount: Number(value.amount),
        dueDate: new Date(value.dueDate).toISOString(),
      });
    },
  });

  const children = (() => {
    const raw = childrenData?.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  })();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
      >
        <Plus className="size-4" />
        New Invoice
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Create Invoice
              </h3>
              <p className="text-xs text-muted-foreground">
                Auto-split across guardians
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5 p-6"
        >
          {/* Student */}
          <form.Field
            name="childId"
            validators={{
              onChange: ({ value }) =>
                !value ? "Please select a student" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <User className="size-3.5" />
                  Student
                </label>
                <div className="relative">
                  <select
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoadingChildren || isPending}
                    className="w-full appearance-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingChildren ? "Loading..." : "Select a student"}
                    </option>
                    {children.map((child: any) => (
                      <option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                        {child.childCode ? ` · ${child.childCode}` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {field.state.meta.errors?.[0] && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Billing Period */}
          <form.Field
            name="billingPeriodId"
            validators={{
              onChange: ({ value }) =>
                value.length < 3 ? "Enter a billing period name" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <FileText className="size-3.5" />
                  Billing Period / Memo
                </label>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. September 2026 Tuition"
                  disabled={isPending}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />
                {field.state.meta.errors?.[0] && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Amount + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 1 ? "Minimum $1" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <DollarSign className="size-3.5" />
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="500.00"
                      disabled={isPending}
                      className="w-full rounded-lg border border-input bg-background py-2.5 pl-7 pr-3.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                    />
                  </div>
                  {field.state.meta.errors?.[0] && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3" />
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="dueDate"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Due date is required" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <Calendar className="size-3.5" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3" />
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {(isSubmitting || isPending) && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  {isPending ? "Creating..." : "Generate Invoice"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}