-- Bloom English — Storage buckets & policies
-- Private buckets use a "<user_id>/<file>" path convention so a student can
-- only write inside their own folder.

insert into storage.buckets (id, name, public) values
  ('avatars',     'avatars',     true),
  ('materials',   'materials',   false),
  ('receipts',    'receipts',    false),
  ('submissions', 'submissions', false),
  ('recordings',  'recordings',  false)
on conflict (id) do nothing;

-- ───────────────────────────── avatars (public read) ──────────────────
create policy avatars_read on storage.objects for select
  using (bucket_id = 'avatars');
create policy avatars_write on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy avatars_update on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────── materials (staff write, all read) ──────
create policy materials_read on storage.objects for select
  using (bucket_id = 'materials' and auth.uid() is not null);
create policy materials_write on storage.objects for all
  using (bucket_id = 'materials' and public.is_staff())
  with check (bucket_id = 'materials' and public.is_staff());

-- ───────────────────────────── receipts (own folder / staff) ──────────
create policy receipts_read on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );
create policy receipts_write on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────── submissions (own folder / staff) ───────
create policy submissions_read on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );
create policy submissions_write on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────── recordings (phonetics, own folder) ─────
create policy recordings_read on storage.objects for select
  using (
    bucket_id = 'recordings'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );
create policy recordings_write on storage.objects for insert
  with check (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
