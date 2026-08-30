/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import ChildGallery from "./ChildGallery";
import Image from "next/image";
import { User } from "lucide-react";

export default function GuardianGalleryView({ 
  childrenProfiles, 
  currentUserRole 
}: { 
  childrenProfiles: any[];
  currentUserRole: string;
}) {
  const [activeChildId, setActiveChildId] = useState(childrenProfiles[0]?.child?.id);

  if (!childrenProfiles || childrenProfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground font-medium">No children linked to your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Selector Tabs */}
      {childrenProfiles.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {childrenProfiles.map(({ child }: any) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all ${
                activeChildId === child.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              {child.photoUrl ? (
                <Image 
                  src={child.photoUrl} 
                  alt={child.firstName} 
                  width={24} 
                  height={24} 
                  className="size-6 rounded-full object-cover" 
                />
              ) : (
                <div className={`flex size-6 items-center justify-center rounded-full ${
                  activeChildId === child.id ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
                }`}>
                  <User className="size-3.5" />
                </div>
              )}
              <span className="text-sm font-semibold">{child.firstName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Render the Active Gallery */}
      {activeChildId && (
        <ChildGallery 
          key={activeChildId} 
          childId={activeChildId} 
          currentUserRole={currentUserRole} 
        />
      )}
    </div>
  );
}