import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOportunidadeBadgeVariant,
  getOportunidadeColor,
} from "@/lib/classifications";
import type { SourceAnalysis } from "@/lib/types";
import {
  formatSignedPercent,
  formatSignedPercentPoints,
  formatValorRelativo,
} from "@/lib/utils";

interface RankingConfiancaProps {
  fontes: SourceAnalysis[];
}

export function RankingConfianca({ fontes }: RankingConfiancaProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Ranking de Confiança
      </h2>
      <div className="space-y-2">
        {fontes.map((fonte, index) => (
          <Card
            key={fonte.fonte}
            className={
              index === 0 ? "border-violet-500/30 bg-violet-500/5" : "border-slate-800/80"
            }
          >
            <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-emerald-400">
                  {index + 1}
                </span>
                <CardTitle className="text-base uppercase">{fonte.fonte}</CardTitle>
              </div>
              <Badge variant={getOportunidadeBadgeVariant(fonte.oportunidadeClassificacao)}>
                {fonte.oportunidadeClassificacao}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pb-4 pt-0 sm:grid-cols-3">
              <Metric
                label="Score"
                value={`${fonte.oportunidadeScore}/100`}
                className={getOportunidadeColor(fonte.oportunidadeClassificacao)}
              />
              <Metric
                label="Upside"
                value={formatSignedPercent(fonte.upside)}
                className={getOportunidadeColor(fonte.oportunidadeClassificacao)}
              />
              <Metric
                label="Valor Relativo"
                value={formatValorRelativo(fonte.valorRelativo)}
              />
              <Metric
                label="Gap"
                value={formatSignedPercentPoints(fonte.gap)}
              />
              <Metric
                label="Classificação"
                value={fonte.oportunidadeClassificacao}
                className={getOportunidadeColor(fonte.oportunidadeClassificacao)}
              />
            </CardContent>
          </Card>
        ))}
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
      <p className={`font-mono text-sm font-medium text-slate-200 ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
