import type { BetResultado, SessionMeta } from "./types";

export function sessionMetaMap(
  sessions: SessionMeta[]
): Map<string, SessionMeta> {
  return new Map(sessions.map((session) => [session.sessionId, session]));
}

export function attachSessionMeta<T extends { sessionId: string }>(
  item: T,
  metaMap: Map<string, SessionMeta>
): T & {
  titulo: string | null;
  valorApostado: number | null;
  resultado: BetResultado | null;
  impulso25Plus: boolean;
  superOdd: boolean;
} {
  const meta = metaMap.get(item.sessionId);

  return {
    ...item,
    titulo: meta?.titulo ?? null,
    valorApostado: meta?.valorApostado ?? null,
    resultado: meta?.resultado ?? null,
    impulso25Plus: meta?.impulso25Plus ?? false,
    superOdd: meta?.superOdd ?? false,
  };
}
