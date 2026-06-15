"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, UserRound, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BetResultado, SessionMeta } from "@/lib/types";
import { cn, formatCurrency, formatDateTime, formatOdd } from "@/lib/utils";

interface PersonalBetDetailProps {
  bet: SessionMeta;
  onBack: () => void;
  onUpdated?: (bet: SessionMeta) => void;
}

export function PersonalBetDetail({ bet, onBack, onUpdated }: PersonalBetDetailProps) {
  const [titulo, setTitulo] = useState(bet.titulo ?? "");
  const [valor, setValor] = useState(
    bet.valorApostado ? String(bet.valorApostado) : ""
  );
  const [odd, setOdd] = useState(bet.oddAposta ? String(bet.oddAposta) : "");
  const [resultado, setResultado] = useState<BetResultado | null>(bet.resultado);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(bet.titulo ?? "");
    setValor(bet.valorApostado ? String(bet.valorApostado) : "");
    setOdd(bet.oddAposta ? String(bet.oddAposta) : "");
    setResultado(bet.resultado);
  }, [bet]);

  async function handleSave() {
    setError(null);
    setSaved(false);

    const valorApostado = valor.trim() === "" ? null : parseFloat(valor.replace(",", "."));
    const oddAposta = odd.trim() === "" ? null : parseFloat(odd.replace(",", "."));

    if (valorApostado !== null && (Number.isNaN(valorApostado) || valorApostado <= 0)) {
      setError("Informe um valor apostado válido.");
      return;
    }

    if (oddAposta !== null && (Number.isNaN(oddAposta) || oddAposta <= 1)) {
      setError("Informe uma odd maior que 1.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: bet.sessionId,
          titulo: titulo.trim() || null,
          valorApostado,
          oddAposta,
          resultado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar.");
      }

      const updated: SessionMeta = {
        ...bet,
        titulo: titulo.trim() || null,
        valorApostado,
        oddAposta,
        resultado,
      };

      setSaved(true);
      onUpdated?.(updated);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
        ← Voltar ao histórico
      </Button>

      <Card className="border-sky-500/20 bg-sky-500/5">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <UserRound className="h-5 w-5 text-sky-400" />
            <CardTitle className="text-base">Análise Pessoal</CardTitle>
            <Badge variant="default">Análise Pessoal</Badge>
            {bet.resultado && (
              <Badge variant={bet.resultado === "green" ? "success" : "danger"}>
                {bet.resultado === "green" ? "Green" : "Red"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {formatDateTime(bet.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`personal-title-${bet.sessionId}`}>Título</Label>
            <Input
              id={`personal-title-${bet.sessionId}`}
              value={titulo}
              maxLength={120}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`personal-valor-${bet.sessionId}`}>Valor Apostado (R$)</Label>
              <Input
                id={`personal-valor-${bet.sessionId}`}
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`personal-odd-${bet.sessionId}`}>Odd</Label>
              <Input
                id={`personal-odd-${bet.sessionId}`}
                inputMode="decimal"
                value={odd}
                onChange={(e) => setOdd(e.target.value)}
              />
            </div>
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
                  "h-11 rounded-xl border text-sm font-semibold transition-colors",
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
                  "h-11 rounded-xl border text-sm font-semibold transition-colors",
                  resultado === "red"
                    ? "border-rose-400 bg-rose-500/20 text-rose-300"
                    : "border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600"
                )}
              >
                Red
              </button>
            </div>
          </div>

          {bet.valorApostado && bet.oddAposta && (
            <p className="text-xs text-slate-500">
              Retorno potencial:{" "}
              <span className="font-mono text-emerald-400">
                {formatCurrency(bet.valorApostado * bet.oddAposta)}
              </span>{" "}
              · Odd {formatOdd(bet.oddAposta)}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
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
              <>
                <Wallet className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
