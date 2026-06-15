export interface PricingInput {
  odd: number;
  fonte: string;
}

export type UpsideClassificacao = "Fraco" | "Moderado" | "Forte" | "Muito Forte";

export type ZScoreClassificacao =
  | "Normal"
  | "Acima da Média"
  | "Muito Acima da Média"
  | "Excepcional";

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
  rankingConfianca: SourceAnalysis[];
  valorApostado?: number | null;
  resultado?: BetResultado | null;
}
