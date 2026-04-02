-- Seed: initial admin user
-- =============================================================================
-- IMPORTANT: This file is a TEMPLATE. It must be customised before use.
--
-- Steps:
--   1. Generate a bcrypt hash for your desired admin password:
--        node -e "const b=require('bcrypt'); b.hash('YOUR_PASSWORD',10).then(console.log)"
--   2. Replace the placeholder text below with the hash output.
--   3. NEVER commit a file containing a real password hash to source control.
-- =============================================================================

INSERT INTO users (id, email, password_hash, role, clinic_id, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  COALESCE(current_setting('app.seed_admin_email', true), 'admin@clinic.com'),
  -- TODO: replace with the bcrypt hash generated from your admin password
  '<REPLACE_WITH_BCRYPT_HASH>',
  'ADMIN',
  NULL,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
