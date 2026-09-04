import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getMe } from "@/services/user.services";
import { getTenantById } from "@/services/tenant.services";
import { getPlans } from "@/services/plan.services";
import { redirect } from "next/navigation";
import TenantSettingsView from "@/components/dashboard/owner/billing/TenantSettingsView";
import CreateInvoiceDialog from "@/components/dashboard/owner/billing/CreateInvoiceDialog";
import TenantInvoicesTable from "@/components/dashboard/owner/billing/TenantInvoicesTable";

export default async function BillingPage() {
  const user = await getMe();
  if (!user) redirect("/login");

  const resolvedTenantId = user.tenantId as string;

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["tenants", resolvedTenantId],
      queryFn: () => getTenantById(resolvedTenantId).then((res) => res.data),
    }),
    queryClient.prefetchQuery({ queryKey: ["plans"], queryFn: getPlans }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Student Invoicing */}
        <section>
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Student Invoicing
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate tuition invoices. Costs auto-split for shared custody.
              </p>
            </div>
            <CreateInvoiceDialog />
          </div>
          <TenantInvoicesTable />
        </section>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Platform Subscription
            </span>
          </div>
        </div>

        {/* Center Subscription */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Center Subscription
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your CareOS plan, usage limits, and billing cycle.
            </p>
          </div>
          <TenantSettingsView tenantId={resolvedTenantId} />
        </section>
      </div>
    </HydrationBoundary>
  );
}