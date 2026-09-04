import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getMe } from "@/services/user.services";
import { redirect } from "next/navigation";
import { getTenantInvoicesOverview } from "@/services/billing.services"; 


import CreateInvoiceDialog from "@/components/dashboard/owner/billing/CreateInvoiceDialog";
import TenantInvoicesTable from "@/components/dashboard/owner/billing/TenantInvoicesTable";

export default async function BranchBillingPage() {
  const user = await getMe();
  if (!user) redirect("/login");

  if (user.role !== "CENTER_ADMIN" || !user.branch!.id) {
    redirect("/dashboard");
  }

  const queryClient = new QueryClient();
  
  await Promise.all([
    queryClient.prefetchQuery({ 
      queryKey: ["tenant-invoices"], 
      queryFn: () => getTenantInvoicesOverview() 
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Branch Invoicing */}
        <section>
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Branch Billing
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate tuition invoices for children in your branch. Costs auto-split for shared custody.
              </p>
            </div>
            <CreateInvoiceDialog />
          </div>
          <TenantInvoicesTable />
        </section>
      </div>
    </HydrationBoundary>
  );
}