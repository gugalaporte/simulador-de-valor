import type {
  AnalysisResult,
  EficienciaClassificacao,
  MarketEfficiency,
  OportunidadeClassificacao,
  SourceAnalysis,
  SourceAnalysisBase,
  ValorRelativoInfo,
} from "./types";
import { formatOdd, formatPercent } from "./utils";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function classifyOpportunityScore(
  score: number
): OportunidadeClassificacao {
  if (score >= 85) return "Excepcional";
  if (score >= 66) return "Forte";
  if (score >= 46) return "Interessante";
  return "Ruído";
}

/** Score composto (0–100) ponderando upside, divergência, gap e z-score. */
export function calculateOpportunityScore(
  upside: number,
  divergencia: number,
  gap: number,
  zScore: number
): number {
  const upsideNorm = clamp(Math.max(0, upside) / 0.5, 0, 1);
  const divergenciaNorm = clamp(divergencia / 0.4, 0, 1);
  const gapNorm = clamp(Math.max(0, gap) / 0.145, 0, 1);
  const zScoreNorm = clamp(Math.max(0, zScore) / 2, 0, 1);

  const score =
    (upsideNorm * 0.35 +
      divergenciaNorm * 0.25 +
      gapNorm * 0.2 +
      zScoreNorm * 0.2) *
    100;

  return Math.round(clamp(score, 0, 100));
}

export function classifyMarketEfficiency(
  eficiencia: number
): EficienciaClassificacao {
  if (eficiencia > 1.5) return "Divergência Excepcional";
  if (eficiencia >= 1.35) return "Divergência Relevante";
  if (eficiencia >= 1.2) return "Pequena Divergência";
  return "Mercado Eficiente";
}

export function enrichSourceAnalysis(
  fonte: SourceAnalysisBase,
  consensoOdd: number
): SourceAnalysis {
  const valorRelativo = fonte.odd / consensoOdd;
  const oportunidadeScore = calculateOpportunityScore(
    fonte.upside,
    fonte.divergencia,
    fonte.gap,
    fonte.zScore
  );

  return {
    ...fonte,
    valorRelativo,
    oportunidadeScore,
    oportunidadeClassificacao: classifyOpportunityScore(oportunidadeScore),
  };
}

export function calculateMarketEfficiency(
  fontes: SourceAnalysis[]
): MarketEfficiency {
  const probabilidades = fontes.map((fonte) => fonte.probabilidadeImplicita);
  const maiorProbabilidade = Math.max(...probabilidades);
  const menorProbabilidade = Math.min(...probabilidades);
  const eficiencia = maiorProbabilidade / menorProbabilidade;

  return {
    maiorProbabilidade,
    menorProbabilidade,
    eficiencia,
    classificacao: classifyMarketEfficiency(eficiencia),
  };
}

export function generateDiagnostico(result: AnalysisResult): string {
  const destaque = result.melhorOportunidade;
  const valorRelativo = result.maiorValorRelativo.valorRelativo.toFixed(2);

  const divergenciaTexto =
    destaque.zScore >= 2
      ? "significativamente superior à média das fontes analisadas"
      : destaque.zScore >= 1
        ? "superior à média das fontes analisadas"
        : "próxima da média das fontes analisadas";

  return `O consenso de mercado precifica este evento em odd ${formatOdd(result.consensoOdd)} (${formatPercent(result.consensoProbabilidade)}). A ${destaque.fonte} oferece odd ${formatOdd(destaque.odd)}, representando um upside de ${formatPercent(destaque.upside)} e um valor relativo de ${valorRelativo}x. A divergência observada é ${divergenciaTexto}.`;
}

export function completeAnalysisResult(
  base: Omit<
    AnalysisResult,
    | "fontes"
    | "melhorPreco"
    | "maiorUpside"
    | "rankingConfianca"
    | "melhorOportunidade"
    | "maiorValorRelativo"
    | "eficienciaMercado"
    | "diagnostico"
  > & {
    fontes: SourceAnalysisBase[];
  }
): AnalysisResult {
  const fontes = base.fontes.map((fonte) =>
    enrichSourceAnalysis(fonte, base.consensoOdd)
  );

  const sortedByOdd = [...fontes].sort((a, b) => a.odd - b.odd);
  const sortedByUpside = [...fontes].sort((a, b) => b.upside - a.upside);
  const rankingConfianca = [...fontes].sort(
    (a, b) => b.oportunidadeScore - a.oportunidadeScore
  );

  const maiorValorRelativo: ValorRelativoInfo = [...fontes]
    .map((fonte) => ({
      fonte: fonte.fonte,
      valorRelativo: fonte.valorRelativo,
    }))
    .sort((a, b) => b.valorRelativo - a.valorRelativo)[0];

  const partial: AnalysisResult = {
    ...base,
    fontes,
    melhorPreco: sortedByOdd[sortedByOdd.length - 1],
    maiorUpside: sortedByUpside[0],
    rankingConfianca,
    melhorOportunidade: rankingConfianca[0],
    maiorValorRelativo,
    eficienciaMercado: calculateMarketEfficiency(fontes),
    diagnostico: "",
  };

  return {
    ...partial,
    diagnostico: generateDiagnostico(partial),
  };
}
