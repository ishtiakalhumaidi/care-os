import { getMe } from "@/services/user.services";
import { redirect } from "next/navigation";
import BranchDetailView from "@/components/dashboard/branches/BranchDetailView";

export default async function CenterAdminBranchPage() {
  const user = await getMe();
  if (!user || !user.branch?.id) redirect("/login");

  return (
    <BranchDetailView
      branchId={user.branch.id}
      basePath="/center-admin/dashboard/branch"
      classroomsBasePath="/center-admin/dashboard/classrooms-management"
    />
  );
}