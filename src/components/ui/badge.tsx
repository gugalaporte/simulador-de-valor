import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-slate-200 border border-slate-700",
        success: "bg-green-500/20 text-green-300 border border-green-500/40",
        warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
        danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        strong: "bg-violet-500/20 text-violet-200 border border-violet-400/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
