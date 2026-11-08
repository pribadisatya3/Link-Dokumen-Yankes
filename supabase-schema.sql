-- 1. Buat tabel profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  bg_theme text default 'yankes-pattern',
  social_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Buat tabel links
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  thumbnail_url text,
  icon text default 'globe',
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tambah kolom thumbnail_url jika tabel sudah ada sebelumnya
alter table public.links add column if not exists thumbnail_url text;
alter table public.profiles add column if not exists bg_theme text default 'yankes-pattern';

-- 3. Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.links enable row level security;

-- 4. Kebijakan Profil
drop policy if exists "Profil dapat dilihat publik" on public.profiles;
create policy "Profil dapat dilihat publik"
  on public.profiles for select
  using (true);

drop policy if exists "Pengguna bisa mengedit profil sendiri" on public.profiles;
create policy "Pengguna bisa mengedit profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Pengguna bisa membuat profil sendiri" on public.profiles;
create policy "Pengguna bisa membuat profil sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. Kebijakan Links
drop policy if exists "Tautan publik dapat dibaca siapa saja" on public.links;
create policy "Tautan publik dapat dibaca siapa saja"
  on public.links for select
  using (true);

drop policy if exists "Pengguna bisa mengelola tautannya sendiri" on public.links;
create policy "Pengguna bisa mengelola tautannya sendiri"
  on public.links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Trigger Otomatis saat pendaftaran user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'Menyimpan Semua Dokumen Bidang Yankes'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
