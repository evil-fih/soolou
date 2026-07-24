alter table public.profiles
add column if not exists is_admin boolean not null default false;

create table if not exists public.products (
  id integer primary key,
  slug text not null unique,
  name text not null,
  category text not null check (category in ('clothes', 'hair', 'accessories', 'limited')),
  price numeric(10, 2) not null default 0,
  badge text not null default 'Fresh',
  description text not null default '',
  detail text not null default 'Hand-drawn Soolou piece made for mix-and-match plush styling.',
  tags text[] not null default array[]::text[],
  palette text not null default '#7dc7ed',
  extra_categories text[] not null default array[]::text[],
  image text,
  look jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.products_id_seq;
select setval(
  'public.products_id_seq',
  greatest(coalesce((select max(id) from public.products), 0), 9001),
  true
);
alter table public.products alter column id set default nextval('public.products_id_seq');
alter sequence public.products_id_seq owned by public.products.id;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.keep_profile_admin_flag_safe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_admin is distinct from new.is_admin and not public.is_admin() then
    new.is_admin = old.is_admin;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_keep_admin_safe on public.profiles;
create trigger profiles_keep_admin_safe
before update on public.profiles
for each row execute function public.keep_profile_admin_flag_safe();

alter table public.products enable row level security;

drop policy if exists "Users manage their profile" on public.profiles;
drop policy if exists "Users read their profile" on public.profiles;
drop policy if exists "Users create their profile" on public.profiles;
drop policy if exists "Users update their profile" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;

create policy "Users read their profile"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "Users create their profile"
on public.profiles
for insert
with check (auth.uid() = id and is_admin = false);

create policy "Users update their profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins manage profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can read active products" on public.products;
drop policy if exists "Admins manage products" on public.products;

create policy "Anyone can read active products"
on public.products
for select
using (active = true or public.is_admin());

create policy "Admins manage products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant usage, select on sequence public.products_id_seq to authenticated;
