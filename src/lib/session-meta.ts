import type { BetResultado, SessionMeta } from "./types";

export function sessionMetaMap(
  sessions: SessionMeta[]
): Map<string, SessionMeta> {
  return new Map(sessions.map((session) => [session.sessionId, session]));
}

export function attachSessionMeta<T extends { sessionId: string }>(
  item: T,
  metaMap: Map<string, SessionMeta>
): T & { valorApostado: number | null; resultado: BetResultado | null } {
  const meta = metaMap.get(item.sessionId);

  return {
    ...item,
    valorApostado: meta?.valorApostado ?? null,
    resultado: meta?.resultado ?? null,
  };
}
