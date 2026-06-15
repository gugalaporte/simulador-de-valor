import { createClient } from "@supabase/supabase-js";
import type { AnalysisResult, BetResultado, SessionMeta } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

interface SessionRow {
  session_id: string;
  titulo: string | null;
  valor_apostado: number | null;
  resultado: BetResultado | null;
  impulso_25_plus: boolean | null;
  super_odd: boolean | null;
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

  return ((data as SessionRow[]) ?? []).map((row) => ({
    sessionId: row.session_id,
    titulo: row.titulo?.trim() || null,
    valorApostado:
      row.valor_apostado !== null ? Number(row.valor_apostado) : null,
    resultado: row.resultado,
    impulso25Plus: row.impulso_25_plus ?? false,
    superOdd: row.super_odd ?? false,
  }));
}

export async function updateAnalysisSession(
  sessionId: string,
  updates: {
    titulo?: string | null;
    valorApostado?: number | null;
    resultado?: BetResultado | null;
  }
) {
  const payload: Record<string, unknown> = { session_id: sessionId };

  if ("titulo" in updates) {
    payload.titulo = updates.titulo?.trim() || null;
  }

  if ("valorApostado" in updates) {
    payload.valor_apostado = updates.valorApostado;
  }

  if ("resultado" in updates) {
    payload.resultado = updates.resultado;
  }

  const { error } = await supabase
    .from("analysis_sessions")
    .upsert(payload, { onConflict: "session_id" });

  if (error) {
    throw error;
  }
}
