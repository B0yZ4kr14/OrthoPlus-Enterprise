-- Add columns to arquivo
ALTER TABLE "administrativo"."arquivo" 
ADD COLUMN "ocr_status" TEXT DEFAULT 'PENDENTE',
ADD COLUMN "versao_atual_id" TEXT;

-- Create arquivo_ocr table
CREATE TABLE "administrativo"."arquivo_ocr" (
    "id" TEXT NOT NULL,
    "arquivo_id" TEXT NOT NULL,
    "texto_extraido" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "idioma" TEXT DEFAULT 'pt',
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "arquivo_ocr_pkey" PRIMARY KEY ("id")
);

-- Create arquivo_versao table
CREATE TABLE "administrativo"."arquivo_versao" (
    "id" TEXT NOT NULL,
    "arquivo_id" TEXT NOT NULL,
    "numero_versao" INTEGER NOT NULL,
    "nome_storage" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "url_temp" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arquivo_versao_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "arquivo_ocr_arquivo_id_idx" ON "administrativo"."arquivo_ocr"("arquivo_id");
CREATE INDEX "arquivo_versao_arquivo_id_numero_versao_idx" ON "administrativo"."arquivo_versao"("arquivo_id", "numero_versao");
