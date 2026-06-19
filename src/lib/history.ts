import {
  classifyUpside,
  classifyZScore,
} from "./calculations";
import { completeAnalysisResult } from "./metrics";
import type {
  AnalysisResult,
  BetResultado,
  HistoryRecord,
  SessionMeta,
  SourceAnalysisBase,
  UpsideClassificacao,
} from "./types";
import { attachSessionMeta, sessionMetaMap } from "./session-meta";

export interface HistorySession {
  sessionId: string;
  createdAt: string;
  titulo: string | null;
  fontes: string[];
  melhorPreco: { fonte: string; odd: number };
  maiorUpside: { fonte: string; upside: number; classificacao: UpsideClassificacao };
  consensoProbabilidade: number;
  valorApostado: number | null;
  resultado: BetResultado | null;
  impulso25Plus: boolean;
  superOdd: boolean;
  analisePessoal: boolean;
  oddAposta: number | null;
}

function personalSessionToHistory(meta: SessionMeta): HistorySession {
  const label = meta.titulo?.trim() || "Análise Pessoal";
  const casa = meta.casaAposta?.trim() || null;
  const odd = meta.oddAposta ?? 1;
  const fonte = casa ?? label;

  return {
    sessionId: meta.sessionId,
    createdAt: meta.createdAt,
    titulo: meta.titulo,
    fontes: casa ? [casa] : [],
    melhorPreco: { fonte, odd },
    maiorUpside: { fonte, upside: 0, classificacao: "Fraco" },
    consensoProbabilidade: 0,
    valorApostado: meta.valorApostado,
    resultado: meta.resultado,
    impulso25Plus: false,
    superOdd: false,
    analisePessoal: true,
    oddAposta: meta.oddAposta,
  };
}

export function listAllSessions(
  records: HistoryRecord[],
  sessionMetas: SessionMeta[] = []
): HistorySession[] {
  const comparative = groupHistoryBySession(records, sessionMetas);
  const comparativeIds = new Set(comparative.map((session) => session.sessionId));

  const personal = sessionMetas
    .filter((meta) => meta.analisePessoal && !comparativeIds.has(meta.sessionId))
    .map(personalSessionToHistory);

  return [...comparative, ...personal].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function historyRecordsToAnalysisResult(
  sessionId: string,
  records: HistoryRecord[],
  meta?: SessionMeta | null
): AnalysisResult {
  const fontes: SourceAnalysisBase[] = records.map((record) => {
    const upside = Number(record.upside);
    const zScore = Number(record.z_score);

    return {
      fonte: record.fonte,
      odd: Number(record.odd),
      probabilidadeImplicita: Number(record.probabilidade_implicita),
      gap: Number(record.gap),
      upside,
      divergencia: Number(record.divergencia),
      zScore,
      classificacao: classifyUpside(upside),
      zClassificacao: classifyZScore(zScore),
    };
  });

  const consensoProbabilidade = Number(records[0].consenso);
  const consensoOdd = 1 / consensoProbabilidade;
  const sortedByOdd = [...fontes].sort((a, b) => a.odd - b.odd);

  return completeAnalysisResult({
    sessionId,
    fontes,
    consensoProbabilidade,
    consensoOdd,
    fonteAcimaConsenso: sortedByOdd[sortedByOdd.length - 1].fonte,
    fonteAbaixoConsenso: sortedByOdd[0].fonte,
    titulo: meta?.titulo ?? null,
    valorApostado: meta?.valorApostado ?? null,
    resultado: meta?.resultado ?? null,
    impulso25Plus: meta?.impulso25Plus ?? false,
    superOdd: meta?.superOdd ?? false,
  });
}

export function groupHistoryBySession(
  records: HistoryRecord[],
  sessionMetas: SessionMeta[] = []
): HistorySession[] {
  const metaMap = sessionMetaMap(sessionMetas);
  const grouped = new Map<string, HistoryRecord[]>();

  for (const record of records) {
    const existing = grouped.get(record.session_id) ?? [];
    existing.push(record);
    grouped.set(record.session_id, existing);
  }

  return Array.from(grouped.entries())
    .map(([sessionId, sessionRecords]) => {
      const result = historyRecordsToAnalysisResult(sessionId, sessionRecords);
      const createdAt = sessionRecords[0].created_at;

      return attachSessionMeta(
        {
          sessionId,
          createdAt,
          fontes: result.fontes.map((fonte) => fonte.fonte),
          melhorPreco: {
            fonte: result.melhorPreco.fonte,
            odd: result.melhorPreco.odd,
          },
          maiorUpside: {
            fonte: result.maiorUpside.fonte,
            upside: result.maiorUpside.upside,
            classificacao: result.maiorUpside.classificacao,
          },
          consensoProbabilidade: result.consensoProbabilidade,
        },
        metaMap
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export type HistoryFilter =
  | "tudo"
  | "analises"
  | "em_andamento"
  | "finalizadas";

export function hasApostaRegistrada(session: HistorySession): boolean {
  return session.valorApostado !== null && session.valorApostado > 0;
}

export function isApostaFinalizada(session: HistorySession): boolean {
  return session.resultado === "green" || session.resultado === "red";
}

export function calcularLucroSessao(session: HistorySession): number | null {
  if (!isApostaFinalizada(session)) return null;
  if (session.valorApostado === null || session.valorApostado <= 0) return null;

  const odd = session.oddAposta ?? session.melhorPreco.odd;
  const valor = session.valorApostado;

  if (session.resultado === "green") {
    return valor * (odd - 1);
  }

  return -valor;
}

export function calcularLucroPotencialSessao(
  session: HistorySession
): number | null {
  if (!hasApostaRegistrada(session) || isApostaFinalizada(session)) {
    return null;
  }

  const odd = session.oddAposta ?? session.melhorPreco.odd;
  const valor = session.valorApostado!;

  return valor * (odd - 1);
}

export function sumTotalApostado(sessions: HistorySession[]): number {
  return sessions.reduce((sum, session) => sum + (session.valorApostado ?? 0), 0);
}

export function sumLucroPotencial(sessions: HistorySession[]): number {
  return sessions.reduce((sum, session) => {
    const lucro = calcularLucroPotencialSessao(session);
    return sum + (lucro ?? 0);
  }, 0);
}

export function filterHistorySessions(
  sessions: HistorySession[],
  filter: HistoryFilter
): HistorySession[] {
  if (filter === "tudo") return sessions;

  return sessions.filter((session) => {
    const hasBet = hasApostaRegistrada(session);
    const finalized = isApostaFinalizada(session);

    switch (filter) {
      case "analises":
        return !hasBet;
      case "em_andamento":
        return hasBet && !finalized;
      case "finalizadas":
        return finalized;
      default:
        return true;
    }
  });
}
