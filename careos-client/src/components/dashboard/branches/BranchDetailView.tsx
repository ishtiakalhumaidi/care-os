/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBranchById } from "@/services/branch.services";
import { ArrowLeft, Building, School, Users } from "lucide-react";
import BranchActivityAuditStream from "../timeline/BranchActivityAuditStream"; // <-- Added Import

export default function BranchDetailView({
  branchId,
  basePath,
  classroomsBasePath,
}: {
  branchId: string;
  basePath: string;
  classroomsBasePath: string;
}) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["branches", branchId],
    queryFn: () => getBranchById(branchId).then((res) => res.data),
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const branch = data;
  const classrooms = branch.classrooms || [];

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.push(basePath)} 
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to branches
      </button>

      {/* Branch Header Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{branch.name}</h2>
            <p className="text-sm text-muted-foreground">{branch.address}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Classrooms (Takes up 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm h-fit">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <School className="size-4" />
                Classrooms ({classrooms.length})
              </h3>
            </div>
            
            {classrooms.length === 0 ? (
              <div className="rounded-md border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground">No classrooms at this branch yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {classrooms.map((c: any) => {
                  const enrolled = c._count?.children ?? 0;
                  const isFull = enrolled >= c.legalCapacity;
                  
                  return (
                    <li
                      key={c.id}
                      onClick={() => router.push(`${classroomsBasePath}/${c.id}`)}
                      className="flex cursor-pointer items-center justify-between py-4 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <School className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-base">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.ageGroup}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-0.5">Capacity</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isFull ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                            <Users className="size-3" />
                            {enrolled} / {c.legalCapacity} {isFull && " (Full)"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

     
        <div className="lg:col-span-1">
          <BranchActivityAuditStream branchId={branchId} />
        </div>
        
      </div>
    </div>
  );
}