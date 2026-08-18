"use client";

import React from "react";
import { X } from "lucide-react";
import TeacherTimelineLogger from "./TeacherTimelineLogger";

export default function TeacherTimelineLoggerModal({
  childId,
  childName,
  onClose,
}: {
  childId: string;
  childName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
        
        <TeacherTimelineLogger 
          childId={childId} 
          childName={childName} 
          onSuccess={onClose} 
        />
      </div>
    </div>
  );
}