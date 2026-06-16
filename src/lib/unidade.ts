import { listAllSessions } from "./history";
import { calculateReceitas } from "./receitas";
import {
  fetchAnalysisHistory,
  fetchAnalysisSessions,
} from "./supabase";
import type { HistoryRecord } from "./types";

export async function fetchUnidadeApostas(): Promise<number | null> {
  const [records, sessions] = await Promise.all([
    fetchAnalysisHistory(500) as Promise<HistoryRecord[]>,
    fetchAnalysisSessions(),
  ]);

  const stats = calculateReceitas(listAllSessions(records, sessions));

  if (stats.totalApostasResolvidas === 0) {
    return null;
  }

  return stats.unidade;
}
