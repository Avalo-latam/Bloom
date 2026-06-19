-- Bloom English — core schema
-- Roles, curriculum, classes, academics, payments.

-- ───────────────────────────── Extensions ─────────────────────────────
create extension if not exists "pgcrypto";

-- ───────────────────────────── Enums ──────────────────────────────────
create type user_role as enum ('owner', 'teacher', 'student');
create type level_code as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'FCE', 'PHONETICS');
create type enrollment_status as enum ('active', 'paused', 'completed');
create type block_kind as enum (
  'warmup', 'review', 'presentation', 'practice',
  'speaking', 'listening', 'game', 'wrapup'
);
create type quiz_kind as enum (
  'multiple_choice', 'fill_blank', 'lyrics_complete',
  'matching', 'ordering', 'listening'
);
create type class_kind as enum ('individual', 'group');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type submission_status as enum ('assigned', 'submitted', 'graded', 'returned');
create type exam_kind as enum ('uploaded', 'quiz');
create type payment_status as enum ('pendiente', 'verificado', 'rechazado');
create type payment_kind as enum ('individual', 'group');
create type promotion_status as enum ('in_progress', 'ready', 'approved', 'rejected');
create type notification_kind as enum (
  'homework', 'grade', 'payment', 'schedule', 'promotion', 'message', 'system'
);

-- ───────────────────────────── Helpers ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────── Profiles ───────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        user_role not null default 'student',
  full_name   text,
  email       text,
  avatar_url  text,
  locale      text not null default 'es',
  phone       text,
  -- the student's main teacher (null for staff)
  teacher_id  uuid references public.profiles (id) on delete set null,
  -- private teacher notes about the student
  notes       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_teacher_idx on public.profiles (teacher_id);
create index profiles_role_idx on public.profiles (role);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role lookup helper (security definer avoids recursive policy checks).
create or replace function public.app_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'teacher')
  );
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- Is the current teacher responsible for this student?
create or replace function public.teaches(student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_owner() or exists (
    select 1 from public.profiles s
    where s.id = student and s.teacher_id = auth.uid()
  );
$$;

-- ───────────────────────────── Curriculum ─────────────────────────────
create table public.levels (
  id           uuid primary key default gen_random_uuid(),
  code         level_code unique not null,
  title        text not null,
  subtitle     text,
  description  text,
  cefr_can_do  text[] not null default '{}',
  accent       text,
  is_track     boolean not null default false,
  sort_order   int not null default 0
);

create table public.units (
  id          uuid primary key default gen_random_uuid(),
  level_id    uuid not null references public.levels (id) on delete cascade,
  title       text not null,
  summary     text,
  sort_order  int not null default 0
);
create index units_level_idx on public.units (level_id);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  unit_id       uuid not null references public.units (id) on delete cascade,
  level_id      uuid not null references public.levels (id) on delete cascade,
  title         text not null,
  objective     text,
  summary       text,
  duration_min  int not null default 60,
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  -- null = base curriculum; set = teacher-authored custom lesson
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index lessons_unit_idx on public.lessons (unit_id);
create index lessons_level_idx on public.lessons (level_id);

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create table public.lesson_blocks (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references public.lessons (id) on delete cascade,
  kind          block_kind not null,
  title         text not null,
  duration_min  int not null default 5,
  sort_order    int not null default 0,
  -- flexible content payload: { type, html, videoUrl, kahootUrl, quizId, items… }
  content       jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index lesson_blocks_lesson_idx on public.lesson_blocks (lesson_id);

create trigger lesson_blocks_updated_at
  before update on public.lesson_blocks
  for each row execute function public.set_updated_at();

-- ───────────────────────────── Quizzes ────────────────────────────────
create table public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  level_id    uuid references public.levels (id) on delete set null,
  created_by  uuid references public.profiles (id) on delete set null,
  is_shared   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes (id) on delete cascade,
  kind         quiz_kind not null,
  prompt       text not null,
  media_url    text,
  -- type-specific payload: options/answer/blanks/pairs/ordered items…
  data         jsonb not null default '{}',
  explanation  text,
  points       int not null default 1,
  sort_order   int not null default 0
);
create index quiz_questions_quiz_idx on public.quiz_questions (quiz_id);

-- ───────────────────────────── Enrollment & gating ────────────────────
create table public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  teacher_id    uuid references public.profiles (id) on delete set null,
  level_id      uuid not null references public.levels (id) on delete cascade,
  status        enrollment_status not null default 'active',
  started_at    date not null default current_date,
  completed_at  date,
  unique (student_id, level_id)
);
create index enrollments_student_idx on public.enrollments (student_id);
create index enrollments_teacher_idx on public.enrollments (teacher_id);

