import { NextResponse } from "next/server";
import { calculateBetSuggestion } from "@/lib/bet-suggestion";
import { analyzePricing } from "@/lib/calculations";
import { saveAnalysisHistory } from "@/lib/supabase";
import { fetchUnidadeApostas } from "@/lib/unidade";
import type { PricingInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inputs: PricingInput[];
      titulo?: string;
      impulso25Plus?: boolean;
      superOdd?: boolean;
    };
    const titulo = body.titulo?.trim() || null;
    const partial = {
      ...analyzePricing(body.inputs),
      titulo,
      impulso25Plus: body.impulso25Plus ?? false,
      superOdd: body.superOdd ?? false,
    };

    const unidade = await fetchUnidadeApostas();
    const result = {
      ...partial,
      sugestaoAposta: calculateBetSuggestion(partial, unidade),
    };

    try {
      await saveAnalysisHistory(result);
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar análise.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
