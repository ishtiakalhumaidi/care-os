"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Receipt } from "lucide-react";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => createInvoice(data),
    onSuccess: () => {
      toast.success("Invoice created successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      form.reset();
      setIsOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const extractChildren = () => {
    const rawData = childrenData?.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData?.data && Array.isArray(rawData.data)) return rawData.data; 
    return [];
  };
  
  const children = extractChildren();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="size-4" />
        New Invoice
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-lg p-6 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Receipt className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Create Child Invoice
                </h2>
                <p className="text-xs text-muted-foreground">
                  The system auto-splits this for guardians.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="childId"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Please select a student" : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Select Student
                    </label>
                    <select
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoadingChildren}
                    >
                      <option value="">-- Choose a student --</option>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {children.map((child: any) => (
                        <option key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}{" "}
                          {child.childCode ? `(${child.childCode})` : ""}
                        </option>
                      ))}
                    </select>
                    {field.state.meta.errors ? (
                      <p className="mt-1 text-xs text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="billingPeriodId"
                validators={{
                  onChange: ({ value }) =>
                    value.length < 3
                      ? "E.g., September 2026 Tuition"
                      : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Billing Period / Memo
                    </label>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., September Tuition"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {field.state.meta.errors ? (
                      <p className="mt-1 text-xs text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="amount"
                  validators={{
                    onChange: ({ value }) =>
                      Number(value) < 1 ? "Must be at least $1" : undefined,
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Total Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="500.00"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {field.state.meta.errors ? (
                        <p className="mt-1 text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
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
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {field.state.meta.errors ? (
                        <p className="mt-1 text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                      className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {(isSubmitting || isPending) && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Generate Invoice
                    </button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
