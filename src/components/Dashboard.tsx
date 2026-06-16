"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult, BetResultado } from "@/lib/types";
import { formatOdd, formatPercent } from "@/lib/utils";
import { AutoDiagnostico } from "./AutoDiagnostico";
import { BetSuggestionCard } from "./BetSuggestionCard";
import { ComparisonTable } from "./ComparisonTable";
import { EficienciaMercado } from "./EficienciaMercado";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RankingConfianca } from "./RankingConfianca";
import { SessionBetForm } from "./SessionBetForm";
import { SessionFlagsBadges } from "./SessionFlagsBadges";
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
  const [valorSugerido, setValorSugerido] = useState<number | null>(null);

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
      <SessionFlagsBadges
        impulso25Plus={result.impulso25Plus}
        superOdd={result.superOdd}
      />
      <ExecutiveSummary result={result} />
      <AutoDiagnostico texto={result.diagnostico} />
      <EficienciaMercado eficiencia={result.eficienciaMercado} />
      <ComparisonTable fontes={result.fontes} />

      {result.sugestaoAposta && (
        <BetSuggestionCard
          suggestion={result.sugestaoAposta}
          classificacao={result.melhorOportunidade.oportunidadeClassificacao}
          onApply={setValorSugerido}
        />
      )}

      <SessionBetForm
        sessionId={result.sessionId}
        initialValorApostado={result.valorApostado}
        initialResultado={result.resultado}
        melhorPrecoOdd={result.melhorPreco.odd}
        valorSugerido={valorSugerido}
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
              {formatOdd(result.consensoOdd)}
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

      <RankingConfianca fontes={result.rankingConfianca} />
    </div>
  );
}
