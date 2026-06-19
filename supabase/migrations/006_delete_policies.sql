-- Permite apagar registros do histórico e sessões
CREATE POLICY "Permitir exclusão pública do histórico"
  ON analysis_history FOR DELETE
  USING (true);

CREATE POLICY "Permitir exclusão pública das sessões"
  ON analysis_sessions FOR DELETE
  USING (true);
