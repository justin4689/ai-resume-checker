import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight tabular",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--border)]",
        accent: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        success: "bg-[var(--accent-soft)] text-[var(--success)]",
        warning: "bg-[#FBF1E2] text-[var(--warning)]",
        danger: "bg-[#F8E3E0] text-[var(--danger)]",
        ink: "bg-[var(--ink)] text-[var(--bg)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
