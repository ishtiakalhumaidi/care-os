import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getMyClassrooms } from "@/services/classroom.services";
import MyClassroomView from "@/components/dashboard/teacher/MyClassroomView";

export default async function MyClassroomPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["my-classrooms"],
    queryFn: getMyClassrooms,
    staleTime: 1000 * 60,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyClassroomView />
    </HydrationBoundary>
  );
}
