// import {
//   HydrationBoundary,
//   QueryClient,
//   dehydrate,
// } from "@tanstack/react-query";
// import { getMyClassroomById } from "@/services/classroom.services";
// import TeacherClassroomDetailView from "@/components/dashboard/teacher/TeacherClassroomDetailView";

import ClassroomAttendanceDetailView from "@/components/dashboard/teacher/ClassroomAttendanceDetailView";

// export default async function TeacherClassroomDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;
//   const queryClient = new QueryClient();

//   await queryClient.prefetchQuery({
//     queryKey: ["my-classroom", id],
//     queryFn: () => getMyClassroomById(id).then((res) => res.data),
//     staleTime: 1000 * 60,
//   });

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <TeacherClassroomDetailView classroomId={id} />
//     </HydrationBoundary>
//   );
// }




export default async function TeacherClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassroomAttendanceDetailView classroomId={id} />;
}