-- 1. Buat tabel profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  theme text default 'slate',
  button_style text default 'rounded-xl',
  social_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Buat tabel links
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  icon text default 'globe',
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.links enable row level security;

-- 4. Kebijakan Profil
create policy "Profil dapat dilihat publik"
  on public.profiles for select
  using (true);

create policy "Pengguna bisa mengedit profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Pengguna bisa membuat profil sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. Kebijakan Links
create policy "Tautan publik dapat dibaca siapa saja"
  on public.links for select
  using (true);

create policy "Pengguna bisa mengelola tautannya sendiri"
  on public.links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Trigger Otomatis saat registrasi user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'Selamat datang di bio link saya!'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
