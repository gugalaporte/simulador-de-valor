-- Tabela de histórico estatístico das análises
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id UUID NOT NULL,
  fonte TEXT NOT NULL,
  odd NUMERIC(10, 4) NOT NULL,
  probabilidade_implicita NUMERIC(10, 6) NOT NULL,
  consenso NUMERIC(10, 6) NOT NULL,
  upside NUMERIC(10, 6) NOT NULL,
  gap NUMERIC(10, 6) NOT NULL,
  divergencia NUMERIC(10, 6) NOT NULL,
  z_score NUMERIC(10, 6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at
  ON analysis_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_history_session_id
  ON analysis_history (session_id);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública do histórico"
  ON analysis_history FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública do histórico"
  ON analysis_history FOR INSERT
  WITH CHECK (true);
