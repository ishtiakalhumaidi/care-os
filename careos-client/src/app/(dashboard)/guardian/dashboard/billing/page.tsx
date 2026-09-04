import React from "react";
import GuardianBillingView from "@/components/dashboard/guardian/billing/GuardianBillingView";
import BillingPageHeader from "@/components/dashboard/guardian/billing/BillingPageHeader";
import { getMe } from "@/services/user.services";
import { redirect } from "next/navigation";

export default async function GuardianBillingPage() {
  const user = await getMe();

  if (!user || user.role !== "GUARDIAN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <BillingPageHeader />
      <GuardianBillingView />
    </div>
  );
}