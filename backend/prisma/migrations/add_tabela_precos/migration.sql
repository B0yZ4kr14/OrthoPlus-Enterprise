-- Migration: add_tabela_precos
-- Tabela de precos multipla para procedimentos

CREATE TABLE IF NOT EXISTS "clinico"."tabela_precos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "convenio_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabela_precos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "unique_default_per_clinic" ON "clinico"."tabela_precos"("clinic_id", "is_default");
CREATE INDEX "tabela_precos_clinic_id_idx" ON "clinico"."tabela_precos"("clinic_id");
CREATE INDEX "tabela_precos_tipo_idx" ON "clinico"."tabela_precos"("tipo");

CREATE TABLE IF NOT EXISTS "clinico"."procedimento_precos" (
    "id" TEXT NOT NULL,
    "procedimento_template_id" TEXT NOT NULL,
    "tabela_preco_id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "tempo_retorno_dias" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedimento_precos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_proc_tabela" UNIQUE ("procedimento_template_id", "tabela_preco_id"),
    CONSTRAINT "procedimento_precos_procedimento_template_id_fkey" FOREIGN KEY ("procedimento_template_id") REFERENCES "clinico"."procedimento_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "procedimento_precos_tabela_preco_id_fkey" FOREIGN KEY ("tabela_preco_id") REFERENCES "clinico"."tabela_precos"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "procedimento_precos_clinic_id_idx" ON "clinico"."procedimento_precos"("clinic_id");
CREATE INDEX "procedimento_precos_template_idx" ON "clinico"."procedimento_precos"("procedimento_template_id");
CREATE INDEX "procedimento_precos_tabela_idx" ON "clinico"."procedimento_precos"("tabela_preco_id");
