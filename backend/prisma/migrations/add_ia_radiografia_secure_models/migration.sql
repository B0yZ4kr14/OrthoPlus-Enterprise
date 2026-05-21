-- Migration: IA-Radiografia Secure Models (Security Review SA-1/SS-3)
-- Created: 2026-05-21

-- Create enums in schema pep
CREATE TYPE "pep"."TipoConsentimentoIA" AS ENUM ('IA_RADIOGRAFIA');
CREATE TYPE "pep"."TipoRadiografia" AS ENUM ('PERIAPICAL', 'PANORAMICA', 'BITE_WING', 'OCLUSAL', 'LATERAL');
CREATE TYPE "pep"."StatusAnaliseIA" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDA', 'ERRO');
CREATE TYPE "pep"."AcaoAuditIA" AS ENUM ('UPLOAD', 'ANALISAR', 'REVISAR', 'EXPORTAR', 'REVOGAR_CONSENTIMENTO', 'VISUALIZAR');

-- Create table: paciente_consentimento_ia
CREATE TABLE "pep"."paciente_consentimento_ia" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "tipo_consentimento" "pep"."TipoConsentimentoIA" NOT NULL,
    "consentido" BOOLEAN NOT NULL DEFAULT false,
    "data_consentimento" TIMESTAMP(3),
    "ip_consentimento" TEXT,
    "hash_termo" TEXT,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "data_revogacao" TIMESTAMP(3),
    "motivo_revogacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paciente_consentimento_ia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "paciente_consentimento_ia_paciente_id_tipo_consentimento_idx" ON "pep"."paciente_consentimento_ia"("paciente_id", "tipo_consentimento");
CREATE INDEX "paciente_consentimento_ia_clinic_id_idx" ON "pep"."paciente_consentimento_ia"("clinic_id");

-- Create table: ia_radiografia_analise
CREATE TABLE "pep"."ia_radiografia_analise" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "prontuario_id" TEXT,
    "dentista_id" TEXT NOT NULL,
    "imagem_hash" TEXT NOT NULL,
    "imagem_storage_path" TEXT NOT NULL,
    "tipo_radiografia" "pep"."TipoRadiografia" NOT NULL,
    "status" "pep"."StatusAnaliseIA" NOT NULL DEFAULT 'PENDENTE',
    "resultado_ia" JSONB,
    "confidence_score" DOUBLE PRECISION,
    "processamento_ms" INTEGER,
    "revisada" BOOLEAN NOT NULL DEFAULT false,
    "dentista_revisor_id" TEXT,
    "observacoes_dentista" TEXT,
    "assinatura_digital" TEXT,
    "modelo_usado" TEXT NOT NULL DEFAULT 'local/llama-3.3',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ia_radiografia_analise_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ia_radiografia_analise_clinic_id_status_idx" ON "pep"."ia_radiografia_analise"("clinic_id", "status");
CREATE INDEX "ia_radiografia_analise_paciente_id_idx" ON "pep"."ia_radiografia_analise"("paciente_id");
CREATE INDEX "ia_radiografia_analise_dentista_id_idx" ON "pep"."ia_radiografia_analise"("dentista_id");

-- Create table: ia_radiografia_audit_log
CREATE TABLE "pep"."ia_radiografia_audit_log" (
    "id" TEXT NOT NULL,
    "analise_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "dentista_id" TEXT NOT NULL,
    "acao" "pep"."AcaoAuditIA" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "detalhes" JSONB,

    CONSTRAINT "ia_radiografia_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ia_radiografia_audit_log_analise_id_idx" ON "pep"."ia_radiografia_audit_log"("analise_id");
CREATE INDEX "ia_radiografia_audit_log_paciente_id_idx" ON "pep"."ia_radiografia_audit_log"("paciente_id");
CREATE INDEX "ia_radiografia_audit_log_clinic_id_timestamp_idx" ON "pep"."ia_radiografia_audit_log"("clinic_id", "timestamp");
