import { Loader2 } from "lucide-react";

export default function DashboardLoading({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This will just take a moment
        </p>
      </div>

      <div className="mt-4 w-full max-w-2xl space-y-3 px-4">
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}