-- Bloom English — demo data (teachers + students + enrollments).
-- Idempotent. Demo accounts use password "Bloom2026!".
-- Apply manually; NOT part of the migration chain.

update public.profiles
  set teacher_id = (select id from public.profiles where email = 'ms.pau@bloomenglish.app')
  where email in (
    'sofia.demo@bloomenglish.app',
    'mateo.demo@bloomenglish.app',
    'cami.demo@bloomenglish.app'
  );

update public.profiles
  set teacher_id = (select id from public.profiles where email = 'ms.jime@bloomenglish.app')
  where email in (
    'valen.demo@bloomenglish.app',
    'benja.demo@bloomenglish.app'
  );

insert into public.enrollments (student_id, teacher_id, level_id, status)
select p.id, p.teacher_id, l.id, 'active'
from public.profiles p
join (values
  ('sofia.demo@bloomenglish.app', 'A2'),
  ('mateo.demo@bloomenglish.app', 'B1'),
  ('valen.demo@bloomenglish.app', 'A1'),
  ('benja.demo@bloomenglish.app', 'B2'),
  ('cami.demo@bloomenglish.app',  'FCE')
) as m(email, code) on m.email = p.email
join public.levels l on l.code::text = m.code
on conflict (student_id, level_id) do nothing;
