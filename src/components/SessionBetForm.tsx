"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BetResultado } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface SessionBetFormProps {
  sessionId: string;
  initialValorApostado?: number | null;
  initialResultado?: BetResultado | null;
  melhorPrecoOdd: number;
  onSaved?: (data: {
    valorApostado: number | null;
    resultado: BetResultado | null;
  }) => void;
}

export function SessionBetForm({
  sessionId,
  initialValorApostado = null,
  initialResultado = null,
  melhorPrecoOdd,
  onSaved,
}: SessionBetFormProps) {
  const [valor, setValor] = useState(
    initialValorApostado ? String(initialValorApostado) : ""
  );
  const [resultado, setResultado] = useState<BetResultado | null>(
    initialResultado
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValor(initialValorApostado ? String(initialValorApostado) : "");
    setResultado(initialResultado);
  }, [initialValorApostado, initialResultado, sessionId]);

  const valorNumerico = parseFloat(valor.replace(",", "."));
  const retornoPotencial =
    !Number.isNaN(valorNumerico) && valorNumerico > 0
      ? valorNumerico * melhorPrecoOdd
      : null;

  async function handleSave() {
    setError(null);
    setSaved(false);

    const valorApostado = valor.trim() === "" ? null : valorNumerico;

    if (valorApostado !== null && (Number.isNaN(valorApostado) || valorApostado <= 0)) {
      setError("Informe um valor apostado válido.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          valorApostado,
          resultado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar.");
      }

      setSaved(true);
      onSaved?.({ valorApostado, resultado });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <CardTitle className="text-base">Registro da Aposta</CardTitle>
        </div>
        <p className="text-sm text-slate-400">
          Informe o valor apostado e o resultado após a análise.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`valor-${sessionId}`}>Valor Apostado (R$)</Label>
          <Input
            id={`valor-${sessionId}`}
            inputMode="decimal"
            placeholder="Ex: 100,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          {retornoPotencial !== null && (
            <p className="text-xs text-slate-400">
              Retorno potencial no melhor preço:{" "}
              <span className="font-mono text-emerald-400">
                {formatCurrency(retornoPotencial)}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Resultado</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setResultado((current) => (current === "green" ? null : "green"))
              }
              className={cn(
                "h-12 rounded-xl border text-sm font-semibold transition-colors",
                resultado === "green"
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600"
              )}
            >
              Green
            </button>
            <button
              type="button"
              onClick={() =>
                setResultado((current) => (current === "red" ? null : "red"))
              }
              className={cn(
                "h-12 rounded-xl border text-sm font-semibold transition-colors",
                resultado === "red"
                  ? "border-rose-400 bg-rose-500/20 text-rose-300"
                  : "border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600"
              )}
            >
              Red
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Salvo!
            </>
          ) : (
            "Salvar Aposta"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
