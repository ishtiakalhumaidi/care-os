/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getChildren, IChild } from "@/services/child.services";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Loader2,
  Baby,
  Check,
  X as XIcon,
  Search,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import ApproveChildModal from "./ApproveChildModal";
import RejectChildModal from "./RejectChildModal";

const tabs = [
  { label: "Applied", value: "APPLIED", icon: Clock },
  { label: "Enrolled", value: "ENROLLED", icon: UserCheck },
  { label: "Suspended", value: "SUSPENDED", icon: UserX },
  { label: "Rejected", value: "REJECTED", icon: XIcon },
] as const;

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    APPLIED: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    WAITLISTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    ENROLLED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    SUSPENDED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
    REJECTED: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800",
    GRADUATED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900",
    ARCHIVED: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config[status] || config.APPLIED}`}
    >
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}

/* ─── Avatar ─── */
function Avatar({ child }: { child: IChild }) {
  const initial = (child.firstName?.[0] || child.lastName?.[0] || "?").toUpperCase();
  if (child.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={child.photoUrl}
        alt={`${child.firstName} ${child.lastName}`}
        className="size-10 rounded-full object-cover ring-2 ring-border"
      />
    );
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-border">
      {initial}
    </div>
  );
}

/* ─── Skeleton Row ─── */
function SkeletonRow({ hasActions }: { hasActions: boolean }) {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted" />
            <div className="h-3 w-20 rounded-md bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded-md bg-muted" /></td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded-md bg-muted" /></td>
      <td className="px-4 py-4"><div className="h-5 w-20 rounded-full bg-muted" /></td>
      {hasActions && <td className="px-4 py-4"><div className="h-8 w-32 rounded-md bg-muted" /></td>}
    </tr>
  );
}

/* ─── Main Component ─── */
export default function StudentsTable({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("APPLIED");
  const [approveTarget, setApproveTarget] = useState<IChild | null>(null);
  const [rejectTarget, setRejectTarget] = useState<IChild | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["children", `status=${activeTab}`, debouncedSearch, sortOrder],
    queryFn: () =>
      getChildren(
        `status=${activeTab}&limit=50&sortBy=createdAt&sortOrder=${sortOrder}${debouncedSearch ? `&searchTerm=${encodeURIComponent(debouncedSearch)}` : ""}`,
      ),
  });

  const children: IChild[] = data?.data || [];
  const showActions = activeTab === "APPLIED";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? "text-primary" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-[260px]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Branch
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Classroom
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                {showActions && (
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <SkeletonRow hasActions={showActions} />
                  <SkeletonRow hasActions={showActions} />
                  <SkeletonRow hasActions={showActions} />
                  <SkeletonRow hasActions={showActions} />
                  <SkeletonRow hasActions={showActions} />
                </>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 5 : 4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Baby className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          No students found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {debouncedSearch
                            ? "Try adjusting your search terms."
                            : "Students will appear here once added."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                children.map((child) => (
                  <tr
                    key={child.id}
                    onClick={() => router.push(`${basePath}/${child.id}`)}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar child={child} />
                        <div>
                          <p className="font-medium text-foreground">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {child.childCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {child.branch?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {child.classroom?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={child.status} />
                    </td>
                    {showActions && (
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setApproveTarget(child)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 transition-colors"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectTarget(child)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 transition-colors"
                          >
                            <XIcon className="size-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && children.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Showing {children.length} {children.length === 1 ? "student" : "students"}
            {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
          </div>
        )}
      </div>

      {approveTarget && (
        <ApproveChildModal
          isOpen={!!approveTarget}
          onClose={() => setApproveTarget(null)}
          child={approveTarget}
        />
      )}
      {rejectTarget && (
        <RejectChildModal
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          child={rejectTarget}
        />
      )}
    </div>
  );
}