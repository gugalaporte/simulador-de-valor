"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionTitleFormProps {
  sessionId: string;
  initialTitulo?: string | null;
  onSaved?: (titulo: string | null) => void;
}

export function SessionTitleForm({
  sessionId,
  initialTitulo = null,
  onSaved,
}: SessionTitleFormProps) {
  const [titulo, setTitulo] = useState(initialTitulo ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(initialTitulo ?? "");
  }, [initialTitulo, sessionId]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setIsSaving(true);

    const tituloNormalizado = titulo.trim() || null;

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          titulo: tituloNormalizado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar.");
      }

      setSaved(true);
      onSaved?.(tituloNormalizado);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-cyan-500/20 bg-cyan-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-cyan-400" />
          <CardTitle className="text-base">Título da Análise</CardTitle>
        </div>
        <p className="text-sm text-slate-400">
          Edite o título para identificar melhor esta análise no histórico.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`titulo-${sessionId}`}>Título</Label>
          <Input
            id={`titulo-${sessionId}`}
            placeholder="Ex: Flamengo x Palmeiras - Over 2.5"
            value={titulo}
            maxLength={120}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

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
            "Salvar Título"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
