import React from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/services/user.services";
import GuardianGalleryView from "@/components/dashboard/gallery/GuardianGalleryView";

export default async function GuardianGalleryPage() {
  const user = await getMe();

  if (!user  user.role !== "GUARDIAN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Media Gallery</h2>
        <p className="text-sm text-muted-foreground">
          View photos and moments shared by the teaching staff.
        </p>
      </div>

      <GuardianGalleryView 
        childrenProfiles={user.guardianProfile  []} 
        currentUserRole={user.role} 
      />
    </div>
  );
}
