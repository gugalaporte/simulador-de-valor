import { NextResponse } from "next/server";
import { calculateBetSuggestion } from "@/lib/bet-suggestion";
import {
  historyRecordsToAnalysisResult,
  listAllSessions,
} from "@/lib/history";
import { calculateReceitas } from "@/lib/receitas";
import { isFonteValida } from "@/lib/sources";
import {
  deleteAnalysisSession,
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
      const meta = metaMap.get(sessionId);

      if (sessionRecords.length === 0) {
        if (meta?.analisePessoal) {
          return NextResponse.json({ personalBet: meta });
        }

        return NextResponse.json(
          { error: "Análise não encontrada." },
          { status: 404 }
        );
      }

      const result = historyRecordsToAnalysisResult(
        sessionId,
        sessionRecords,
        meta
      );
      const unidade = calculateReceitas(
        listAllSessions(records, sessions)
      ).unidade;

      return NextResponse.json({
        result: {
          ...result,
          sugestaoAposta: calculateBetSuggestion(
            result,
            unidade > 0 ? unidade : null
          ),
        },
      });
    }

    return NextResponse.json({
      sessions: listAllSessions(records, sessions),
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
      casaAposta?: string | null;
      valorApostado?: number | null;
      resultado?: BetResultado | null;
      oddAposta?: number | null;
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

    if (
      body.oddAposta !== undefined &&
      body.oddAposta !== null &&
      body.oddAposta <= 1
    ) {
      return NextResponse.json(
        { error: "Odd deve ser maior que 1." },
        { status: 400 }
      );
    }

    if (
      body.casaAposta !== undefined &&
      body.casaAposta !== null &&
      !isFonteValida(body.casaAposta)
    ) {
      return NextResponse.json(
        { error: "Selecione uma casa de aposta válida." },
        { status: 400 }
      );
    }

    const sessionUpdates: {
      titulo?: string | null;
      casaAposta?: string | null;
      valorApostado?: number | null;
      resultado?: BetResultado | null;
      oddAposta?: number | null;
    } = {};

    if (body.titulo !== undefined) {
      sessionUpdates.titulo = body.titulo;
    }

    if (body.casaAposta !== undefined) {
      sessionUpdates.casaAposta = body.casaAposta;
    }

    if (body.valorApostado !== undefined) {
      sessionUpdates.valorApostado = body.valorApostado;
    }

    if (body.resultado !== undefined) {
      sessionUpdates.resultado = body.resultado;
    }

    if (body.oddAposta !== undefined) {
      sessionUpdates.oddAposta = body.oddAposta;
    }

    await updateAnalysisSession(body.sessionId, sessionUpdates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar os dados da aposta." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId é obrigatório." },
        { status: 400 }
      );
    }

    await deleteAnalysisSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao apagar sessão:", error);

    return NextResponse.json(
      { error: "Não foi possível apagar esta análise." },
      { status: 500 }
    );
  }
}
