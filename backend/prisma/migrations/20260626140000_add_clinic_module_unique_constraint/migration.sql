-- Deduplicate clinic_modules keeping the most recently updated row per (clinic_id, module_catalog_id)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY clinic_id, module_catalog_id
      ORDER BY updated_at DESC, id DESC
    ) AS rn
  FROM configuracoes.clinic_modules
)
DELETE FROM configuracoes.clinic_modules
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

-- Add unique constraint to prevent duplicate module overrides per clinic
CREATE UNIQUE INDEX clinic_modules_clinic_id_module_catalog_id_key
  ON configuracoes.clinic_modules(clinic_id, module_catalog_id);
