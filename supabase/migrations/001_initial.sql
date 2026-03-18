-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Analyses table
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_text text not null,
  cv_file_path text,
  questionnaire jsonb not null,
  result jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz default now()
);

-- Feedback table
create table public.analysis_feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpful boolean not null,
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_analyses_user_id on public.analyses(user_id);
create index idx_analyses_created_at on public.analyses(created_at desc);
create index idx_feedback_analysis_id on public.analysis_feedback(analysis_id);

-- RLS Policies
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

alter table public.analyses enable row level security;
create policy "Users can view own analyses" on public.analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.analyses for insert with check (auth.uid() = user_id);
create policy "Users can update own analyses" on public.analyses for update using (auth.uid() = user_id);

alter table public.analysis_feedback enable row level security;
create policy "Users can view own feedback" on public.analysis_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own feedback" on public.analysis_feedback for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
