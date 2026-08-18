/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createShift } from "@/services/schedule.services";
import { getUsers } from "@/services/user.services"; 
import { getClassrooms } from "@/services/classroom.services";

export default function CreateShiftModal({ branchId, onClose }: { branchId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    userId: "",
    classroomId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "16:00",
    isSubstitute: false,
  });

  // 1. Fetch Teachers for this branch
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["users", "branch", branchId, "TEACHER"],
    queryFn: () => getUsers(`branchId=${branchId}&role=TEACHER`),
  });

  // 2. Fetch Classrooms for this branch
  const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ["classrooms", "branch", branchId],
    queryFn: () => getClassrooms(`branchId=${branchId}`),
  });

  const teachers = teachersData?.data || [];
  const classrooms = classroomsData?.data || [];

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) => createShift(payload),
    onSuccess: () => {
      toast.success("Shift assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["schedules", "weekly", branchId] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.classroomId) {
      toast.error("Please select both a teacher and a classroom");
      return;
    }

    const startIso = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endIso = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

    mutate({
      userId: formData.userId,
      classroomId: formData.classroomId,
      startTime: startIso,
      endTime: endIso,
      isSubstitute: formData.isSubstitute,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Assign Shift</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted text-muted-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* TEACHER SELECTION */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Teacher</label>
            <select 
              required 
              value={formData.userId} 
              onChange={e => setFormData({...formData, userId: e.target.value})} 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              disabled={isLoadingTeachers}
            >
              <option value="">{isLoadingTeachers ? "Loading teachers..." : "Select a teacher..."}</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          {/* CLASSROOM SELECTION */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Classroom</label>
            <select 
              required 
              value={formData.classroomId} 
              onChange={e => setFormData({...formData, classroomId: e.target.value})} 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              disabled={isLoadingClassrooms}
            >
              <option value="">{isLoadingClassrooms ? "Loading classrooms..." : "Select a classroom..."}</option>
              {classrooms.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Date</label>
            <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Start Time</label>
              <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">End Time</label>
              <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={formData.isSubstitute} onChange={e => setFormData({...formData, isSubstitute: e.target.checked})} className="rounded border-input text-primary focus:ring-primary" />
            <span className="text-sm font-medium text-foreground">Mark as Substitute Shift</span>
          </label>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending || isLoadingTeachers || isLoadingClassrooms} className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}