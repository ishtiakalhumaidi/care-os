import ClassroomDetailView from "@/components/dashboard/classrooms/ClassroomDetailView";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ClassroomDetailView
      classroomId={id}
      basePath="/center-admin/dashboard/classrooms-management"
      studentsBasePath="/center-admin/dashboard/students-management"
    />
  );
}