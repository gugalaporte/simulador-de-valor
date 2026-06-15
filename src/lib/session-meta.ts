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
  analisePessoal: boolean;
  oddAposta: number | null;
  createdAt: string;
} {
  const meta = metaMap.get(item.sessionId);

  return {
    ...item,
    titulo: meta?.titulo ?? null,
    valorApostado: meta?.valorApostado ?? null,
    resultado: meta?.resultado ?? null,
    impulso25Plus: meta?.impulso25Plus ?? false,
    superOdd: meta?.superOdd ?? false,
    analisePessoal: meta?.analisePessoal ?? false,
    oddAposta: meta?.oddAposta ?? null,
    createdAt: meta?.createdAt ?? new Date(0).toISOString(),
  };
}
