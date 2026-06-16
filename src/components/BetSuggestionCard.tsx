import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOportunidadeBadgeVariant } from "@/lib/classifications";
import type { AnalysisResult, BetSuggestion } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface BetSuggestionCardProps {
  suggestion: BetSuggestion;
  classificacao: AnalysisResult["melhorOportunidade"]["oportunidadeClassificacao"];
  onApply?: (valor: number) => void;
}

export function BetSuggestionCard({
  suggestion,
  classificacao,
  onApply,
}: BetSuggestionCardProps) {
  return (
    <Card className="border-amber-500/25 bg-amber-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-base">Sugestão de Aposta</CardTitle>
          <Badge variant={getOportunidadeBadgeVariant(classificacao)}>
            {classificacao}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Sugerido" value={formatCurrency(suggestion.valor)} highlight />
          <Metric
            label="Unidade"
            value={formatCurrency(suggestion.unidade)}
            hint={suggestion.usandoUnidadePadrao ? "padrão" : undefined}
          />
          <Metric label="Multiplicador" value={`${suggestion.multiplicador.toFixed(2)}x`} />
          <Metric
            label="Lucro se Green"
            value={formatCurrency(suggestion.lucroSeGreen)}
            hint="líquido"
          />
        </div>

        <p className="text-xs text-slate-500">
          Se a aposta bater: retorno total de{" "}
          <span className="font-mono text-emerald-400">
            {formatCurrency(suggestion.retornoPotencial)}
          </span>{" "}
          (stake + lucro).
        </p>

        <p className="text-sm leading-relaxed text-slate-400">{suggestion.resumo}</p>

        {onApply && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onApply(suggestion.valor)}
          >
            Usar sugestão no registro
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  highlight,
  hint,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}
        {hint && <span className="ml-1 text-slate-600">({hint})</span>}
      </p>
      <p
        className={`font-mono text-sm font-semibold ${
          highlight ? "text-amber-300" : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
