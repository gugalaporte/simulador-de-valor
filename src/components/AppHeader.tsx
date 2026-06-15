"use client";

import { Activity, History, PlusCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "new" | "history" | "receitas";

interface AppHeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: typeof PlusCircle }[] = [
  { id: "new", label: "Análise", icon: PlusCircle },
  { id: "history", label: "Histórico", icon: History },
  { id: "receitas", label: "Receitas", icon: TrendingUp },
];

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 -mx-4 border-b border-slate-800/80 bg-slate-950/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400 sm:text-xs">
              Análise Quantitativa
            </p>
            <h1 className="text-lg font-bold text-slate-50 sm:text-xl">
              Comparador de Precificações
            </h1>
          </div>
        </div>

        <nav className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex h-11 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors sm:h-12 sm:gap-2 sm:text-sm",
                  isActive && tab.id === "new" && "bg-emerald-500 text-slate-950",
                  isActive && tab.id === "history" && "bg-cyan-500 text-slate-950",
                  isActive && tab.id === "receitas" && "bg-amber-500 text-slate-950",
                  !isActive && "text-slate-400 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
