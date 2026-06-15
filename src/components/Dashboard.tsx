import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getClassificacaoBadgeVariant,
  getClassificacaoUpsideColor,
} from "@/lib/classifications";
import type { AnalysisResult, BetResultado } from "@/lib/types";
import { cn, formatPercent } from "@/lib/utils";
import { ComparisonTable } from "./ComparisonTable";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { SessionBetForm } from "./SessionBetForm";
import { SessionTitleForm } from "./SessionTitleForm";

interface DashboardProps {
  result: AnalysisResult;
  titleEditable?: boolean;
  onSessionUpdate?: (data: {
    titulo?: string | null;
    valorApostado?: number | null;
    resultado?: BetResultado | null;
  }) => void;
}

export function Dashboard({ result, titleEditable, onSessionUpdate }: DashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {titleEditable ? (
        <SessionTitleForm
          sessionId={result.sessionId}
          initialTitulo={result.titulo}
          onSaved={(titulo) => onSessionUpdate?.({ titulo })}
        />
      ) : (
        result.titulo && (
          <h2 className="text-xl font-semibold text-slate-100">{result.titulo}</h2>
        )
      )}
      <ExecutiveSummary result={result} />
      <ComparisonTable fontes={result.fontes} />

      <SessionBetForm
        sessionId={result.sessionId}
        initialValorApostado={result.valorApostado}
        initialResultado={result.resultado}
        melhorPrecoOdd={result.melhorPreco.odd}
        onSaved={onSessionUpdate}
      />

      <Card className="border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-sm">Consenso de Mercado</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Probabilidade Consenso</p>
            <p className="font-mono text-lg text-cyan-300">
              {formatPercent(result.consensoProbabilidade)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Odd Consenso</p>
            <p className="font-mono text-lg text-cyan-300">
              {result.consensoOdd.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Acima do Consenso</p>
            <p className="font-mono text-slate-200">{result.fonteAcimaConsenso}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Abaixo do Consenso</p>
            <p className="font-mono text-slate-200">{result.fonteAbaixoConsenso}</p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Ranking de Confiança
        </h2>
        <div className="space-y-2">
          {result.rankingConfianca.map((fonte, index) => (
            <Card key={fonte.fonte} className="border-slate-800/80">
              <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-emerald-400">
                    {index + 1}
                  </span>
                  <CardTitle className="text-base">{fonte.fonte}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-sm",
                      getClassificacaoUpsideColor(fonte.classificacao)
                    )}
                  >
                    {formatPercent(fonte.upside)}
                  </span>
                  <Badge variant={getClassificacaoBadgeVariant(fonte.classificacao)}>
                    {fonte.classificacao}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <p className="text-xs text-slate-500">
                  Z-Score: {fonte.zScore.toFixed(2)} · {fonte.zClassificacao}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
