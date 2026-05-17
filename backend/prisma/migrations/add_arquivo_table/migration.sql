-- CreateTable
CREATE TABLE IF NOT EXISTS "administrativo"."arquivo" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "paciente_id" TEXT,
    "consulta_id" TEXT,
    "orcamento_id" TEXT,
    "nome_original" TEXT NOT NULL,
    "nome_storage" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OUTRO',
    "visibilidade" TEXT NOT NULL DEFAULT 'RESTRITO',
    "url_temp" TEXT,
    "expira_em" TIMESTAMP(3),
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "arquivo_clinic_id_paciente_id_idx" ON "administrativo"."arquivo"("clinic_id", "paciente_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "arquivo_clinic_id_categoria_idx" ON "administrativo"."arquivo"("clinic_id", "categoria");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "arquivo_clinic_id_created_at_idx" ON "administrativo"."arquivo"("clinic_id", "created_at");
