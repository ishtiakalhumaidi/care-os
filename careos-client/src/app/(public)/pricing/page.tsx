import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getPlans, getPublicPlans } from "@/services/plan.services";
import PricingPage from "@/components/publicPages/PricingPage";
export const dynamic = "force-dynamic";

export default async function Pricing() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["plans"],
    queryFn:    getPublicPlans,
  });

  const initialPlans =
    (queryClient.getQueryData(["plans"]) as Awaited<
      ReturnType<typeof getPlans>
    >) || [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PricingPage initialPlans={initialPlans} />
    </HydrationBoundary>
  );
}
