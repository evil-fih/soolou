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
    left join public.products on products.id = requested.product_id and products.active = true
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
  join public.products on products.id = requested.product_id and products.active = true;

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
    total
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
    order_subtotal + order_gift_wrap_fee
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
  join public.products on products.id = requested.product_id and products.active = true;

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

alter table public.contact_messages
  drop constraint if exists contact_messages_content_length;

alter table public.contact_messages
  add constraint contact_messages_content_length check (
    char_length(trim(name)) between 2 and 120
    and char_length(trim(email)) between 3 and 254
    and char_length(trim(message)) between 10 and 4000
  ) not valid;

notify pgrst, 'reload schema';
