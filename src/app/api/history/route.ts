import { NextResponse } from "next/server";
import {
  groupHistoryBySession,
  historyRecordsToAnalysisResult,
} from "@/lib/history";
import {
  fetchAnalysisHistory,
  fetchAnalysisSessions,
  updateAnalysisSession,
} from "@/lib/supabase";
import type { BetResultado, HistoryRecord } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const [records, sessions] = await Promise.all([
      fetchAnalysisHistory(200) as Promise<HistoryRecord[]>,
      fetchAnalysisSessions(),
    ]);

    const metaMap = new Map(
      sessions.map((session) => [session.sessionId, session])
    );

    if (sessionId) {
      const sessionRecords = records.filter(
        (record) => record.session_id === sessionId
      );

      if (sessionRecords.length === 0) {
        return NextResponse.json(
          { error: "Análise não encontrada." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        result: historyRecordsToAnalysisResult(
          sessionId,
          sessionRecords,
          metaMap.get(sessionId)
        ),
      });
    }

    return NextResponse.json({
      sessions: groupHistoryBySession(records, sessions),
    });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar o histórico." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId: string;
      titulo?: string | null;
      valorApostado?: number | null;
      resultado?: BetResultado | null;
    };

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "sessionId é obrigatório." },
        { status: 400 }
      );
    }

    if (
      body.titulo !== undefined &&
      body.titulo !== null &&
      body.titulo.trim().length > 120
    ) {
      return NextResponse.json(
        { error: "Título deve ter no máximo 120 caracteres." },
        { status: 400 }
      );
    }

    if (
      body.valorApostado !== undefined &&
      body.valorApostado !== null &&
      body.valorApostado <= 0
    ) {
      return NextResponse.json(
        { error: "Valor apostado deve ser maior que zero." },
        { status: 400 }
      );
    }

    await updateAnalysisSession(body.sessionId, {
      titulo: body.titulo,
      valorApostado: body.valorApostado,
      resultado: body.resultado,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar os dados da aposta." },
      { status: 500 }
    );
  }
}
