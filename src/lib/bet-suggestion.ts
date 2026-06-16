import type { AnalysisResult, BetSuggestion } from "./types";
import { formatCurrency, formatOdd, formatPercent } from "./utils";

const DEFAULT_UNIDADE = 25;
const MAX_MULTIPLICADOR = 2;
const MIN_MULTIPLICADOR = 0.25;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateBetSuggestion(
  result: AnalysisResult,
  unidade: number | null
): BetSuggestion {
  const baseUnidade =
    unidade !== null && unidade > 0 ? unidade : DEFAULT_UNIDADE;

  const melhor = result.melhorOportunidade;
  const upside = Math.max(0, melhor.upside);
  const score = melhor.oportunidadeScore;
  const odd = melhor.odd;
  const probConsenso = result.consensoProbabilidade;

  // Score de oportunidade: de ~0.3x a ~2x da unidade
  const fatorScore = 0.3 + (score / 100) * 1.7;

  // Odds altas reduzem stake; odds baixas permitem um pouco mais
  const fatorOdd = clamp(2.2 / odd, 0.45, 1.15);

  // Upside reforça quando há edge real
  const fatorUpside = clamp(0.75 + upside * 0.55, 0.75, 1.45);

  // Probabilidade de consenso como proxy da chance de acerto
  const fatorProbabilidade = clamp(probConsenso / 0.35, 0.55, 1.1);

  let multiplicador =
    fatorScore * fatorOdd * fatorUpside * fatorProbabilidade;

  // Oportunidades excepcionais podem chegar a 2x a unidade
  if (score >= 85 && upside >= 0.45) {
    multiplicador = Math.max(multiplicador, 1.75);
  }

  if (score < 46 || upside < 0.1) {
    multiplicador = Math.min(multiplicador, 0.6);
  }

  multiplicador = clamp(multiplicador, MIN_MULTIPLICADOR, MAX_MULTIPLICADOR);

  const valor = roundCurrency(baseUnidade * multiplicador);
  const retornoPotencial = roundCurrency(valor * odd);
  const lucroSeGreen = roundCurrency(valor * (odd - 1));

  const usandoUnidadePadrao = unidade === null || unidade <= 0;

  const resumo = usandoUnidadePadrao
    ? `Com base na unidade padrão de ${formatCurrency(baseUnidade)}, sugere-se ${formatCurrency(valor)} (${multiplicador.toFixed(2)}x) em ${melhor.fonte} (odd ${formatOdd(odd)}). Upside de ${formatPercent(upside)} com score ${score}/100 e chance de consenso em ${formatPercent(probConsenso)}.`
    : `Com base na sua unidade de ${formatCurrency(baseUnidade)}, sugere-se ${formatCurrency(valor)} (${multiplicador.toFixed(2)}x) em ${melhor.fonte} (odd ${formatOdd(odd)}). Upside de ${formatPercent(upside)} com score ${score}/100 e chance de consenso em ${formatPercent(probConsenso)}.`;

  return {
    valor,
    unidade: baseUnidade,
    multiplicador: roundCurrency(multiplicador),
    retornoPotencial,
    lucroSeGreen,
    resumo,
    usandoUnidadePadrao,
  };
}
