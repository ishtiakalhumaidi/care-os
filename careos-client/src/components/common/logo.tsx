import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
        {/* Parent */}
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="currentColor"
          className="text-primary"
        />

        {/* Child */}
        <circle
          cx="20"
          cy="16"
          r="2.8"
          fill="currentColor"
          className="text-primary"
          opacity="0.75"
        />

        {/* Protective embrace */}
        <path
          d="M7 17C8.5 23 13 27 18.5 27C23.5 27 27.5 23.5 29 18"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>

      {/* Updated Text Rendering */}
      <span className="font-display text-xl font-bold tracking-tight">
        <span className="text-foreground ">Care</span>
        <span className="text-primary font-bold">OS</span>
      </span>
    </div>
  );
}
