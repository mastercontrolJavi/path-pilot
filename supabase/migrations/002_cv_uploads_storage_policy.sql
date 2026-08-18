-- Restrict cv-uploads storage access to each file's owner.
--
-- Files are uploaded to paths of the form "{user_id}/{filename}.pdf"
-- (see src/app/(app)/new/page.tsx). These policies use the first path
-- segment as the owner check, the standard Supabase Storage pattern,
-- so authenticated users can only read/write/delete their own files.

insert into storage.buckets (id, name, public)
values ('cv-uploads', 'cv-uploads', false)
on conflict (id) do nothing;

create policy "Users can upload own CVs"
  on storage.objects for insert
  with check (
    bucket_id = 'cv-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own CVs"
  on storage.objects for select
  using (
    bucket_id = 'cv-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own CVs"
  on storage.objects for delete
  using (
    bucket_id = 'cv-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
