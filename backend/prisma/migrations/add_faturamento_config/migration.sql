CREATE TABLE IF NOT EXISTS faturamento.faturamento_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL UNIQUE,
    cnpj_emitente TEXT,
    razao_social TEXT,
    serie_nfe TEXT,
    serie_nfce TEXT,
    ambiente TEXT NOT NULL DEFAULT 'homologacao',
    certificado_a1_path TEXT,
    certificado_senha TEXT,
    certificado_vencimento TEXT,
    regime_tributario TEXT,
    inscricao_estadual TEXT,
    inscricao_municipal TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faturamento_config_clinic_id ON faturamento.faturamento_config(clinic_id);
