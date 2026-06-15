"use client";

import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FONTES } from "@/lib/sources";
import type { PricingInput } from "@/lib/types";

export interface AnalysisOptions {
  titulo?: string;
  impulso25Plus?: boolean;
  superOdd?: boolean;
}

interface PricingFormProps {
  onAnalyze: (inputs: PricingInput[], options?: AnalysisOptions) => void;
  isLoading?: boolean;
}

const EMPTY_ROWS = [
  { odd: "", fonte: "" },
  { odd: "", fonte: "" },
  { odd: "", fonte: "" },
];

export function PricingForm({ onAnalyze, isLoading }: PricingFormProps) {
  const [rows, setRows] = useState(EMPTY_ROWS);
  const [titulo, setTitulo] = useState("");
  const [impulso25Plus, setImpulso25Plus] = useState(false);
  const [superOdd, setSuperOdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, field: "odd" | "fonte", value: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    setError(null);
  }

  function getAvailableFontes(currentIndex: number): string[] {
    const usedFontes = rows
      .map((row, i) => (i !== currentIndex ? row.fonte : ""))
      .filter(Boolean);

    return FONTES.filter((fonte) => !usedFontes.includes(fonte));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const inputs: PricingInput[] = [];
    const errors: string[] = [];
    const fontesUsadas = new Set<string>();

    rows.forEach((row, index) => {
      const isOptional = index === 2;
      const hasOdd = row.odd.trim() !== "";
      const hasFonte = row.fonte.trim() !== "";

      if (isOptional && !hasOdd && !hasFonte) return;

      if (!hasOdd || !hasFonte) {
        errors.push(`Linha ${index + 1}: preencha odd e fonte.`);
        return;
      }

      if (fontesUsadas.has(row.fonte)) {
        errors.push(`Linha ${index + 1}: fonte já selecionada em outra linha.`);
        return;
      }

      const odd = parseFloat(row.odd.replace(",", "."));

      if (Number.isNaN(odd) || odd <= 1) {
        errors.push(`Linha ${index + 1}: odd deve ser maior que 1.`);
        return;
      }

      fontesUsadas.add(row.fonte);
      inputs.push({ odd, fonte: row.fonte });
    });

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (inputs.length < 2) {
      setError("Informe pelo menos duas precificações válidas.");
      return;
    }

    onAnalyze(inputs, {
      titulo: titulo.trim() || undefined,
      impulso25Plus,
      superOdd,
    });
  }

  return (
    <Card className="border-slate-800/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          <CardTitle className="text-base">Entrada de Precificações</CardTitle>
        </div>
        <p className="text-sm text-slate-400">
          Insira 2 a 3 odds do mesmo evento para análise comparativa.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <Label htmlFor="titulo">Título da análise</Label>
            <Input
              id="titulo"
              placeholder="Ex: Flamengo x Palmeiras - Over 2.5"
              value={titulo}
              maxLength={120}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <p className="text-xs text-slate-500">Opcional — ajuda a identificar no histórico.</p>
          </div>

          {rows.map((row, index) => {
            const availableFontes = getAvailableFontes(index);
            const selectedUnavailable =
              row.fonte !== "" && !availableFontes.includes(row.fonte);

            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-[1fr_1.2fr]"
              >
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-sm font-medium text-slate-300">
                    Linha {index + 1}
                    {index === 2 && (
                      <span className="ml-2 text-xs text-slate-500">(opcional)</span>
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`odd-${index}`}>Odd</Label>
                  <Input
                    id={`odd-${index}`}
                    inputMode="decimal"
                    placeholder="Ex: 2.25"
                    value={row.odd}
                    onChange={(e) => updateRow(index, "odd", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`fonte-${index}`}>Fonte</Label>
                  <Select
                    id={`fonte-${index}`}
                    value={row.fonte}
                    onChange={(e) => updateRow(index, "fonte", e.target.value)}
                  >
                    <option value="" disabled>
                      Selecione a fonte
                    </option>
                    {row.fonte && selectedUnavailable && (
                      <option value={row.fonte}>{row.fonte}</option>
                    )}
                    {availableFontes.map((fonte) => (
                      <option key={fonte} value={fonte}>
                        {fonte}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="impulso-25" className="cursor-pointer text-slate-300">
                Impulso 25%+
              </Label>
              <Switch
                id="impulso-25"
                checked={impulso25Plus}
                onCheckedChange={setImpulso25Plus}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="super-odd" className="cursor-pointer text-slate-300">
                Odd Aumentada
              </Label>
              <Switch
                id="super-odd"
                checked={superOdd}
                onCheckedChange={setSuperOdd}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            <TrendingUp className="h-5 w-5" />
            {isLoading ? "Analisando..." : "Analisar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
