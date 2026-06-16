"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Clock, History, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalBetDetail } from "@/components/PersonalBetDetail";
import { Dashboard } from "@/components/Dashboard";
import { SessionFlagsBadges } from "@/components/SessionFlagsBadges";
import {
  getClassificacaoBadgeVariant,
  getClassificacaoUpsideColor,
} from "@/lib/classifications";
import type { AnalysisResult, BetResultado, SessionMeta } from "@/lib/types";
import {
  filterHistorySessions,
  type HistoryFilter,
  type HistorySession,
} from "@/lib/history";
import { cn, formatCurrency, formatDateTime, formatOdd, formatPercent } from "@/lib/utils";

function ResultadoBadge({ resultado }: { resultado: BetResultado | null }) {
  if (!resultado) return null;

  return (
    <Badge variant={resultado === "green" ? "success" : "danger"}>
      {resultado === "green" ? "Green" : "Red"}
    </Badge>
  );
}

const historyFilters: { id: HistoryFilter; label: string }[] = [
  { id: "tudo", label: "Tudo" },
  { id: "analises", label: "Análises registradas" },
  { id: "em_andamento", label: "Apostas em andamento" },
  { id: "finalizadas", label: "Apostas finalizadas" },
];

export function HistoryView() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("tudo");
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedPersonalBet, setSelectedPersonalBet] =
    useState<SessionMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao carregar histórico.");
      }

      setSessions(data.sessions ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar histórico."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function openSession(sessionId: string) {
    setIsLoadingDetail(true);
    setError(null);

    try {
      const response = await fetch(`/api/history?sessionId=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao carregar análise.");
      }

      if (data.personalBet) {
        setSelectedPersonalBet(data.personalBet);
        setSelectedResult(null);
      } else {
        setSelectedResult(data.result);
        setSelectedPersonalBet(null);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar análise."
      );
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function handleSessionUpdate(data: {
    titulo?: string | null;
    valorApostado?: number | null;
    resultado?: BetResultado | null;
  }) {
    if (!selectedResult) return;

    setSelectedResult({
      ...selectedResult,
      ...(data.titulo !== undefined && { titulo: data.titulo }),
      ...(data.valorApostado !== undefined && { valorApostado: data.valorApostado }),
      ...(data.resultado !== undefined && { resultado: data.resultado }),
    });

    setSessions((current) =>
      current.map((session) =>
        session.sessionId === selectedResult.sessionId
          ? {
              ...session,
              ...(data.titulo !== undefined && { titulo: data.titulo }),
              ...(data.valorApostado !== undefined && {
                valorApostado: data.valorApostado,
              }),
              ...(data.resultado !== undefined && { resultado: data.resultado }),
            }
          : session
      )
    );
  }

  function handlePersonalBetUpdate(bet: SessionMeta) {
    setSelectedPersonalBet(bet);
    setSessions((current) =>
      current.map((session) =>
        session.sessionId === bet.sessionId
          ? {
              ...session,
              titulo: bet.titulo,
              valorApostado: bet.valorApostado,
              oddAposta: bet.oddAposta,
              resultado: bet.resultado,
              melhorPreco: {
                fonte: bet.titulo?.trim() || "Análise Pessoal",
                odd: bet.oddAposta ?? session.melhorPreco.odd,
              },
            }
          : session
      )
    );
  }

  if (selectedPersonalBet) {
    return (
      <PersonalBetDetail
        bet={selectedPersonalBet}
        onBack={() => setSelectedPersonalBet(null)}
        onUpdated={handlePersonalBetUpdate}
      />
    );
  }

  if (selectedResult) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => setSelectedResult(null)}
          className="w-full sm:w-auto"
        >
          ← Voltar ao histórico
        </Button>
        <Dashboard
          result={selectedResult}
          titleEditable
          onSessionUpdate={handleSessionUpdate}
        />
      </div>
    );
  }

  const filteredSessions = filterHistorySessions(sessions, activeFilter);

  return (
    <div className="space-y-4">
      <Card className="border-slate-800/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-base">Análises Anteriores</CardTitle>
          </div>
          <p className="text-sm text-slate-400">
            Consulte e edite apostas salvas anteriormente.
          </p>
        </CardHeader>
      </Card>

      {!isLoading && sessions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {historyFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                activeFilter === filter.id
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-300"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando histórico...
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <Card className="border-slate-800/80">
          <CardContent className="py-10 text-center text-sm text-slate-400">
            Nenhuma análise salva ainda.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length > 0 && filteredSessions.length === 0 && (
        <Card className="border-slate-800/80">
          <CardContent className="py-10 text-center text-sm text-slate-400">
            Nenhum item encontrado para este filtro.
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredSessions.length > 0 && (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <button
              key={session.sessionId}
              type="button"
              onClick={() => openSession(session.sessionId)}
              disabled={isLoadingDetail}
              className={cn(
                "w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left transition-colors hover:border-slate-700 hover:bg-slate-900 active:scale-[0.99] disabled:opacity-60",
                !session.analisePessoal &&
                  session.maiorUpside.classificacao === "Muito Forte" &&
                  "border-violet-500/30",
                session.analisePessoal && "border-sky-500/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateTime(session.createdAt)}
                    <ResultadoBadge resultado={session.resultado} />
                    {session.analisePessoal && (
                      <Badge variant="default">Análise Pessoal</Badge>
                    )}
                    <SessionFlagsBadges
                      impulso25Plus={session.impulso25Plus}
                      superOdd={session.superOdd}
                    />
                  </div>
                  <p className="font-medium text-slate-100">
                    {session.titulo ??
                      (session.analisePessoal
                        ? "Análise Pessoal"
                        : session.fontes.join(" · "))}
                  </p>
                  {session.titulo && session.fontes.length > 0 && (
                    <p className="text-sm text-slate-400">
                      {session.fontes.join(" · ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm">
                    {session.analisePessoal ? (
                      <>
                        <span className="text-slate-400">
                          Odd:{" "}
                          <span className="font-mono text-emerald-400">
                            {formatOdd(session.oddAposta ?? session.melhorPreco.odd)}
                          </span>
                        </span>
                        {session.valorApostado !== null && (
                          <span className="text-slate-400">
                            Apostado:{" "}
                            <span className="font-mono text-amber-300">
                              {formatCurrency(session.valorApostado)}
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                    <span className="text-slate-400">
                      Melhor:{" "}
                      <span className="font-mono text-emerald-400">
                        {session.melhorPreco.fonte} ({formatOdd(session.melhorPreco.odd)})
                      </span>
                    </span>
                    <span className="text-slate-400">
                      Upside:{" "}
                      <span
                        className={cn(
                          "font-mono",
                          getClassificacaoUpsideColor(session.maiorUpside.classificacao)
                        )}
                      >
                        {formatPercent(session.maiorUpside.upside)}
                      </span>
                      <Badge
                        variant={getClassificacaoBadgeVariant(
                          session.maiorUpside.classificacao
                        )}
                        className="ml-2"
                      >
                        {session.maiorUpside.classificacao}
                      </Badge>
                    </span>
                    {session.valorApostado !== null && (
                      <span className="text-slate-400">
                        Apostado:{" "}
                        <span className="font-mono text-amber-300">
                          {formatCurrency(session.valorApostado)}
                        </span>
                      </span>
                    )}
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
