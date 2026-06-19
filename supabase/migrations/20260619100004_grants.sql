-- Bloom English — table privileges
-- RLS controls *which rows* a user sees; the role still needs table-level
-- GRANTs. Tables created via raw SQL don't inherit Supabase's default grants,
-- so grant them explicitly to the authenticated role (RLS remains the gate).

grant usage on schema public to authenticated, anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Apply to anything created later, too.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant execute on functions to authenticated;
