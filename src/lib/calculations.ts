import type {
  AnalysisResult,
  PricingInput,
  SourceAnalysisBase,
  UpsideClassificacao,
  ZScoreClassificacao,
} from "./types";
import { completeAnalysisResult } from "./metrics";

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Consenso calculado sem o melhor preço (maior odd). */
function calculateConsensusExcludingBest(inputs: PricingInput[]) {
  const sortedByOdd = [...inputs].sort((a, b) => b.odd - a.odd);
  const inferiores = sortedByOdd.slice(1);
  const probabilidadesInferiores = inferiores.map((input) => 1 / input.odd);
  const consensoProbabilidade = mean(probabilidadesInferiores);

  return {
    consensoProbabilidade,
    consensoOdd: 1 / consensoProbabilidade,
  };
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;

  const avg = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

export function classifyUpside(upside: number): UpsideClassificacao {
  const pct = upside * 100;

  if (pct >= 45) return "Muito Forte";
  if (pct >= 35) return "Forte";
  if (pct >= 20) return "Moderado";
  return "Fraco";
}

export function classifyZScore(zScore: number): ZScoreClassificacao {
  if (zScore >= 3) return "Excepcional";
  if (zScore >= 2) return "Muito Acima da Média";
  if (zScore >= 1) return "Acima da Média";
  return "Normal";
}

export function analyzePricing(inputs: PricingInput[]): AnalysisResult {
  const validInputs = inputs.filter(
    (input) => input.fonte.trim() !== "" && input.odd > 1
  );

  if (validInputs.length < 2) {
    throw new Error("Informe pelo menos duas fontes válidas com odd maior que 1.");
  }

  const { consensoProbabilidade, consensoOdd } =
    calculateConsensusExcludingBest(validInputs);

  const upsides = validInputs.map((input) => input.odd / consensoOdd - 1);
  const mediaUpsides = mean(upsides);
  const desvioUpsides = stdDev(upsides);

  const fontes: SourceAnalysisBase[] = validInputs.map((input, index) => {
    const probabilidadeImplicita = 1 / input.odd;
    const upside = upsides[index];
    const gap = consensoProbabilidade - probabilidadeImplicita;
    const divergencia =
      Math.abs(probabilidadeImplicita - consensoProbabilidade) /
      ((probabilidadeImplicita + consensoProbabilidade) / 2);

    const zScore =
      desvioUpsides === 0 ? 0 : (upside - mediaUpsides) / desvioUpsides;

    return {
      fonte: input.fonte.trim(),
      odd: input.odd,
      probabilidadeImplicita,
      gap,
      upside,
      divergencia,
      zScore,
      classificacao: classifyUpside(upside),
      zClassificacao: classifyZScore(zScore),
    };
  });

  const sortedByOdd = [...fontes].sort((a, b) => a.odd - b.odd);

  return completeAnalysisResult({
    sessionId: crypto.randomUUID(),
    fontes,
    consensoProbabilidade,
    consensoOdd,
    fonteAcimaConsenso: sortedByOdd[sortedByOdd.length - 1].fonte,
    fonteAbaixoConsenso: sortedByOdd[0].fonte,
  });
}
