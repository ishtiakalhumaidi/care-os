/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import type { IDashboardData } from "@/services/dashboard.services";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Ban,
  FileText,
  DollarSign
} from "lucide-react";
import RegisterChildModal from "./guardian/RegisterChildModal";

export default function GuardianDashboardContent({ data }: { data: IDashboardData }) {
  // Destructure the categorized children from the updated backend service
  const { 
    enrolled = [], 
    pending = [], 
    suspended = [], 
    rejected = [] 
  } = data.details.children as any || {};

  const hasAnyChildren = 
    enrolled.length > 0 || pending.length > 0 || suspended.length > 0 || rejected.length > 0;

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Helper to render individual child cards with contextual styling based on their status
  const renderChildCard = (child: any, category: "enrolled" | "pending" | "suspended" | "rejected") => {
    const isRejected = category === "rejected";
    const Wrapper: any = isRejected ? "div" : Link;
    const wrapperProps = isRejected ? {} : { href: `/guardian/dashboard/children/${child.id}` };

    const styles = {
      enrolled: "hover:outline-primary/50 border-border bg-card",
      pending: "hover:outline-blue-400/50 border-blue-100 bg-blue-50/30",
      suspended: "hover:outline-amber-400/50 border-amber-100 bg-amber-50/30",
      rejected: "border-muted bg-muted/30 opacity-75 grayscale-[0.5] cursor-not-allowed",
    };

    return (
      <Wrapper {...wrapperProps} key={child.id}>
        <div className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-all hover:outline-2 ${styles[category]}`}>
          {/* Avatar */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted border border-background shadow-sm">
            {child.photoUrl ? (
              <Image
                width={56}
                height={56}
                src={child.photoUrl}
                alt={child.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                {child.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{child.name}</p>
              
              {/* Contextual Status Badge */}
              {category === "enrolled" && (
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  child.todayAttendance === "CHECKED_IN"
                    ? "bg-green-100 text-green-700"
                    : child.todayAttendance === "CHECKED_OUT"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {child.todayAttendance.replace("_", " ")}
                </span>
              )}
              {category === "pending" && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Under Review
                </span>
              )}
              {category === "suspended" && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Suspended
                </span>
              )}
              {category === "rejected" && (
                <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Declined
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {child.childCode && <span>ID: {child.childCode}</span>}
              {child.classroom && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span>{child.classroom}</span>
                </>
              )}
            </div>

            {/* Actionable Metrics (Only relevant for non-rejected children) */}
            {!isRejected && (
              <div className="flex items-center gap-3 pt-2">
                {child.pendingDocsCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                    <FileText className="size-3" />
                    {child.pendingDocsCount} doc{child.pendingDocsCount > 1 ? "s" : ""} to sign
                  </span>
                )}
                {child.unpaidTotal > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                    <DollarSign className="size-3" />
                    ${child.unpaidTotal.toFixed(2)} due
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Wrapper>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((m, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Children Directory */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Children Directory</h3>
            <p className="text-sm text-muted-foreground">Manage your enrolled children and applications</p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Add Child
          </button>
        </div>

        {!hasAnyChildren ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Plus className="size-6 text-primary" />
            </div>
            <h4 className="text-lg font-semibold">No Children Linked</h4>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              You haven&apos;t submitted any applications or linked any children to your account yet.
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-6 font-semibold text-primary hover:underline"
            >
              Start an application &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enrolled Section */}
            {enrolled.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserCheck className="size-4 text-green-600" /> Active Enrollments
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {enrolled.map((child: any) => renderChildCard(child, "enrolled"))}
                </div>
              </div>
            )}

            {/* Pending Section */}
            {pending.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="size-4 text-blue-500" /> Pending Applications
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {pending.map((child: any) => renderChildCard(child, "pending"))}
                </div>
              </div>
            )}

            {/* Suspended Section */}
            {suspended.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertTriangle className="size-4 text-amber-500" /> Suspended
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {suspended.map((child: any) => renderChildCard(child, "suspended"))}
                </div>
              </div>
            )}

            {/* Rejected Section */}
            {rejected.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Ban className="size-4 text-destructive" /> Declined Applications
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {rejected.map((child: any) => renderChildCard(child, "rejected"))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Broadcasts */}
      {data.details.broadcasts?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">Announcements</h3>
          <div className="space-y-4">
            {data.details.broadcasts.map((b: any) => (
              <div key={b.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{b.title}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      b.priority === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : b.priority === "WARNING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {b.priority}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{b.body}</p>
                <p className="mt-2 text-xs text-muted-foreground font-medium">
                  {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      {data.details.conversations?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">Recent Conversations</h3>
          <div className="space-y-3">
            {data.details.conversations.map((conv: any) => (
              <div
                key={conv.id}
                className="flex items-center justify-between rounded-xl border border-transparent bg-muted/30 p-3 transition-colors hover:border-border hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {conv.isDirectMessage ? "Direct Message" : "Classroom Chat"}
                  </p>
                  {conv.messages?.[0] && (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                {conv.messages?.[0] && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {new Date(conv.messages[0].createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <RegisterChildModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}
    </div>
  );
}