export const FONTES = ["Betano", "Bet365", "SuperBet"] as const;

export type Fonte = (typeof FONTES)[number];
