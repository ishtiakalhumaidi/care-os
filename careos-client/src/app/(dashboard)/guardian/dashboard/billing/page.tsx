import React from "react";
import GuardianBillingView from "@/components/dashboard/guardian/billing/GuardianBillingView";
import { getMe } from "@/services/user.services";
import { redirect } from "next/navigation";

export default async function GuardianBillingPage() {
  const user = await getMe();

  if (!user || user.role !== "GUARDIAN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Tuition & Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your payments. Split-custody math is calculated automatically based on your profile settings.
        </p>
      </div>

      <GuardianBillingView />
    </div>
  );
}