import { createClient } from "@supabase/supabase-js";
import type { AnalysisResult, BetResultado, SessionMeta } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

interface SessionRow {
  session_id: string;
  titulo: string | null;
  casa_aposta: string | null;
  valor_apostado: number | null;
  resultado: BetResultado | null;
  impulso_25_plus: boolean | null;
  super_odd: boolean | null;
  analise_pessoal: boolean | null;
  odd_aposta: number | null;
  created_at: string;
}

function mapSessionRow(row: SessionRow): SessionMeta {
  return {
    sessionId: row.session_id,
    titulo: row.titulo?.trim() || null,
    casaAposta: row.casa_aposta?.trim() || null,
    valorApostado:
      row.valor_apostado !== null ? Number(row.valor_apostado) : null,
    resultado: row.resultado,
    impulso25Plus: row.impulso_25_plus ?? false,
    superOdd: row.super_odd ?? false,
    analisePessoal: row.analise_pessoal ?? false,
    oddAposta: row.odd_aposta !== null ? Number(row.odd_aposta) : null,
    createdAt: row.created_at,
  };
}

export async function saveAnalysisHistory(result: AnalysisResult) {
  const records = result.fontes.map((fonte) => ({
    session_id: result.sessionId,
    fonte: fonte.fonte,
    odd: fonte.odd,
    probabilidade_implicita: fonte.probabilidadeImplicita,
    consenso: result.consensoProbabilidade,
    upside: fonte.upside,
    gap: fonte.gap,
    divergencia: fonte.divergencia,
    z_score: fonte.zScore,
  }));

  const { error } = await supabase.from("analysis_history").insert(records);

  if (error) {
    throw error;
  }

  const { error: sessionError } = await supabase.from("analysis_sessions").upsert({
    session_id: result.sessionId,
    titulo: result.titulo?.trim() || null,
    impulso_25_plus: result.impulso25Plus ?? false,
    super_odd: result.superOdd ?? false,
    analise_pessoal: false,
  });

  if (sessionError) {
    throw sessionError;
  }
}

export async function fetchAnalysisHistory(limit = 200) {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchAnalysisSessions(): Promise<SessionMeta[]> {
  const { data, error } = await supabase.from("analysis_sessions").select("*");

  if (error) {
    throw error;
  }

  return ((data as SessionRow[]) ?? []).map(mapSessionRow);
}

export async function createPersonalBet(data: {
  titulo?: string | null;
  casaAposta: string;
  valorApostado: number;
  oddAposta: number;
  resultado?: BetResultado | null;
}) {
  const sessionId = crypto.randomUUID();

  const { error } = await supabase.from("analysis_sessions").insert({
    session_id: sessionId,
    titulo: data.titulo?.trim() || "Análise Pessoal",
    casa_aposta: data.casaAposta,
    valor_apostado: data.valorApostado,
    odd_aposta: data.oddAposta,
    resultado: data.resultado ?? null,
    analise_pessoal: true,
    impulso_25_plus: false,
    super_odd: false,
  });

  if (error) {
    throw error;
  }

  return sessionId;
}

export async function updateAnalysisSession(
  sessionId: string,
  updates: {
    titulo?: string | null;
    casaAposta?: string | null;
    valorApostado?: number | null;
    resultado?: BetResultado | null;
    oddAposta?: number | null;
  }
) {
  const payload: Record<string, unknown> = {};

  if (updates.titulo !== undefined) {
    payload.titulo = updates.titulo?.trim() || null;
  }

  if (updates.casaAposta !== undefined) {
    payload.casa_aposta = updates.casaAposta?.trim() || null;
  }

  if (updates.valorApostado !== undefined) {
    payload.valor_apostado = updates.valorApostado;
  }

  if (updates.resultado !== undefined) {
    payload.resultado = updates.resultado;
  }

  if (updates.oddAposta !== undefined) {
    payload.odd_aposta = updates.oddAposta;
  }

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("analysis_sessions")
    .update(payload)
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }
}

export async function deleteAnalysisSession(sessionId: string) {
  const { error: historyError } = await supabase
    .from("analysis_history")
    .delete()
    .eq("session_id", sessionId);

  if (historyError) {
    throw historyError;
  }

  const { error: sessionError } = await supabase
    .from("analysis_sessions")
    .delete()
    .eq("session_id", sessionId);

  if (sessionError) {
    throw sessionError;
  }
}
