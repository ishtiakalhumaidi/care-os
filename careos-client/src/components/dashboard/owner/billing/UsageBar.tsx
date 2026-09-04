export default function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const pct = Math.min(100, (used / max) * 100);
  const isNearLimit = pct >= 80;
  const isOverLimit = pct >= 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={`font-medium tabular-nums ${
            isOverLimit
              ? "text-destructive"
              : isNearLimit
              ? "text-amber-600 dark:text-amber-400"
              : "text-foreground"
          }`}
        >
          {used} / {max}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverLimit
              ? "bg-destructive"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isNearLimit && !isOverLimit && (
        <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
          Approaching limit
        </p>
      )}
      {isOverLimit && (
        <p className="mt-1 text-[11px] text-destructive">
          Limit exceeded — upgrade required
        </p>
      )}
    </div>
  );
}