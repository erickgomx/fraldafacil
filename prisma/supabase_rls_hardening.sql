-- ==============================================================================
-- SUPABASE POSTGRESQL ROW LEVEL SECURITY (RLS) HARDENING SCRIPT
-- Standards: OWASP ASVS v4.0.3 Section V4 (Access Control Verification)
-- CIS PostgreSQL Benchmark
--
-- Objective:
-- Block unauthorized direct PostgREST / Supabase Data API access (via anon / public key),
-- while maintaining full operational capability for Prisma ORM (via postgres / service_role).
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas da aplicação
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GiftItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PollVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GuestMessage" ENABLE ROW LEVEL SECURITY;

-- 2. Garantir que a role 'service_role' e 'postgres' (utilizadas pelo Prisma no Next.js)
-- mantenham acesso total administrativo
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 3. Políticas de Isolamento para a role 'anon' (Chave Pública Supabase / PostgREST API)
-- Remove permissões perigosas diretas da role 'anon'
REVOKE ALL ON TABLE "User" FROM anon;
REVOKE ALL ON TABLE "Order" FROM anon;
REVOKE ALL ON TABLE "Event" FROM anon; -- Bloqueio estrito: impede exposição de mpAccessToken, mpRefreshToken e pixKey
REVOKE INSERT, UPDATE, DELETE ON TABLE "GiftItem" FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE "GuestMessage" FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE "PollVote" FROM anon;

-- Políticas de Consulta Restritas (Read-Only) para a camada pública
-- Para o Evento, expõe exclusivamente uma View higienizada sem credenciais de pagamento ou chaves OAuth
DROP VIEW IF EXISTS "public_events";
CREATE OR REPLACE VIEW "public_events" AS
SELECT 
  id,
  slug,
  "eventType",
  "babyName",
  "boyName",
  "girlName",
  "parentsNames",
  "eventDate",
  "coverImageUrl",
  "storyMessage",
  "themeColor",
  "revealedGender",
  "feePayer",
  "mpConnected",
  "createdAt"
FROM "Event";

GRANT SELECT ON "public_events" TO anon;

DROP POLICY IF EXISTS "Anon view active gift items" ON "GiftItem";
CREATE POLICY "Anon view active gift items" ON "GiftItem"
  FOR SELECT
  TO anon
  USING (active = true);

DROP POLICY IF EXISTS "Anon view guest messages" ON "GuestMessage";
CREATE POLICY "Anon view guest messages" ON "GuestMessage"
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon view poll votes" ON "PollVote";
CREATE POLICY "Anon view poll votes" ON "PollVote"
  FOR SELECT
  TO anon
  USING (true);
