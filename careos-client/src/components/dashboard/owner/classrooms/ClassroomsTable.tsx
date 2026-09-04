/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getClassrooms, IClassroom } from "@/services/classroom.services";
import { getBranches } from "@/services/branch.services";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Loader2,
  Plus,
  ChevronDown,
  School,
} from "lucide-react";
import CreateClassroomModal from "./CreateClassroomModal";
import ClassroomRowActions from "./ClassroomRowActions";

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

export default function ClassroomsTable({
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
  const limit = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("searchTerm", debouncedSearchTerm);
    if (page > 1) params.set("page", page.toString());
    params.set("limit", limit.toString());
    params.set("sortBy", "createdAt");
    params.set("sortOrder", sortOrder);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchTerm, page, sortOrder, router, pathname]);

  const apiParams = new URLSearchParams(searchParams.toString());
  apiParams.set("sortBy", "createdAt");
  apiParams.set("sortOrder", sortOrder);
  if (!apiParams.has("limit")) apiParams.set("limit", limit.toString());

  const currentQueryString = apiParams.toString();

  const { data, isLoading } = useQuery({
    queryKey: ["classrooms", currentQueryString],
    queryFn: () => getClassrooms(currentQueryString),
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches", "for-classroom-select"],
    queryFn: () => getBranches("limit=100"),
  });

  const classrooms = data?.data || [];
  const meta = data?.meta;
  const branches = (branchesData?.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="space-y-6">
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
              placeholder="Search classrooms..."
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
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Add Classroom
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
                  Classroom
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Branch
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Age Group
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Capacity
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ratio Limit
                </th>
                <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Children
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
                      <p className="text-sm">Loading classrooms...</p>
                    </div>
                  </td>
                </tr>
              ) : classrooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                        <School className="size-7 text-muted-foreground opacity-50" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          No classrooms found
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Adjust your search or create a new classroom.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                classrooms.map((classroom: IClassroom) => (
                  <tr
                    key={classroom.id}
                    onClick={() => router.push(`${basePath}/${classroom.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-foreground">
                        {classroom.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {classroom.branch?.name || "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {classroom.ageGroup}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {classroom.legalCapacity}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {classroom.ratioLimit}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {classroom._count?.children ?? 0}
                    </td>
                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ClassroomRowActions
                        classroom={classroom}
                        branches={branches}
                      />
                    </td>
                  </tr>
                ))
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

      <CreateClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branches={branches}
      />
    </div>
  );
}