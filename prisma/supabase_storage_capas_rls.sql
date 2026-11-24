-- ==============================================================================
-- SUPABASE STORAGE RLS POLICIES — BUCKET "capas" (Fralda Online)
-- ==============================================================================
-- Como executar:
-- 1. Acesse o painel do Supabase > SQL Editor > New query
-- 2. Cole todo este script e clique em "Run"
--
-- Arquitetura de segurança:
-- - Leitura pública (SELECT) liberada para visitantes exibirem a foto de capa
--   e cards OpenGraph no WhatsApp.
-- - Escrita, atualização e exclusão (INSERT/UPDATE/DELETE) restritas à role
--   `service_role` (usada exclusivamente pelo servidor Next.js autenticado),
--   bloqueando uploads anônimos diretos de terceiros no bucket.
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capas',
  'capas',
  true,
  3145728,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public read access for capas" ON storage.objects;
CREATE POLICY "Public read access for capas"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'capas');

DROP POLICY IF EXISTS "Service role insert for capas" ON storage.objects;
CREATE POLICY "Service role insert for capas"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'capas');

DROP POLICY IF EXISTS "Service role update for capas" ON storage.objects;
CREATE POLICY "Service role update for capas"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'capas')
  WITH CHECK (bucket_id = 'capas');

DROP POLICY IF EXISTS "Service role delete for capas" ON storage.objects;
CREATE POLICY "Service role delete for capas"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'capas');
