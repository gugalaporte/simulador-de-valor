import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getClassificacaoBadgeVariant,
  getClassificacaoUpsideColor,
} from "@/lib/classifications";
import type { SourceAnalysis } from "@/lib/types";
import { formatOdd, formatPercent, formatPercentPoints } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ComparisonTableProps {
  fontes: SourceAnalysis[];
}

export function ComparisonTable({ fontes }: ComparisonTableProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Tabela Comparativa
      </h2>

      <div className="space-y-3 md:hidden">
        {fontes.map((fonte) => (
          <Card
            key={fonte.fonte}
            className={cn(
              "border-slate-800/80",
              fonte.classificacao === "Muito Forte" &&
                "border-violet-500/50 shadow-lg shadow-violet-500/10"
            )}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{fonte.fonte}</CardTitle>
              <Badge variant={getClassificacaoBadgeVariant(fonte.classificacao)}>
                {fonte.classificacao}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Odd" value={formatOdd(fonte.odd)} />
              <Metric
                label="Prob. Implícita"
                value={formatPercent(fonte.probabilidadeImplicita)}
              />
              <Metric label="Gap" value={formatPercentPoints(fonte.gap)} />
              <Metric
                label="Upside"
                value={formatPercent(fonte.upside)}
                className={getClassificacaoUpsideColor(fonte.classificacao)}
              />
              <Metric label="Divergência" value={formatPercent(fonte.divergencia)} />
              <Metric label="Z-Score" value={fonte.zScore.toFixed(2)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Fonte</th>
              <th className="px-4 py-3">Odd</th>
              <th className="px-4 py-3">Prob. Implícita</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Upside</th>
              <th className="px-4 py-3">Divergência</th>
              <th className="px-4 py-3">Z-Score</th>
              <th className="px-4 py-3">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {fontes.map((fonte) => (
              <tr
                key={fonte.fonte}
                className={cn(
                  "border-t border-slate-800",
                  fonte.classificacao === "Muito Forte" && "bg-violet-500/5"
                )}
              >
                <td className="px-4 py-3 font-medium">{fonte.fonte}</td>
                <td className="px-4 py-3 font-mono">{formatOdd(fonte.odd)}</td>
                <td className="px-4 py-3 font-mono">
                  {formatPercent(fonte.probabilidadeImplicita)}
                </td>
                <td className="px-4 py-3 font-mono">
                  {formatPercentPoints(fonte.gap)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 font-mono",
                    getClassificacaoUpsideColor(fonte.classificacao)
                  )}
                >
                  {formatPercent(fonte.upside)}
                </td>
                <td className="px-4 py-3 font-mono">
                  {formatPercent(fonte.divergencia)}
                </td>
                <td className="px-4 py-3 font-mono">{fonte.zScore.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Badge variant={getClassificacaoBadgeVariant(fonte.classificacao)}>
                    {fonte.classificacao}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("font-mono font-medium text-slate-200", className)}>
        {value}
      </p>
    </div>
  );
}
