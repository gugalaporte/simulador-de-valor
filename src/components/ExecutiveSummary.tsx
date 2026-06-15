import { Crown, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";
import { formatOdd, formatPercent } from "@/lib/utils";

interface ExecutiveSummaryProps {
  result: AnalysisResult;
}

const summaryItems = [
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
    key: "fontes",
    label: "Fontes Analisadas",
    icon: Users,
    color: "text-violet-400",
  },
] as const;

export function ExecutiveSummary({ result }: ExecutiveSummaryProps) {
  const values: Record<string, string> = {
    melhor: `${result.melhorPreco.fonte} (${formatOdd(result.melhorPreco.odd)})`,
    consenso: `${formatPercent(result.consensoProbabilidade)} · Odd ${formatOdd(result.consensoOdd)}`,
    upside: `${result.maiorUpside.fonte} (${formatPercent(result.maiorUpside.upside)})`,
    fontes: String(result.fontes.length),
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Resumo Executivo
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="border-slate-800/80">
              <CardHeader className="pb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                    {item.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-lg font-semibold text-slate-100">
                  {values[item.key]}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
