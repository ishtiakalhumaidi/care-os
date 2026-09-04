"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches, IBranch } from "@/services/branch.services";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Loader2,
  Plus,
  ChevronDown,
  Building2,
  Lock,
  AlertCircle,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import CreateBranchModal from "./CreateBranchModal";
import BranchRowActions from "./BranchRowActions";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function BranchesTable({
  initialQueryString,
  basePath,
}: {
  initialQueryString: string;
  basePath: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchTerm") || ""
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );
  const [showInactive, setShowInactive] = useState(
    searchParams.get("includeInactive") === "true"
  );
  const limit = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("searchTerm", debouncedSearchTerm);
    if (page > 1) params.set("page", page.toString());
    params.set("limit", limit.toString());
    params.set("sortBy", "createdAt");
    params.set("sortOrder", sortOrder);
    if (showInactive) params.set("includeInactive", "true");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchTerm, page, sortOrder, showInactive, router, pathname]);

  const apiParams = new URLSearchParams(searchParams.toString());
  apiParams.set("sortBy", "createdAt");
  apiParams.set("sortOrder", sortOrder);
  if (!apiParams.has("limit")) apiParams.set("limit", limit.toString());
  if (showInactive) apiParams.set("includeInactive", "true");

  const currentQueryString = apiParams.toString();

  const { data, isLoading } = useQuery({
    queryKey: ["branches", currentQueryString],
    queryFn: () => getBranches(currentQueryString),
  });

  const branches = data?.data || [];
  const meta = data?.meta;

  const lockedCount = branches.filter(
    (b: IBranch) => !b.isActive && !b.deletedAt
  ).length;

  return (
    <div className="space-y-6">
      {/* ─── Locked branches warning ─── */}
      {lockedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30"
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-medium">
              {lockedCount} branch{lockedCount > 1 ? "es are" : " is"} locked
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              Locked branches exceed your plan limit. Upgrade your plan or
              delete locked branches to free up slots.
            </p>
          </div>
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="h-11 appearance-none rounded-xl border border-border bg-card pl-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* ─── NEW: Show inactive toggle ─── */}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPage(1);
              }}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="flex items-center gap-1.5">
              <EyeOff className="size-3.5 text-muted-foreground" />
              Show locked
            </span>
          </label>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Add Branch
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Branch Name
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Address
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Phone
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Timezone
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Created
                </th>
                <th className="px-5 py-3.5 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="size-8 animate-spin" />
                      <p className="text-sm">Loading branches...</p>
                    </div>
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                        <Building2 className="size-7 text-muted-foreground opacity-50" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          No branches found
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {showInactive
                            ? "No branches match your search."
                            : "Adjust your search or create a new branch."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                branches.map((branch: IBranch, idx: number) => {
                  const isLocked = !branch.isActive && !branch.deletedAt;
                  const isDeleted = !!branch.deletedAt;

                  return (
                    <tr
                      key={branch.id}
                      onClick={() => router.push(`${basePath}/${branch.id}`)}
                      className={`cursor-pointer transition-colors ${
                        isLocked
                          ? "bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
                          : isDeleted
                          ? "bg-slate-50/50 opacity-60 hover:bg-slate-100/50"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {branch.name}
                          </span>
                          {isLocked && (
                            <Lock className="size-3.5 text-amber-600" />
                          )}
                        </div>
                      </td>
                      {/* ─── NEW: Status column ─── */}
                      <td className="px-5 py-4">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            Deleted
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Lock className="size-3" />
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block max-w-[200px] truncate text-muted-foreground">
                          {branch.address}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {branch.contactPhone || "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {branch.timezone || "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {format(new Date(branch.createdAt), "MMM d, yyyy")}
                      </td>
                      <td
                        className="px-5 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BranchRowActions branch={branch} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {meta && meta.total > limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * limit, meta.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{meta.total}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= meta.total}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      <CreateBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}