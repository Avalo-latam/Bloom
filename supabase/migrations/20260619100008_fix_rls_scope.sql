-- Fix unqualified `id` in policy subqueries resolving to the inner table's id
-- (submissions.id / exam_results.id) instead of the outer table's id, which
-- prevented students from reading their own assignments/exams.

drop policy if exists assignments_select on public.assignments;
create policy assignments_select on public.assignments for select using (
  public.is_owner()
  or teacher_id = auth.uid()
  or exists (
    select 1 from public.submissions s
    where s.assignment_id = assignments.id and s.student_id = auth.uid()
  )
);

drop policy if exists exams_select on public.exams;
create policy exams_select on public.exams for select using (
  public.is_owner()
  or teacher_id = auth.uid()
  or exists (
    select 1 from public.exam_results r
    where r.exam_id = exams.id and r.student_id = auth.uid()
  )
);
