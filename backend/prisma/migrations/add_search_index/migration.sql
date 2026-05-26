-- Migration: add_search_index
-- Created manually due to shadow database constraints in multiSchema setup

-- Create search_index table in core schema
CREATE TABLE IF NOT EXISTS "core"."search_index" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" TEXT,
    "module" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_index_pkey" PRIMARY KEY ("id")
);

-- Create standard B-tree indexes
CREATE INDEX "search_index_entity_type_idx" ON "core"."search_index"("entity_type");
CREATE INDEX "search_index_clinic_id_idx" ON "core"."search_index"("clinic_id");
CREATE INDEX "search_index_updated_at_idx" ON "core"."search_index"("updated_at");

-- Add generated tsvector column for full-text search (Portuguese language)
ALTER TABLE "core"."search_index"
ADD COLUMN IF NOT EXISTS "content_tsv" tsvector
GENERATED ALWAYS AS (to_tsvector('portuguese', "content")) STORED;

-- Create GIN index on the tsvector column for fast full-text search
CREATE INDEX "search_index_content_tsv_gin" ON "core"."search_index" USING GIN ("content_tsv");
