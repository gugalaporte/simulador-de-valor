import { NextResponse } from "next/server";
import { groupHistoryBySession, listAllSessions } from "@/lib/history";
import { calculateReceitas } from "@/lib/receitas";
import {
  fetchAnalysisHistory,
  fetchAnalysisSessions,
} from "@/lib/supabase";
import type { HistoryRecord } from "@/lib/types";

export async function GET() {
  try {
    const [records, sessions] = await Promise.all([
      fetchAnalysisHistory(500) as Promise<HistoryRecord[]>,
      fetchAnalysisSessions(),
    ]);

    const historySessions = listAllSessions(records, sessions);
    const stats = calculateReceitas(historySessions);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erro ao calcular receitas:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar as receitas." },
      { status: 500 }
    );
  }
}
