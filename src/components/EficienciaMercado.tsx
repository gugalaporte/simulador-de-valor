import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEficienciaBadgeVariant } from "@/lib/classifications";
import type { MarketEfficiency } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

interface EficienciaMercadoProps {
  eficiencia: MarketEfficiency;
}

export function EficienciaMercado({ eficiencia }: EficienciaMercadoProps) {
  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-sm">Eficiência de Mercado</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Maior Probabilidade</p>
          <p className="font-mono text-lg text-slate-200">
            {formatPercent(eficiencia.maiorProbabilidade)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Menor Probabilidade</p>
          <p className="font-mono text-lg text-slate-200">
            {formatPercent(eficiencia.menorProbabilidade)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Eficiência</p>
          <p className="font-mono text-lg text-amber-300">
            {eficiencia.eficiencia.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Classificação</p>
          <Badge
            variant={getEficienciaBadgeVariant(eficiencia.classificacao)}
            className="mt-1"
          >
            {eficiencia.classificacao}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
