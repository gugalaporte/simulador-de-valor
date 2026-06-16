export interface PricingInput {
  odd: number;
  fonte: string;
}

export type UpsideClassificacao = "Fraco" | "Moderado" | "Forte" | "Excepcional";

export type ZScoreClassificacao =
  | "Normal"
  | "Acima da Média"
  | "Muito Acima da Média"
  | "Excepcional";

export type OportunidadeClassificacao =
  | "Ruído"
  | "Moderado"
  | "Forte"
  | "Excepcional";

export type EficienciaClassificacao =
  | "Mercado Eficiente"
  | "Pequena Divergência"
  | "Divergência Relevante"
  | "Divergência Excepcional";

export interface SourceAnalysis {
  fonte: string;
  odd: number;
  probabilidadeImplicita: number;
  gap: number;
  upside: number;
  divergencia: number;
  zScore: number;
  classificacao: UpsideClassificacao;
  zClassificacao: ZScoreClassificacao;
  valorRelativo: number;
  oportunidadeScore: number;
  oportunidadeClassificacao: OportunidadeClassificacao;
}

export type SourceAnalysisBase = Omit<
  SourceAnalysis,
  "valorRelativo" | "oportunidadeScore" | "oportunidadeClassificacao"
>;

export interface ValorRelativoInfo {
  fonte: string;
  valorRelativo: number;
}

export interface MarketEfficiency {
  maiorProbabilidade: number;
  menorProbabilidade: number;
  eficiencia: number;
  classificacao: EficienciaClassificacao;
}

export interface HistoryRecord {
  id: string;
  created_at: string;
  session_id: string;
  fonte: string;
  odd: number;
  probabilidade_implicita: number;
  consenso: number;
  upside: number;
  gap: number;
  divergencia: number;
  z_score: number;
}

export type BetResultado = "green" | "red";

export interface SessionMeta {
  sessionId: string;
  titulo: string | null;
  valorApostado: number | null;
  resultado: BetResultado | null;
  impulso25Plus: boolean;
  superOdd: boolean;
  analisePessoal: boolean;
  oddAposta: number | null;
  createdAt: string;
}

export interface BetSuggestion {
  valor: number;
  unidade: number;
  multiplicador: number;
  retornoPotencial: number;
  lucroSeGreen: number;
  resumo: string;
  usandoUnidadePadrao: boolean;
}

export interface AnalysisResult {
  sessionId: string;
  titulo?: string | null;
  fontes: SourceAnalysis[];
  consensoProbabilidade: number;
  consensoOdd: number;
  fonteAcimaConsenso: string;
  fonteAbaixoConsenso: string;
  melhorPreco: SourceAnalysis;
  maiorUpside: SourceAnalysis;
  melhorOportunidade: SourceAnalysis;
  maiorValorRelativo: ValorRelativoInfo;
  eficienciaMercado: MarketEfficiency;
  diagnostico: string;
  rankingConfianca: SourceAnalysis[];
  valorApostado?: number | null;
  resultado?: BetResultado | null;
  impulso25Plus?: boolean;
  superOdd?: boolean;
  sugestaoAposta?: BetSuggestion | null;
}