create table public.lesson_access (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  released_by  uuid references public.profiles (id) on delete set null,
  released_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, lesson_id)
);
create index lesson_access_student_idx on public.lesson_access (student_id);
create index lesson_access_lesson_idx on public.lesson_access (lesson_id);

-- ───────────────────────────── Scheduling ─────────────────────────────
create table public.classes (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles (id) on delete cascade,
  title        text not null,
  kind         class_kind not null default 'individual',
  lesson_id    uuid references public.lessons (id) on delete set null,
  meeting_url  text,
  starts_at    timestamptz not null,
  duration_min int not null default 60,
  -- 'none' | 'weekly'
  recurrence   text not null default 'weekly',
  notes        text,
  created_at   timestamptz not null default now()
);
create index classes_teacher_idx on public.classes (teacher_id);
create index classes_starts_idx on public.classes (starts_at);

create table public.class_students (
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  primary key (class_id, student_id)
);

create table public.attendance (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  status        attendance_status not null default 'present',
  session_date  date not null,
  note          text,
  unique (class_id, student_id, session_date)
);

-- ───────────────────────────── Homework / exams / grades ──────────────
create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.profiles (id) on delete cascade,
  lesson_id     uuid references public.lessons (id) on delete set null,
  quiz_id       uuid references public.quizzes (id) on delete set null,
  title         text not null,
  instructions  text,
  due_at        timestamptz,
  created_at    timestamptz not null default now()
);
create index assignments_teacher_idx on public.assignments (teacher_id);

create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  status       submission_status not null default 'assigned',
  text_answer  text,
  file_url     text,
  quiz_score   numeric,
  submitted_at timestamptz,
  grade        numeric,
  feedback     text,
  graded_by    uuid references public.profiles (id) on delete set null,
  graded_at    timestamptz,
  unique (assignment_id, student_id)
);
create index submissions_student_idx on public.submissions (student_id);

create table public.exams (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  level_id    uuid references public.levels (id) on delete set null,
  title       text not null,
  description text,
  kind        exam_kind not null default 'uploaded',
  quiz_id     uuid references public.quizzes (id) on delete set null,
  file_url    text,
  created_at  timestamptz not null default now()
);

create table public.exam_results (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid not null references public.exams (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  score       numeric,
  max_score   numeric not null default 100,
  feedback    text,
  file_url    text,
  taken_at    timestamptz,
  graded_by   uuid references public.profiles (id) on delete set null,
  graded_at   timestamptz,
  unique (exam_id, student_id)
);
create index exam_results_student_idx on public.exam_results (student_id);

-- General gradebook entries (participation, speaking, writing…)
create table public.grade_entries (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  level_id    uuid references public.levels (id) on delete set null,
  title       text not null,
  category    text not null default 'general',
  score       numeric,
  max_score   numeric not null default 100,
  feedback    text,
  created_at  timestamptz not null default now()
);
create index grade_entries_student_idx on public.grade_entries (student_id);

-- ───────────────────────────── Level promotion ────────────────────────
create table public.level_promotions (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  from_level_id uuid references public.levels (id) on delete set null,
  to_level_id   uuid references public.levels (id) on delete set null,
  status        promotion_status not null default 'in_progress',
  checklist     jsonb not null default '[]',
  teacher_id    uuid references public.profiles (id) on delete set null,
  decided_at    timestamptz,
  note          text,
  created_at    timestamptz not null default now()
);
create index level_promotions_student_idx on public.level_promotions (student_id);

-- ───────────────────────────── Payments ───────────────────────────────
create table public.pricing (
  id               uuid primary key default gen_random_uuid(),
  individual_price numeric not null default 20000,
  group_price      numeric not null default 15000,
  currency         text not null default 'ARS',
  alias            text not null default 'bloom.mp',
  group_min        int not null default 3,
  updated_at       timestamptz not null default now()
);

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  teacher_id   uuid references public.profiles (id) on delete set null,
  kind         payment_kind not null default 'individual',
  amount       numeric not null,
  currency     text not null default 'ARS',
  period       text,                 -- e.g. '2026-06'
  concept      text,
  status       payment_status not null default 'pendiente',
  receipt_url  text,
  submitted_at timestamptz,
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz,
  note         text,
  created_at   timestamptz not null default now()
);
create index payments_student_idx on public.payments (student_id);
create index payments_status_idx on public.payments (status);

-- ───────────────────────────── Notifications ──────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       notification_kind not null default 'system',
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at);

-- Single pricing config row.
insert into public.pricing (individual_price, group_price, alias, group_min)
values (20000, 15000, 'bloom.mp', 3);
