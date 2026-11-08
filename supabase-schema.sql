-- =======================================================
-- SKEMA LENGKAP YANKESTREE (PROFILES + LINKS + SUB-LINKS)
-- =======================================================

-- 1. Buat tabel profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  bg_theme text default 'yankes-pattern',
  social_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tambah kolom jika tabel lama sudah ada
alter table public.profiles add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists bg_theme text default 'yankes-pattern';

-- 2. Buat tabel links (dengan thumbnail_url dan parent_id untuk sub-dokumen)
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.links(id) on delete cascade,
  title text not null,
  url text not null,
  thumbnail_url text,
  icon text default 'globe',
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pastikan kolom thumbnail_url dan parent_id ada
alter table public.links add column if not exists thumbnail_url text;
alter table public.links add column if not exists parent_id uuid references public.links(id) on delete cascade;

-- 3. Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.links enable row level security;

-- 4. Kebijakan Profil (Publik bisa baca, Pemilik akun bisa kelola semua profil miliknya)
drop policy if exists "Profil dapat dilihat publik" on public.profiles;
create policy "Profil dapat dilihat publik"
  on public.profiles for select
  using (true);

drop policy if exists "Pengguna bisa mengedit profil sendiri" on public.profiles;
create policy "Pengguna bisa mengedit profil sendiri"
  on public.profiles for all
  using (auth.uid() = id or auth.uid() = owner_id)
  with check (auth.uid() = id or auth.uid() = owner_id);

-- 5. Kebijakan Links
drop policy if exists "Tautan publik dapat dibaca siapa saja" on public.links;
create policy "Tautan publik dapat dibaca siapa saja"
  on public.links for select
  using (true);

drop policy if exists "Pengguna bisa mengelola tautannya sendiri" on public.links;
create policy "Pengguna bisa mengelola tautannya sendiri"
  on public.links for all
  using (
    user_id in (select id from public.profiles where id = auth.uid() or owner_id = auth.uid())
  )
  with check (
    user_id in (select id from public.profiles where id = auth.uid() or owner_id = auth.uid())
  );

-- 6. Trigger Otomatis saat registrasi user baru
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, owner_id, username, display_name, bio)
  values (
    new.id,
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

-- Sinkronkan user yang sudah ada sebelumnya ke profiles jika belum tercatat
insert into public.profiles (id, owner_id, username, display_name, bio)
select 
  id,
  id,
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  'Menyimpan Semua Dokumen Bidang Yankes'
from auth.users
on conflict (id) do update set owner_id = excluded.owner_id;

-- Refresh cache schema API Supabase
notify pgrst, 'reload schema';
