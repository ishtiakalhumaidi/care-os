/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/branch.services";
import { getInvitations } from "@/services/auth.services";
import { UserPlus, Mail, CheckCircle2, Clock, Users } from "lucide-react";
import InviteUserModal from "./InviteUserModal";
import InvitationsList from "./InvitationsList";

export default function TeamManagement() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: branchesData } = useQuery({
    queryKey: ["branches", "for-invite-select"],
    queryFn: () => getBranches("limit=100"),
  });

  const { data: invitesData } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => getInvitations("limit=50"),
  });

  const branches = (branchesData?.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
  }));

  const invitations = invitesData?.data || [];
  const total = invitations.length;
  const pending = invitations.filter((i: any) => i.status === "PENDING").length;
  const accepted = invitations.filter((i: any) => i.status === "ACCEPTED").length;

  const stats = [
    { label: "Total Invited", value: total, icon: <Users className="size-4 text-primary" /> },
    { label: "Pending", value: pending, icon: <Clock className="size-4 text-amber-500" /> },
    { label: "Accepted", value: accepted, icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Sent Invitations</h3>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        >
          <UserPlus className="size-4" />
          Invite Person
        </button>
      </div>

      <InvitationsList />

      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        branches={branches}
      />
    </div>
  );
}