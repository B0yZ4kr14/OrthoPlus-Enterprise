-- Migration: Add paciente_convenios table for patient-insurance linkage
CREATE TABLE IF NOT EXISTS pacientes.paciente_convenios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    convenio_id TEXT NOT NULL,
    numero_carteira TEXT,
    validade_carteira TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paciente_convenios_patient_id ON pacientes.paciente_convenios(patient_id);
CREATE INDEX IF NOT EXISTS idx_paciente_convenios_convenio_id ON pacientes.paciente_convenios(convenio_id);
CREATE INDEX IF NOT EXISTS idx_paciente_convenios_clinic_id ON pacientes.paciente_convenios(clinic_id);
