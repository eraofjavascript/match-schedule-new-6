-- Create schedules table
create table public.schedules (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  game_name text not null,
  time text not null,
  date text not null,
  place text not null,
  description text,
  user_id uuid references auth.users on delete cascade not null
);

-- Enable RLS
alter table public.schedules enable row level security;

-- RLS Policies
create policy "Anyone can view schedules"
  on public.schedules for select
  to authenticated
  using (true);

create policy "Users can create schedules"
  on public.schedules for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own schedules"
  on public.schedules for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own schedules"
  on public.schedules for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.schedules;