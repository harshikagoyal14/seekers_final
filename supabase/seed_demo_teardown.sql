-- ============================================================
-- SEEKERS DEMO DATA TEARDOWN
-- ============================================================
-- Removes all rows inserted by seed_demo.sql.
-- Safe to run multiple times (all deletes are by fixed UUIDs).
--
-- Usage (Supabase CLI):
--   supabase db execute --file supabase/seed_demo_teardown.sql
-- ============================================================

delete from knowledge_reactions where post_id::text like 'f3000001%';
delete from knowledge_posts    where id::text like 'f3000001%';
delete from spotlights         where id::text like 'f2000001%';
delete from initiative_responses where initiative_id::text like 'f1000001%';
delete from initiatives        where id::text like 'f1000001%';
delete from reviews            where id like 'c6000001%';
delete from content            where id like 'c5000001%';
delete from event_rsvps        where event_id like 'e0000001%';
delete from events             where id like 'e0000001%';
delete from referrals          where id like 'ee000001%';
delete from catalogue_items    where id like 'c4000001%';
delete from business_profiles  where id like 'b0000001%';
delete from profiles           where id like 'a0000001%';
delete from categories         where id like 'c0000001%';
delete from auth.users         where id like 'd1000001%';
