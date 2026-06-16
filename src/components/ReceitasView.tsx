"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Layers,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClassificacaoBadgeVariant } from "@/lib/classifications";
import type {
  LucroPorClassificacao,
  LucroPorMarcador,
  ReceitasMarcador,
  ReceitasStats,
} from "@/lib/receitas";
import { cn, formatCurrency, formatDateTime, formatPercent } from "@/lib/utils";

export function ReceitasView() {
  const [stats, setStats] = useState<ReceitasStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/receitas");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao carregar receitas.");
      }

      setStats(data.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar receitas."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando receitas...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!stats) return null;

  const lucroPositivo = stats.lucroTotal >= 0;

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "border-slate-800/80",
          lucroPositivo ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-base">Lucro Total</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "font-mono text-3xl font-bold",
              lucroPositivo ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {formatCurrency(stats.lucroTotal)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            ROI: {formatPercent(stats.roi)}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Resumo
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Wallet}
            label="Total Apostado"
            value={formatCurrency(stats.totalApostado)}
            color="text-cyan-400"
          />
          <MetricCard
            icon={Target}
            label="Taxa de Acerto"
            value={formatPercent(stats.taxaAcerto)}
            color="text-violet-400"
          />
          <MetricCard
            icon={ArrowUpRight}
            label="Greens"
            value={String(stats.greens)}
            color="text-emerald-400"
          />
          <MetricCard
            icon={ArrowDownRight}
            label="Reds"
            value={String(stats.reds)}
            color="text-rose-400"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Detalhes
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem label="Apostas resolvidas" value={String(stats.totalApostasResolvidas)} />
          <DetailItem label="Apostas pendentes" value={String(stats.pendentes)} />
          <DetailItem
            label="Média por aposta"
            value={formatCurrency(stats.mediaLucroPorAposta)}
          />
          <DetailItem label="Unidade" value={formatCurrency(stats.unidade)} />
        </div>
      </section>

      {stats.lucroPorClassificacao.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Lucro por Classificação
          </h2>
          <div className="space-y-2">
            {stats.lucroPorClassificacao.map((item) => (
              <ClassificacaoCard key={item.classificacao} item={item} />
            ))}
          </div>
        </section>
      )}

      {stats.lucroPorMarcador.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Lucro por Tipo de Aposta
          </h2>
          <div className="space-y-2">
            {stats.lucroPorMarcador.map((item) => (
              <MarcadorCard key={item.marcador} item={item} />
            ))}
          </div>
        </section>
      )}

      {stats.lucroPorFonte.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Lucro por Casa
          </h2>
          <div className="space-y-2">
            {stats.lucroPorFonte.map((item) => (
              <Card key={item.fonte} className="border-slate-800/80">
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-100">{item.fonte}</p>
                    <p className="text-xs text-slate-500">{item.apostas} apostas</p>
                  </div>
                  <p
                    className={cn(
                      "font-mono font-semibold",
                      item.lucro >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatCurrency(item.lucro)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {stats.apostasRecentes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Apostas Recentes
          </h2>
          <div className="space-y-2">
            {stats.apostasRecentes.map((aposta) => (
              <Card key={aposta.sessionId} className="border-slate-800/80">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-100">{aposta.fonte}</p>
                      <Badge variant={aposta.resultado === "green" ? "success" : "danger"}>
                        {aposta.resultado === "green" ? "Green" : "Red"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(aposta.createdAt)} · Odd {aposta.odd.toFixed(2)} ·{" "}
                      {formatCurrency(aposta.valorApostado)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 font-mono font-semibold",
                      aposta.lucro >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatCurrency(aposta.lucro)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {stats.totalApostasResolvidas === 0 && stats.pendentes === 0 && (
        <Card className="border-slate-800/80">
          <CardContent className="py-10 text-center text-sm text-slate-400">
            Registre valor apostado e resultado Green/Red nas análises para ver as receitas.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClassificacaoCard({ item }: { item: LucroPorClassificacao }) {
  return (
    <Card className="border-slate-800/80">
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" />
            <Badge variant={getClassificacaoBadgeVariant(item.classificacao)}>
              {item.classificacao}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {item.apostas} apostas · {item.greens} greens · Acerto{" "}
            {formatPercent(item.taxaAcerto)}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 font-mono font-semibold",
            item.lucro >= 0 ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {formatCurrency(item.lucro)}
        </p>
      </CardContent>
    </Card>
  );
}

function getMarcadorBadgeVariant(
  marcador: ReceitasMarcador
): "default" | "warning" | "success" | "strong" | "danger" {
  switch (marcador) {
    case "Odd Aumentada":
      return "strong";
    case "Impulso 25%+":
      return "warning";
    default:
      return "default";
  }
}

function MarcadorCard({ item }: { item: LucroPorMarcador }) {
  return (
    <Card className="border-slate-800/80">
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div className="space-y-1">
          <Badge variant={getMarcadorBadgeVariant(item.marcador)}>
            {item.marcador}
          </Badge>
          <p className="text-xs text-slate-500">
            {item.apostas} apostas · {item.greens} greens · Acerto{" "}
            {formatPercent(item.taxaAcerto)}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 font-mono font-semibold",
            item.lucro >= 0 ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {formatCurrency(item.lucro)}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="border-slate-800/80">
      <CardContent className="space-y-1 py-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        </div>
        <p className="font-mono text-lg font-semibold text-slate-100">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-mono text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}
