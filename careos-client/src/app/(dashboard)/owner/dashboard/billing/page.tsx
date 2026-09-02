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
      <div className="space-y-10 max-w-6xl mx-auto">
        
        {/* Guardian Tuition Invoicing */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Student Invoicing</h2>
              <p className="text-sm text-muted-foreground">Generate tuition invoices. The system will automatically split costs for shared custody.</p>
            </div>
            <CreateInvoiceDialog />
          </div>
          
          <TenantInvoicesTable />
        </div>

        <hr className="border-border" />

        {/*  Center SaaS Subscription */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Center Subscription</h2>
            <p className="text-sm text-muted-foreground">Manage your CareOS platform usage and tier limits.</p>
          </div>
          <TenantSettingsView tenantId={resolvedTenantId} />
        </div>

      </div>
    </HydrationBoundary>
  );
}