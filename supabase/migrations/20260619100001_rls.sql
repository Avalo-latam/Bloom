-- Bloom English — Row Level Security
-- owner = full access · teacher = own students & content · student = own data + released content

-- Helper: the current student's assigned teacher (security definer → no recursion).
create or replace function public.my_teacher_id()
returns uuid language sql stable security definer set search_path = public as $$
  select teacher_id from public.profiles where id = auth.uid();
$$;

-- Has this lesson been released to the current student?
create or replace function public.lesson_released(p_lesson uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.lesson_access
    where lesson_id = p_lesson and student_id = auth.uid()
  );
$$;

-- Prevent role escalation / unauthorized reassignment.
create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    raise exception 'Only the owner can change roles';
  end if;
  if new.teacher_id is distinct from old.teacher_id and not public.is_staff() then
    raise exception 'Only staff can reassign a student''s teacher';
  end if;
  return new;
end;
$$;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- Enable RLS everywhere.
alter table public.profiles         enable row level security;
alter table public.levels           enable row level security;
alter table public.units            enable row level security;
alter table public.lessons          enable row level security;
alter table public.lesson_blocks    enable row level security;
alter table public.quizzes          enable row level security;
alter table public.quiz_questions   enable row level security;
alter table public.enrollments      enable row level security;
alter table public.lesson_access    enable row level security;
alter table public.classes          enable row level security;
alter table public.class_students   enable row level security;
alter table public.attendance       enable row level security;
alter table public.assignments      enable row level security;
alter table public.submissions      enable row level security;
alter table public.exams            enable row level security;
alter table public.exam_results     enable row level security;
alter table public.grade_entries    enable row level security;
alter table public.level_promotions enable row level security;
alter table public.pricing          enable row level security;
alter table public.payments         enable row level security;
alter table public.notifications    enable row level security;

-- ───────────────────────────── profiles ───────────────────────────────
create policy profiles_select on public.profiles for select using (
  id = auth.uid() or public.is_staff() or id = public.my_teacher_id()
);
create policy profiles_update on public.profiles for update using (
  id = auth.uid() or public.teaches(id)
) with check (
  id = auth.uid() or public.teaches(id)
);
create policy profiles_insert on public.profiles for insert with check (
  public.is_staff() or id = auth.uid()
);

-- ───────────────────────────── catalog: levels / units ────────────────
create policy levels_read on public.levels for select using (auth.uid() is not null);
create policy levels_write on public.levels for all using (public.is_owner()) with check (public.is_owner());

create policy units_read on public.units for select using (auth.uid() is not null);
create policy units_write on public.units for all using (public.is_owner()) with check (public.is_owner());

-- ───────────────────────────── lessons ────────────────────────────────
-- Students see lesson rows (for the progress map); block content is gated separately.
create policy lessons_read on public.lessons for select using (auth.uid() is not null);
create policy lessons_insert on public.lessons for insert with check (public.is_staff());
create policy lessons_update on public.lessons for update using (
  public.is_owner() or created_by = auth.uid()
) with check (public.is_owner() or created_by = auth.uid());
create policy lessons_delete on public.lessons for delete using (
  public.is_owner() or created_by = auth.uid()
);

-- ───────────────────────────── lesson_blocks (gated) ──────────────────
create policy lesson_blocks_read on public.lesson_blocks for select using (
  public.is_staff() or public.lesson_released(lesson_id)
);
create policy lesson_blocks_write on public.lesson_blocks for all using (
  public.is_staff()
) with check (public.is_staff());

-- ───────────────────────────── quizzes ────────────────────────────────
create policy quizzes_read on public.quizzes for select using (
  public.is_staff() or is_shared
);
create policy quizzes_write on public.quizzes for all using (
  public.is_owner() or created_by = auth.uid()
) with check (public.is_staff());

create policy quiz_questions_read on public.quiz_questions for select using (
  public.is_staff() or exists (
    select 1 from public.quizzes q
    where q.id = quiz_id and q.is_shared
  )
);
create policy quiz_questions_write on public.quiz_questions for all using (
  public.is_staff()
) with check (public.is_staff());

-- ───────────────────────────── enrollments ────────────────────────────
create policy enrollments_select on public.enrollments for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy enrollments_write on public.enrollments for all using (
  public.teaches(student_id)
) with check (public.teaches(student_id));

