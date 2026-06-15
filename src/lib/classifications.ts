import type {
  EficienciaClassificacao,
  OportunidadeClassificacao,
  UpsideClassificacao,
} from "./types";

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

export function getOportunidadeBadgeVariant(
  classificacao: OportunidadeClassificacao
): "default" | "warning" | "success" | "strong" | "danger" {
  switch (classificacao) {
    case "Excepcional":
      return "strong";
    case "Forte":
      return "success";
    case "Interessante":
      return "warning";
    default:
      return "default";
  }
}

export function getOportunidadeColor(
  classificacao: OportunidadeClassificacao
): string {
  switch (classificacao) {
    case "Excepcional":
      return "text-violet-300 font-semibold";
    case "Forte":
      return "text-green-400 font-semibold";
    case "Interessante":
      return "text-yellow-400 font-semibold";
    default:
      return "text-slate-400";
  }
}

export function getEficienciaBadgeVariant(
  classificacao: EficienciaClassificacao
): "default" | "warning" | "success" | "strong" | "danger" {
  switch (classificacao) {
    case "Divergência Excepcional":
      return "strong";
    case "Divergência Relevante":
      return "warning";
    case "Pequena Divergência":
      return "default";
    default:
      return "success";
  }
}
