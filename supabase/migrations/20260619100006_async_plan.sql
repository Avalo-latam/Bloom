-- Bloom English — self-paced async plan.
-- A student's enrollment is either 'guided' (live classes, teacher-gated) or
-- 'async' (self-paced; modules auto-unlock as the previous one is completed).

create type enrollment_plan as enum ('guided', 'async');
alter table public.enrollments
  add column plan enrollment_plan not null default 'guided';

alter table public.pricing
  add column async_price numeric not null default 20000;

-- Enable the async plan for a student in a level: flips the plan and unlocks
-- the first module. Staff-only (the security-definer body still checks teaches).
create or replace function public.enable_async(p_student uuid, p_level uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_first uuid;
begin
  if not public.teaches(p_student) then
    raise exception 'Only the assigned teacher can enable a plan';
  end if;

  update public.enrollments
    set plan = 'async', status = 'active'
    where student_id = p_student and level_id = p_level;
  if not found then
    insert into public.enrollments (student_id, level_id, plan, status, teacher_id)
    values (p_student, p_level, 'async', 'active', auth.uid());
  end if;

  select id into v_first
    from public.units where level_id = p_level order by sort_order limit 1;
  if v_first is not null then
    insert into public.lesson_access (student_id, lesson_id, released_by)
    select p_student, l.id, auth.uid()
      from public.lessons l where l.unit_id = v_first
    on conflict (student_id, lesson_id) do nothing;
  end if;
end;
$$;
grant execute on function public.enable_async(uuid, uuid) to authenticated;

-- When an async student completes a lesson, unlock the next module once the
-- current one is fully complete. Safe to call after every completion.
create or replace function public.async_unlock_next(p_student uuid, p_lesson uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_unit uuid; v_level uuid; v_next uuid; v_remaining int;
begin
  -- the caller may only advance their own path
  if auth.uid() <> p_student and not public.teaches(p_student) then
    return;
  end if;

  select unit_id, level_id into v_unit, v_level
    from public.lessons where id = p_lesson;

  if not exists (
    select 1 from public.enrollments e
    where e.student_id = p_student and e.level_id = v_level
      and e.plan = 'async' and e.status = 'active'
  ) then
    return;
  end if;

  select count(*) into v_remaining
    from public.lessons l
    left join public.lesson_access la
      on la.lesson_id = l.id and la.student_id = p_student
    where l.unit_id = v_unit and la.completed_at is null;
  if v_remaining > 0 then return; end if;

  select u2.id into v_next
    from public.units u1
    join public.units u2
      on u2.level_id = u1.level_id and u2.sort_order = u1.sort_order + 1
    where u1.id = v_unit;
  if v_next is null then return; end if;

  insert into public.lesson_access (student_id, lesson_id)
  select p_student, l.id from public.lessons l where l.unit_id = v_next
  on conflict (student_id, lesson_id) do nothing;
end;
$$;
grant execute on function public.async_unlock_next(uuid, uuid) to authenticated;
