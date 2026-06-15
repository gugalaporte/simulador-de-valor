"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  id,
  checked,
  onCheckedChange,
  disabled,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-emerald-500" : "bg-slate-700"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
