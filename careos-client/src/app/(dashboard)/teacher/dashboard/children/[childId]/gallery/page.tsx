import React from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/services/user.services";
import ChildGallery from "@/components/dashboard/gallery/ChildGallery";

export default async function TeacherChildGalleryPage(
  props: { params: Promise<{ childId: string }> } 
) {
  const params = await props.params; 
  const childId = params.childId;

  const user = await getMe();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Gallery & Media</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage photos for this student.
        </p>
      </div>

      <ChildGallery 
        childId={childId} 
        currentUserRole={user.role} 
      />
    </div>
  );
}
