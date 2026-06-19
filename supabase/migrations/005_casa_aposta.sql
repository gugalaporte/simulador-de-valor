-- Casa de aposta para análises pessoais
ALTER TABLE analysis_sessions
  ADD COLUMN IF NOT EXISTS casa_aposta TEXT;
