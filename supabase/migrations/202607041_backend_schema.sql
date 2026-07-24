create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id integer not null,
  product_slug text not null,
  product_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id integer not null,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  product_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postal_code text not null,
  delivery_notes text,
  gift_wrap boolean not null default false,
  gift_wrap_fee numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status text not null default 'studio_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  product_id integer not null,
  product_slug text not null,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  product_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.saved_doll_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled plush design',
  design_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists shipping_addresses_set_updated_at on public.shipping_addresses;
create trigger shipping_addresses_set_updated_at
before update on public.shipping_addresses
for each row execute function public.set_updated_at();

drop trigger if exists saved_doll_designs_set_updated_at on public.saved_doll_designs;
create trigger saved_doll_designs_set_updated_at
before update on public.saved_doll_designs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.saved_doll_designs enable row level security;

drop policy if exists "Users manage their profile" on public.profiles;
create policy "Users manage their profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users manage their favorites" on public.favorites;
create policy "Users manage their favorites"
on public.favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their cart" on public.cart_items;
create policy "Users manage their cart"
on public.cart_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read their orders" on public.orders;
create policy "Users read their orders"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists "Anyone can create an order" on public.orders;
create policy "Anyone can create an order"
on public.orders
for insert
with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users read their order items" on public.order_items;
create policy "Users read their order items"
on public.order_items
for select
using (auth.uid() = user_id);

drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
on public.order_items
for insert
with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Anyone can send contact messages" on public.contact_messages;
create policy "Anyone can send contact messages"
on public.contact_messages
for insert
with check (true);

drop policy if exists "Users manage shipping addresses" on public.shipping_addresses;
create policy "Users manage shipping addresses"
on public.shipping_addresses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage saved doll designs" on public.saved_doll_designs;
create policy "Users manage saved doll designs"
on public.saved_doll_designs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
