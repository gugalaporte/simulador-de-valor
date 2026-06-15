import { NextResponse } from "next/server";
import { analyzePricing } from "@/lib/calculations";
import { saveAnalysisHistory } from "@/lib/supabase";
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
    const result = {
      ...analyzePricing(body.inputs),
      titulo,
      impulso25Plus: body.impulso25Plus ?? false,
      superOdd: body.superOdd ?? false,
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
