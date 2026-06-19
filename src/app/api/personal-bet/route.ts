import { NextResponse } from "next/server";
import { createPersonalBet } from "@/lib/supabase";
import { isFonteValida } from "@/lib/sources";
import type { BetResultado } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      titulo?: string;
      casaAposta: string;
      valorApostado: number;
      oddAposta: number;
      resultado?: BetResultado | null;
    };

    if (!body.casaAposta || !isFonteValida(body.casaAposta)) {
      return NextResponse.json(
        { error: "Selecione uma casa de aposta válida." },
        { status: 400 }
      );
    }

    if (!body.valorApostado || body.valorApostado <= 0) {
      return NextResponse.json(
        { error: "Valor apostado deve ser maior que zero." },
        { status: 400 }
      );
    }

    if (!body.oddAposta || body.oddAposta <= 1) {
      return NextResponse.json(
        { error: "Odd deve ser maior que 1." },
        { status: 400 }
      );
    }

    if (
      body.titulo !== undefined &&
      body.titulo.trim().length > 120
    ) {
      return NextResponse.json(
        { error: "Título deve ter no máximo 120 caracteres." },
        { status: 400 }
      );
    }

    const sessionId = await createPersonalBet({
      titulo: body.titulo?.trim() || null,
      casaAposta: body.casaAposta,
      valorApostado: body.valorApostado,
      oddAposta: body.oddAposta,
      resultado: body.resultado ?? null,
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("Erro ao criar aposta pessoal:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar a aposta pessoal." },
      { status: 500 }
    );
  }
}
