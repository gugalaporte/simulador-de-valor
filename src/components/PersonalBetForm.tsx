"use client";

import { useState } from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FONTES } from "@/lib/sources";
import type { BetResultado } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PersonalBetForm() {
  const [expanded, setExpanded] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [casaAposta, setCasaAposta] = useState("");
  const [valor, setValor] = useState("");
  const [odd, setOdd] = useState("");
  const [resultado, setResultado] = useState<BetResultado | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitulo("");
    setCasaAposta("");
    setValor("");
    setOdd("");
    setResultado(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const valorApostado = parseFloat(valor.replace(",", "."));
    const oddAposta = parseFloat(odd.replace(",", "."));

    if (!casaAposta) {
      setError("Selecione a casa de aposta.");
      return;
    }

    if (Number.isNaN(valorApostado) || valorApostado <= 0) {
      setError("Informe um valor apostado válido.");
      return;
    }

    if (Number.isNaN(oddAposta) || oddAposta <= 1) {
      setError("Informe uma odd maior que 1.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/personal-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim() || undefined,
          casaAposta,
          valorApostado,
          oddAposta,
          resultado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar aposta.");
      }

      setSaved(true);
      resetForm();
      setTimeout(() => {
        setSaved(false);
        setExpanded(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aposta.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => setExpanded(true)}
      >
        <UserRound className="h-4 w-4" />
        Adicionar bet — análise pessoal
      </Button>
    );
  }

  return (
    <Card className="border-sky-500/20 bg-sky-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-sky-400" />
          <CardTitle className="text-base">Análise Pessoal</CardTitle>
        </div>
        <p className="text-sm text-slate-400">
          Registre uma aposta sem comparativo de precificação para contabilizar nas receitas.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-titulo">Título (opcional)</Label>
            <Input
              id="personal-titulo"
              placeholder="Ex: Palpite do dia"
              value={titulo}
              maxLength={120}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-casa">Casa de aposta</Label>
            <Select
              id="personal-casa"
              value={casaAposta}
              onChange={(e) => setCasaAposta(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecione a casa
              </option>
              {FONTES.map((fonte) => (
                <option key={fonte} value={fonte}>
                  {fonte}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="personal-valor">Valor Apostado (R$)</Label>
              <Input
                id="personal-valor"
                inputMode="decimal"
                placeholder="Ex: 50,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-odd">Odd</Label>
              <Input
                id="personal-odd"
                inputMode="decimal"
                placeholder="Ex: 2.25"
                value={odd}
                onChange={(e) => setOdd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resultado (opcional)</Label>
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

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="sm:flex-1"
              onClick={() => {
                setExpanded(false);
                setError(null);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="sm:flex-1" disabled={isSaving}>
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
                "Salvar aposta"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
