alter table public.profiles
add column if not exists is_admin boolean not null default false;

alter table public.profiles
add column if not exists admin_role text not null default 'customer';

alter table public.profiles
drop constraint if exists profiles_admin_role_check;

alter table public.profiles
add constraint profiles_admin_role_check
check (admin_role in ('customer', 'helper', 'sub_admin', 'admin'));

update public.profiles
set admin_role = 'admin'
where is_admin = true
  and admin_role <> 'admin';

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
      and (admin_role = 'admin' or is_admin = true)
  );
$$;

create or replace function public.is_product_manager()
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
      and (admin_role in ('admin', 'sub_admin') or is_admin = true)
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

  if old.admin_role is distinct from new.admin_role and not public.is_admin() then
    new.admin_role = old.admin_role;
  end if;

  if new.admin_role = 'admin' then
    new.is_admin = true;
  else
    new.is_admin = false;
  end if;

  return new;
end;
$$;

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
with check (auth.uid() = id and is_admin = false and admin_role = 'customer');

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
using (active = true or public.is_product_manager());

create policy "Admins manage products"
on public.products
for all
using (public.is_product_manager())
with check (public.is_product_manager());
