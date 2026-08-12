"use client";

import React from "react";
import { X, Loader2, Baby } from "lucide-react";

interface IUnassignedChild {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export default function AddChildToClassroomModal({
  isOpen,
  onClose,
  unassignedChildren,
  isLoading,
  isSubmitting,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  unassignedChildren: IUnassignedChild[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSelect: (childId: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Add a child
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Showing enrolled children in this branch not yet assigned to a
          classroom.
        </p>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : unassignedChildren.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No unassigned children found in this branch.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {unassignedChildren.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onSelect(c.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {c.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.photoUrl}
                        alt={c.firstName}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Baby className="size-4" />
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {c.firstName} {c.lastName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}