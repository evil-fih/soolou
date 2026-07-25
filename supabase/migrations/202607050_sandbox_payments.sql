alter table public.orders
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz;

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check check (
    payment_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')
  ) not valid;

create table if not exists public.payment_configuration (
  singleton boolean primary key default true check (singleton),
  mode text not null default 'sandbox' check (mode in ('disabled', 'sandbox', 'live')),
  updated_at timestamptz not null default now()
);

insert into public.payment_configuration (singleton, mode)
values (true, 'sandbox')
on conflict (singleton) do nothing;

alter table public.payment_configuration enable row level security;
revoke all on public.payment_configuration from anon, authenticated;

create or replace function public.place_checkout_order(
  p_full_name text,
  p_email text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_notes text,
  p_gift_wrap boolean,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid := auth.uid();
  new_order_id uuid;
  order_subtotal numeric(10, 2);
  order_gift_wrap_fee numeric(10, 2) := case when coalesce(p_gift_wrap, false) then 6 else 0 end;
begin
  if customer_id is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if char_length(trim(p_full_name)) not between 2 and 120
    or char_length(trim(p_email)) not between 3 and 254
    or char_length(trim(p_address)) not between 5 and 300
    or char_length(trim(p_city)) not between 2 and 120
    or char_length(trim(p_postal_code)) not between 2 and 32 then
    raise exception 'Please complete all checkout details.';
  end if;

  if jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
    or jsonb_array_length(p_items) > 100 then
    raise exception 'Your cart does not contain a valid number of items.';
  end if;

  if exists (
    with requested as (
      select (item ->> 'product_id')::integer as product_id
      from jsonb_array_elements(p_items) as item
    )
    select 1
    from requested
    left join public.products
      on products.id = requested.product_id
      and products.active = true
    where products.id is null
  ) then
    raise exception 'One or more cart products are no longer available.';
  end if;

  with requested as (
    select
      (item ->> 'product_id')::integer as product_id,
      sum(greatest(1, least(99, (item ->> 'quantity')::integer)))::integer as quantity
    from jsonb_array_elements(p_items) as item
    group by (item ->> 'product_id')::integer
  )
  select coalesce(sum(products.price * requested.quantity), 0)
  into order_subtotal
  from requested
  join public.products
    on products.id = requested.product_id
    and products.active = true;

  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    shipping_address,
    shipping_city,
    shipping_postal_code,
    delivery_notes,
    gift_wrap,
    gift_wrap_fee,
    subtotal,
    total,
    payment_status
  )
  values (
    customer_id,
    trim(p_full_name),
    trim(p_email),
    trim(p_address),
    trim(p_city),
    trim(p_postal_code),
    nullif(trim(p_delivery_notes), ''),
    coalesce(p_gift_wrap, false),
    order_gift_wrap_fee,
    order_subtotal,
    order_subtotal + order_gift_wrap_fee,
    'pending'
  )
  returning id into new_order_id;

  with requested as (
    select
      (item ->> 'product_id')::integer as product_id,
      sum(greatest(1, least(99, (item ->> 'quantity')::integer)))::integer as quantity
    from jsonb_array_elements(p_items) as item
    group by (item ->> 'product_id')::integer
  )
  insert into public.order_items (
    order_id,
    user_id,
    product_id,
    product_slug,
    product_name,
    unit_price,
    quantity,
    product_snapshot
  )
  select
    new_order_id,
    customer_id,
    products.id,
    products.slug,
    products.name,
    products.price,
    requested.quantity,
    jsonb_build_object(
      'id', products.id,
      'slug', products.slug,
      'name', products.name,
      'category', products.category,
      'price', products.price,
      'badge', products.badge,
      'description', products.description,
      'detail', products.detail,
      'tags', products.tags,
      'palette', products.palette,
      'extraCategories', products.extra_categories,
      'image', products.image,
      'look', products.look
    )
  from requested
  join public.products
    on products.id = requested.product_id
    and products.active = true;

  insert into public.shipping_addresses (
    user_id,
    full_name,
    email,
    address,
    city,
    postal_code,
    is_default
  )
  values (
    customer_id,
    trim(p_full_name),
    trim(p_email),
    trim(p_address),
    trim(p_city),
    trim(p_postal_code),
    true
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    address = excluded.address,
    city = excluded.city,
    postal_code = excluded.postal_code,
    is_default = true;

  return new_order_id;
end;
$$;

drop policy if exists "Anyone can create an order" on public.orders;
drop policy if exists "Signed in users create their orders" on public.orders;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Signed in users create their order items" on public.order_items;

revoke insert on public.orders from anon, authenticated;
revoke insert on public.order_items from anon, authenticated;
revoke all on function public.place_checkout_order(text, text, text, text, text, text, boolean, jsonb) from public;
revoke all on function public.place_checkout_order(text, text, text, text, text, text, boolean, jsonb) from anon;
grant execute on function public.place_checkout_order(text, text, text, text, text, text, boolean, jsonb) to authenticated;

create or replace function public.complete_sandbox_payment(p_order_id uuid)
returns table (
  id uuid,
  payment_status text,
  payment_provider text,
  payment_reference text,
  paid_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid := auth.uid();
  payment_mode text;
begin
  if customer_id is null then
    raise exception 'You must be signed in to complete payment.';
  end if;

  select configuration.mode
  into payment_mode
  from public.payment_configuration as configuration
  where configuration.singleton = true;

  if payment_mode is distinct from 'sandbox' then
    raise exception 'Sandbox payments are disabled.';
  end if;

  if not exists (
    select 1
    from public.orders as customer_order
    where customer_order.id = p_order_id
      and customer_order.user_id = customer_id
  ) then
    raise exception 'Order not found.';
  end if;

  if exists (
    select 1
    from public.orders as customer_order
    where customer_order.id = p_order_id
      and customer_order.user_id = customer_id
      and customer_order.payment_status = 'paid'
  ) then
    return query
    select
      customer_order.id,
      customer_order.payment_status,
      customer_order.payment_provider,
      customer_order.payment_reference,
      customer_order.paid_at,
      customer_order.status
    from public.orders as customer_order
    where customer_order.id = p_order_id;
    return;
  end if;

  return query
  update public.orders as customer_order
  set
    payment_status = 'paid',
    payment_provider = 'sandbox',
    payment_reference = 'sandbox_' || replace(gen_random_uuid()::text, '-', ''),
    paid_at = now(),
    status = case
      when customer_order.status = 'studio_review' then 'confirmed'
      else customer_order.status
    end
  where customer_order.id = p_order_id
    and customer_order.user_id = customer_id
    and customer_order.payment_status = 'pending'
  returning
    customer_order.id,
    customer_order.payment_status,
    customer_order.payment_provider,
    customer_order.payment_reference,
    customer_order.paid_at,
    customer_order.status;

  if not found then
    raise exception 'This order can no longer be paid.';
  end if;
end;
$$;

create or replace function public.cancel_sandbox_payment(p_order_id uuid)
returns table (
  id uuid,
  payment_status text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid := auth.uid();
  payment_mode text;
begin
  if customer_id is null then
    raise exception 'You must be signed in to cancel payment.';
  end if;

  select configuration.mode
  into payment_mode
  from public.payment_configuration as configuration
  where configuration.singleton = true;

  if payment_mode is distinct from 'sandbox' then
    raise exception 'Sandbox payments are disabled.';
  end if;

  return query
  update public.orders as customer_order
  set
    payment_status = 'cancelled',
    payment_provider = 'sandbox',
    status = 'cancelled'
  where customer_order.id = p_order_id
    and customer_order.user_id = customer_id
    and customer_order.payment_status = 'pending'
  returning
    customer_order.id,
    customer_order.payment_status,
    customer_order.status;

  if not found then
    raise exception 'This order can no longer be cancelled.';
  end if;
end;
$$;

revoke all on function public.complete_sandbox_payment(uuid) from public;
revoke all on function public.complete_sandbox_payment(uuid) from anon;
grant execute on function public.complete_sandbox_payment(uuid) to authenticated;

revoke all on function public.cancel_sandbox_payment(uuid) from public;
revoke all on function public.cancel_sandbox_payment(uuid) from anon;
grant execute on function public.cancel_sandbox_payment(uuid) to authenticated;

create or replace function public.get_admin_orders()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  order_feed jsonb;
begin
  if not public.is_product_manager() then
    raise exception 'Admin or sub-admin access is required.';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', order_record.id,
        'user_id', order_record.user_id,
        'customer_name', order_record.customer_name,
        'customer_email', order_record.customer_email,
        'shipping_address', order_record.shipping_address,
        'shipping_city', order_record.shipping_city,
        'shipping_postal_code', order_record.shipping_postal_code,
        'delivery_notes', order_record.delivery_notes,
        'gift_wrap', order_record.gift_wrap,
        'gift_wrap_fee', order_record.gift_wrap_fee,
        'subtotal', order_record.subtotal,
        'total', order_record.total,
        'status', order_record.status,
        'payment_status', order_record.payment_status,
        'payment_provider', order_record.payment_provider,
        'payment_reference', order_record.payment_reference,
        'paid_at', order_record.paid_at,
        'created_at', order_record.created_at,
        'updated_at', order_record.updated_at,
        'order_items', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', item.id,
                'product_id', item.product_id,
                'product_slug', item.product_slug,
                'product_name', item.product_name,
                'unit_price', item.unit_price,
                'quantity', item.quantity,
                'product_snapshot', item.product_snapshot
              )
              order by item.created_at
            )
            from public.order_items as item
            where item.order_id = order_record.id
          ),
          '[]'::jsonb
        )
      )
      order by order_record.created_at desc
    ),
    '[]'::jsonb
  )
  into order_feed
  from public.orders as order_record;

  return order_feed;
end;
$$;

revoke all on function public.get_admin_orders() from public;
revoke all on function public.get_admin_orders() from anon;
grant execute on function public.get_admin_orders() to authenticated;

notify pgrst, 'reload schema';
