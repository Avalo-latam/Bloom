-- Bloom English — resource library + student↔teacher messages.

create type resource_kind as enum ('file', 'link');

create table public.resources (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid references public.profiles (id) on delete set null,
  title       text not null,
  description text,
  level_id    uuid references public.levels (id) on delete set null,
  kind        resource_kind not null default 'file',
  file_url    text,            -- storage path in the 'materials' bucket
  url         text,            -- external link
  created_at  timestamptz not null default now()
);
create index resources_level_idx on public.resources (level_id);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  teacher_id  uuid references public.profiles (id) on delete set null,
  sender_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index messages_student_idx on public.messages (student_id, created_at);

alter table public.resources enable row level security;
alter table public.messages  enable row level security;

-- Resources: any signed-in user can read; staff manage.
create policy resources_read on public.resources for select
  using (auth.uid() is not null);
create policy resources_write on public.resources for all
  using (public.is_staff()) with check (public.is_staff());

-- Messages: a student sees their own thread; the assigned teacher sees theirs.
create policy messages_select on public.messages for select
  using (student_id = auth.uid() or public.teaches(student_id));
create policy messages_insert on public.messages for insert
  with check (
    sender_id = auth.uid()
    and (student_id = auth.uid() or public.teaches(student_id))
  );
create policy messages_update on public.messages for update
  using (student_id = auth.uid() or public.teaches(student_id))
  with check (student_id = auth.uid() or public.teaches(student_id));
