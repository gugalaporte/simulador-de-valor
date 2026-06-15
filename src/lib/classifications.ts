import type { UpsideClassificacao } from "./types";

export function getClassificacaoBadgeVariant(
  classificacao: UpsideClassificacao
): "default" | "warning" | "success" | "strong" | "danger" {
  switch (classificacao) {
    case "Muito Forte":
      return "strong";
    case "Forte":
      return "success";
    case "Moderado":
      return "warning";
    default:
      return "default";
  }
}

export function getClassificacaoUpsideColor(
  classificacao: UpsideClassificacao
): string {
  switch (classificacao) {
    case "Muito Forte":
      return "text-violet-300 font-semibold";
    case "Forte":
      return "text-green-400 font-semibold";
    case "Moderado":
      return "text-yellow-400 font-semibold";
    default:
      return "text-slate-300";
  }
}
