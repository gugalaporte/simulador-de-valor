export const FONTES = ["Betano", "Bet365", "SuperBet"] as const;

export type Fonte = (typeof FONTES)[number];

export function isFonteValida(value: string): value is Fonte {
  return (FONTES as readonly string[]).includes(value);
}
