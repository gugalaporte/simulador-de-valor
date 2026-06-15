import type { HistorySession } from "./history";

export interface BetSummary {
  sessionId: string;
  createdAt: string;
  fonte: string;
  odd: number;
  valorApostado: number;
  resultado: "green" | "red";
  lucro: number;
}

export interface ReceitasStats {
  lucroTotal: number;
  totalApostado: number;
  roi: number;
  greens: number;
  reds: number;
  pendentes: number;
  totalApostasResolvidas: number;
  taxaAcerto: number;
  mediaLucroPorAposta: number;
  maiorGanho: number;
  maiorPerda: number;
  lucroPorFonte: { fonte: string; lucro: number; apostas: number }[];
  apostasRecentes: BetSummary[];
}

function calcularLucro(
  valor: number,
  odd: number,
  resultado: "green" | "red"
): number {
  if (resultado === "green") {
    return valor * (odd - 1);
  }

  return -valor;
}

export function calculateReceitas(sessions: HistorySession[]): ReceitasStats {
  const apostasResolvidas: BetSummary[] = [];
  let pendentes = 0;
  const lucroPorFonteMap = new Map<string, { lucro: number; apostas: number }>();

  for (const session of sessions) {
    if (session.valorApostado === null || session.valorApostado <= 0) {
      continue;
    }

    if (!session.resultado) {
      pendentes += 1;
      continue;
    }

    const lucro = calcularLucro(
      session.valorApostado,
      session.melhorPreco.odd,
      session.resultado
    );

    const aposta: BetSummary = {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      fonte: session.melhorPreco.fonte,
      odd: session.melhorPreco.odd,
      valorApostado: session.valorApostado,
      resultado: session.resultado,
      lucro,
    };

    apostasResolvidas.push(aposta);

    const fonteStats = lucroPorFonteMap.get(aposta.fonte) ?? {
      lucro: 0,
      apostas: 0,
    };

    fonteStats.lucro += lucro;
    fonteStats.apostas += 1;
    lucroPorFonteMap.set(aposta.fonte, fonteStats);
  }

  const greens = apostasResolvidas.filter((a) => a.resultado === "green").length;
  const reds = apostasResolvidas.filter((a) => a.resultado === "red").length;
  const totalApostado = apostasResolvidas.reduce(
    (sum, aposta) => sum + aposta.valorApostado,
    0
  );
  const lucroTotal = apostasResolvidas.reduce(
    (sum, aposta) => sum + aposta.lucro,
    0
  );
  const lucros = apostasResolvidas.map((aposta) => aposta.lucro);
  const ganhos = lucros.filter((lucro) => lucro > 0);
  const perdas = lucros.filter((lucro) => lucro < 0);

  return {
    lucroTotal,
    totalApostado,
    roi: totalApostado > 0 ? lucroTotal / totalApostado : 0,
    greens,
    reds,
    pendentes,
    totalApostasResolvidas: apostasResolvidas.length,
    taxaAcerto:
      apostasResolvidas.length > 0 ? greens / apostasResolvidas.length : 0,
    mediaLucroPorAposta:
      apostasResolvidas.length > 0
        ? lucroTotal / apostasResolvidas.length
        : 0,
    maiorGanho: ganhos.length > 0 ? Math.max(...ganhos) : 0,
    maiorPerda: perdas.length > 0 ? Math.min(...perdas) : 0,
    lucroPorFonte: Array.from(lucroPorFonteMap.entries())
      .map(([fonte, stats]) => ({ fonte, ...stats }))
      .sort((a, b) => b.lucro - a.lucro),
    apostasRecentes: apostasResolvidas
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10),
  };
}