-- ───────────────────────────── lesson_access ──────────────────────────
create policy lesson_access_select on public.lesson_access for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy lesson_access_write on public.lesson_access for all using (
  public.teaches(student_id)
) with check (public.teaches(student_id));

-- ───────────────────────────── classes / roster / attendance ──────────
create policy classes_select on public.classes for select using (
  public.is_owner()
  or teacher_id = auth.uid()
  or exists (
    select 1 from public.class_students cs
    where cs.class_id = id and cs.student_id = auth.uid()
  )
);
create policy classes_write on public.classes for all using (
  public.is_owner() or teacher_id = auth.uid()
) with check (public.is_owner() or teacher_id = auth.uid());

create policy class_students_select on public.class_students for select using (
  student_id = auth.uid()
  or public.is_owner()
  or exists (
    select 1 from public.classes c
    where c.id = class_id and c.teacher_id = auth.uid()
  )
);
create policy class_students_write on public.class_students for all using (
  public.is_owner()
  or exists (
    select 1 from public.classes c
    where c.id = class_id and c.teacher_id = auth.uid()
  )
) with check (
  public.is_owner()
  or exists (
    select 1 from public.classes c
    where c.id = class_id and c.teacher_id = auth.uid()
  )
);

create policy attendance_select on public.attendance for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy attendance_write on public.attendance for all using (
  public.teaches(student_id)
) with check (public.teaches(student_id));

-- ───────────────────────────── assignments / submissions ──────────────
create policy assignments_select on public.assignments for select using (
  public.is_owner()
  or teacher_id = auth.uid()
  or exists (
    select 1 from public.submissions s
    where s.assignment_id = id and s.student_id = auth.uid()
  )
);
create policy assignments_write on public.assignments for all using (
  public.is_owner() or teacher_id = auth.uid()
) with check (public.is_owner() or teacher_id = auth.uid());

create policy submissions_select on public.submissions for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy submissions_insert on public.submissions for insert with check (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy submissions_update on public.submissions for update using (
  student_id = auth.uid() or public.teaches(student_id)
) with check (
  student_id = auth.uid() or public.teaches(student_id)
);

-- ───────────────────────────── exams / results / grades ───────────────
create policy exams_select on public.exams for select using (
  public.is_owner()
  or teacher_id = auth.uid()
  or exists (
    select 1 from public.exam_results r
    where r.exam_id = id and r.student_id = auth.uid()
  )
);
create policy exams_write on public.exams for all using (
  public.is_owner() or teacher_id = auth.uid()
) with check (public.is_owner() or teacher_id = auth.uid());

create policy exam_results_select on public.exam_results for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy exam_results_write on public.exam_results for all using (
  student_id = auth.uid() or public.teaches(student_id)
) with check (student_id = auth.uid() or public.teaches(student_id));

create policy grade_entries_select on public.grade_entries for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy grade_entries_write on public.grade_entries for all using (
  public.teaches(student_id)
) with check (public.teaches(student_id));

-- ───────────────────────────── level promotions ──────────────────────
create policy promotions_select on public.level_promotions for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy promotions_write on public.level_promotions for all using (
  public.teaches(student_id)
) with check (public.teaches(student_id));

-- ───────────────────────────── pricing ────────────────────────────────
create policy pricing_read on public.pricing for select using (auth.uid() is not null);
create policy pricing_write on public.pricing for all using (public.is_owner()) with check (public.is_owner());

-- ───────────────────────────── payments ───────────────────────────────
create policy payments_select on public.payments for select using (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy payments_insert on public.payments for insert with check (
  student_id = auth.uid() or public.teaches(student_id)
);
create policy payments_update on public.payments for update using (
  student_id = auth.uid() or public.teaches(student_id)
) with check (
  student_id = auth.uid() or public.teaches(student_id)
);

-- ───────────────────────────── notifications ──────────────────────────
create policy notifications_select on public.notifications for select using (
  user_id = auth.uid()
);
create policy notifications_update on public.notifications for update using (
  user_id = auth.uid()
) with check (user_id = auth.uid());
create policy notifications_insert on public.notifications for insert with check (
  public.is_staff() or user_id = auth.uid()
);
