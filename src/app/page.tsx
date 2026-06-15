"use client";

import { useState } from "react";
import { AppHeader, type AppTab } from "@/components/AppHeader";
import { Dashboard } from "@/components/Dashboard";
import { HistoryView } from "@/components/HistoryView";
import { PricingForm } from "@/components/PricingForm";
import { ReceitasView } from "@/components/ReceitasView";
import type { AnalysisResult, BetResultado, PricingInput } from "@/lib/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>("new");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze(inputs: PricingInput[]) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha na análise.");
      }

      setResult(data.result);

      if (data.result) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado na análise.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSessionUpdate(data: {
    valorApostado: number | null;
    resultado: BetResultado | null;
  }) {
    setResult((current) =>
      current
        ? {
            ...current,
            valorApostado: data.valorApostado,
            resultado: data.resultado,
          }
        : null
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 sm:py-8">
        {activeTab === "new" && (
          <>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <PricingForm onAnalyze={handleAnalyze} isLoading={isLoading} />

            {result && (
              <Dashboard result={result} onSessionUpdate={handleSessionUpdate} />
            )}
          </>
        )}

        {activeTab === "history" && <HistoryView />}

        {activeTab === "receitas" && <ReceitasView />}
      </main>
    </div>
  );
}
