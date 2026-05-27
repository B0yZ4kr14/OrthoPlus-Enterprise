-- Migration: add_glosa_fields
-- Add glosa tracking fields to tiss_guides

ALTER TABLE "clinico"."tiss_guides" 
ADD COLUMN IF NOT EXISTS "glosa_amount" INTEGER,
ADD COLUMN IF NOT EXISTS "glosa_date" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "glosa_reason" TEXT;
