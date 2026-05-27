-- Migration: add_dentista_procedimentos
-- Associação dentista-procedimento com duração customizada e comissão

CREATE TABLE IF NOT EXISTS "clinico"."dentista_procedimentos" (
    "id" TEXT NOT NULL,
    "dentista_id" TEXT NOT NULL,
    "procedimento_template_id" TEXT NOT NULL,
    "duracao_customizada_min" INTEGER,
    "comissao_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentista_procedimentos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_dentista_proc" UNIQUE ("dentista_id", "procedimento_template_id"),
    CONSTRAINT "dentista_procedimentos_procedimento_template_id_fkey" FOREIGN KEY ("procedimento_template_id") REFERENCES "clinico"."procedimento_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "dentista_procedimentos_clinic_id_idx" ON "clinico"."dentista_procedimentos"("clinic_id");
CREATE INDEX "dentista_procedimentos_dentista_idx" ON "clinico"."dentista_procedimentos"("dentista_id");
CREATE INDEX "dentista_procedimentos_template_idx" ON "clinico"."dentista_procedimentos"("procedimento_template_id");
