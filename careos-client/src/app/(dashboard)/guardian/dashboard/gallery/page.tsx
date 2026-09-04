import React from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/services/user.services";
import GuardianGalleryView from "@/components/dashboard/gallery/GuardianGalleryView";
import GalleryPageHeader from "@/components/dashboard/gallery/GalleryPageHeader";

export default async function GuardianGalleryPage() {
  const user = await getMe();

  if (!user || user.role !== "GUARDIAN") {
    redirect("/login");
  }

  const childrenProfiles = user.guardianProfile || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <GalleryPageHeader childCount={childrenProfiles.length} />
      <GuardianGalleryView
        childrenProfiles={childrenProfiles}
        currentUserRole={user.role}
      />
    </div>
  );
}