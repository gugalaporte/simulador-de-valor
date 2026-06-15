import {
  classifyUpside,
  classifyZScore,
} from "./calculations";
import type {
  AnalysisResult,
  BetResultado,
  HistoryRecord,
  SessionMeta,
  SourceAnalysis,
  UpsideClassificacao,
} from "./types";
import { attachSessionMeta, sessionMetaMap } from "./session-meta";

export interface HistorySession {
  sessionId: string;
  createdAt: string;
  fontes: string[];
  melhorPreco: { fonte: string; odd: number };
  maiorUpside: { fonte: string; upside: number; classificacao: UpsideClassificacao };
  consensoProbabilidade: number;
  valorApostado: number | null;
  resultado: BetResultado | null;
}

export function historyRecordsToAnalysisResult(
  sessionId: string,
  records: HistoryRecord[],
  meta?: SessionMeta | null
): AnalysisResult {
  const fontes: SourceAnalysis[] = records.map((record) => {
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
  const sortedByUpside = [...fontes].sort((a, b) => b.upside - a.upside);

  return {
    sessionId,
    fontes,
    consensoProbabilidade,
    consensoOdd,
    fonteAcimaConsenso: sortedByOdd[sortedByOdd.length - 1].fonte,
    fonteAbaixoConsenso: sortedByOdd[0].fonte,
    melhorPreco: sortedByOdd[sortedByOdd.length - 1],
    maiorUpside: sortedByUpside[0],
    rankingConfianca: sortedByUpside,
    valorApostado: meta?.valorApostado ?? null,
    resultado: meta?.resultado ?? null,
  };
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
