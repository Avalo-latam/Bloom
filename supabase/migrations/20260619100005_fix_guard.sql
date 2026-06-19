-- Bloom English — only enforce the profile guard for authenticated end users.
-- Trusted server contexts (service_role / postgres) have a null auth.uid()
-- and legitimately need to set role/teacher_id (e.g. creating students).
-- Anonymous requests never reach this trigger because RLS blocks the UPDATE.

create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new; -- service_role / server-side seed: allow.
  end if;
  if new.role is distinct from old.role and not public.is_owner() then
    raise exception 'Only the owner can change roles';
  end if;
  if new.teacher_id is distinct from old.teacher_id and not public.is_staff() then
    raise exception 'Only staff can reassign a student''s teacher';
  end if;
  return new;
end;
$$;
