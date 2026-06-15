-- Metadados da sessão de análise (valor apostado e resultado)
CREATE TABLE IF NOT EXISTS analysis_sessions (
  session_id UUID PRIMARY KEY,
  valor_apostado NUMERIC(12, 2),
  resultado TEXT CHECK (resultado IN ('green', 'red')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública das sessões"
  ON analysis_sessions FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública das sessões"
  ON analysis_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública das sessões"
  ON analysis_sessions FOR UPDATE
  USING (true);
