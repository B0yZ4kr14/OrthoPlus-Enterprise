CREATE TABLE IF NOT EXISTS clinico.tiss_convenios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    codigo_operadora TEXT,
    cnpj TEXT,
    registro_ans TEXT,
    tipo_plano TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tiss_convenios_clinic_id ON clinico.tiss_convenios(clinic_id);
