import type { ReactNode } from "react";
import { Crown, Gauge, Scale, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOportunidadeBadgeVariant,
  getOportunidadeColor,
} from "@/lib/classifications";
import type { AnalysisResult } from "@/lib/types";
import { formatOdd, formatPercent, formatValorRelativo } from "@/lib/utils";

interface ExecutiveSummaryProps {
  result: AnalysisResult;
}

const summaryItems = [
  {
    key: "score",
    label: "Score de Oportunidade",
    icon: Gauge,
    color: "text-violet-400",
  },
  {
    key: "melhor",
    label: "Melhor Preço",
    icon: Crown,
    color: "text-amber-400",
  },
  {
    key: "consenso",
    label: "Consenso de Mercado",
    icon: Target,
    color: "text-cyan-400",
  },
  {
    key: "upside",
    label: "Maior Upside",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    key: "valorRelativo",
    label: "Valor Relativo",
    icon: Scale,
    color: "text-orange-400",
  },
] as const;

export function ExecutiveSummary({ result }: ExecutiveSummaryProps) {
  const melhor = result.melhorOportunidade;
  const valorRelativo = result.maiorValorRelativo;

  const values: Record<string, ReactNode> = {
    score: (
      <div className="space-y-1">
        <p className="font-mono text-lg font-semibold text-slate-100">
          {melhor.oportunidadeScore}/100
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">{melhor.fonte}</span>
          <Badge variant={getOportunidadeBadgeVariant(melhor.oportunidadeClassificacao)}>
            {melhor.oportunidadeClassificacao}
          </Badge>
        </div>
      </div>
    ),
    melhor: `${result.melhorPreco.fonte} (${formatOdd(result.melhorPreco.odd)})`,
    consenso: `${formatPercent(result.consensoProbabilidade)} · Odd ${formatOdd(result.consensoOdd)}`,
    upside: `${result.maiorUpside.fonte} (${formatPercent(result.maiorUpside.upside)})`,
    valorRelativo: (
      <div className="space-y-1">
        <p className="font-mono text-lg font-semibold text-slate-100">
          {formatValorRelativo(valorRelativo.valorRelativo)}
        </p>
        <p className="text-sm text-slate-400">
          {valorRelativo.fonte} está pagando{" "}
          {formatValorRelativo(valorRelativo.valorRelativo)} o consenso do mercado.
        </p>
      </div>
    ),
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Resumo Executivo
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          const isScore = item.key === "score";

          return (
            <Card
              key={item.key}
              className={
                isScore
                  ? "border-violet-500/30 bg-violet-500/5 sm:col-span-2"
                  : "border-slate-800/80"
              }
            >
              <CardHeader className="pb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                    {item.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {typeof values[item.key] === "string" ? (
                  <p
                    className={`font-mono text-lg font-semibold ${
                      isScore ? getOportunidadeColor(melhor.oportunidadeClassificacao) : "text-slate-100"
                    }`}
                  >
                    {values[item.key]}
                  </p>
                ) : (
                  values[item.key]
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
