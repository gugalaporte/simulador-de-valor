import type { HistorySession } from "./history";
import type { UpsideClassificacao } from "./types";

export type ReceitasClassificacao = UpsideClassificacao;

export type ReceitasMarcador =
  | "Análise Pessoal"
  | "Odd Aumentada"
  | "Impulso 25%+";

export interface LucroPorClassificacao {
  classificacao: ReceitasClassificacao;
  lucro: number;
  apostas: number;
  greens: number;
  taxaAcerto: number;
}

export interface LucroPorMarcador {
  marcador: ReceitasMarcador;
  lucro: number;
  apostas: number;
  greens: number;
  taxaAcerto: number;
}

const CLASSIFICACAO_ORDER: ReceitasClassificacao[] = [
  "Excepcional",
  "Forte",
  "Moderado",
  "Fraco",
];

const MARCADOR_ORDER: ReceitasMarcador[] = [
  "Análise Pessoal",
  "Odd Aumentada",
  "Impulso 25%+",
];

function getSessionMarcadores(session: HistorySession): ReceitasMarcador[] {
  const marcadores: ReceitasMarcador[] = [];

  if (session.analisePessoal) marcadores.push("Análise Pessoal");
  if (session.superOdd) marcadores.push("Odd Aumentada");
  if (session.impulso25Plus) marcadores.push("Impulso 25%+");

  return marcadores;
}

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
  unidade: number;
  lucroPorFonte: { fonte: string; lucro: number; apostas: number }[];
  lucroPorClassificacao: LucroPorClassificacao[];
  lucroPorMarcador: LucroPorMarcador[];
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
  const lucroPorClassificacaoMap = new Map<
    ReceitasClassificacao,
    { lucro: number; apostas: number; greens: number }
  >();
  const lucroPorMarcadorMap = new Map<
    ReceitasMarcador,
    { lucro: number; apostas: number; greens: number }
  >();

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

    if (!session.analisePessoal) {
      const classificacao = session.maiorUpside.classificacao;
      const classStats = lucroPorClassificacaoMap.get(classificacao) ?? {
        lucro: 0,
        apostas: 0,
        greens: 0,
      };

      classStats.lucro += lucro;
      classStats.apostas += 1;
      if (session.resultado === "green") classStats.greens += 1;
      lucroPorClassificacaoMap.set(classificacao, classStats);
    }

    for (const marcador of getSessionMarcadores(session)) {
      const marcadorStats = lucroPorMarcadorMap.get(marcador) ?? {
        lucro: 0,
        apostas: 0,
        greens: 0,
      };

      marcadorStats.lucro += lucro;
      marcadorStats.apostas += 1;
      if (session.resultado === "green") marcadorStats.greens += 1;
      lucroPorMarcadorMap.set(marcador, marcadorStats);
    }
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
    unidade:
      apostasResolvidas.length > 0
        ? totalApostado / apostasResolvidas.length
        : 0,
    lucroPorFonte: Array.from(lucroPorFonteMap.entries())
      .map(([fonte, stats]) => ({ fonte, ...stats }))
      .sort((a, b) => b.lucro - a.lucro),
    lucroPorClassificacao: CLASSIFICACAO_ORDER.filter((classificacao) =>
      lucroPorClassificacaoMap.has(classificacao)
    ).map((classificacao) => {
      const stats = lucroPorClassificacaoMap.get(classificacao)!;

      return {
        classificacao,
        lucro: stats.lucro,
        apostas: stats.apostas,
        greens: stats.greens,
        taxaAcerto: stats.apostas > 0 ? stats.greens / stats.apostas : 0,
      };
    }),
    lucroPorMarcador: MARCADOR_ORDER.filter((marcador) =>
      lucroPorMarcadorMap.has(marcador)
    ).map((marcador) => {
      const stats = lucroPorMarcadorMap.get(marcador)!;

      return {
        marcador,
        lucro: stats.lucro,
        apostas: stats.apostas,
        greens: stats.greens,
        taxaAcerto: stats.apostas > 0 ? stats.greens / stats.apostas : 0,
      };
    }),
    apostasRecentes: apostasResolvidas
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10),
  };
}
