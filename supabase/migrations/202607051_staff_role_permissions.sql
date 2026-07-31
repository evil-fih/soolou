-- Replace the old sub-admin tier with a simpler admin/helper/customer model.
drop trigger if exists profiles_keep_admin_safe on public.profiles;

update public.profiles
set
  admin_role = 'helper',
  is_admin = false
where admin_role = 'sub_admin';

create trigger profiles_keep_admin_safe
before update on public.profiles
for each row execute function public.keep_profile_admin_flag_safe();

alter table public.profiles
drop constraint if exists profiles_admin_role_check;

alter table public.profiles
add constraint profiles_admin_role_check
check (admin_role in ('customer', 'helper', 'admin'));

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
      and (admin_role = 'admin' or is_admin = true)
  );
$$;

create or replace function public.is_order_staff()
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
      and (admin_role in ('admin', 'helper') or is_admin = true)
  );
$$;

drop policy if exists "Store managers read orders" on public.orders;
drop policy if exists "Store staff read orders" on public.orders;
create policy "Store staff read orders"
on public.orders
for select
using (public.is_order_staff());

drop policy if exists "Store managers read order items" on public.order_items;
drop policy if exists "Store staff read order items" on public.order_items;
create policy "Store staff read order items"
on public.order_items
for select
using (public.is_order_staff());

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
  if not public.is_order_staff() then
    raise exception 'Admin or helper access is required.'
      using errcode = '42501';
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

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text
)
returns table (
  id uuid,
  status text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_order_staff() then
    raise exception 'Admin or helper access is required.'
      using errcode = '42501';
  end if;

  if p_status not in (
    'studio_review',
    'confirmed',
    'making',
    'ready_to_ship',
    'shipped',
    'delivered',
    'cancelled'
  ) then
    raise exception 'Invalid order status.';
  end if;

  return query
  update public.orders as order_record
  set status = p_status
  where order_record.id = p_order_id
  returning order_record.id, order_record.status, order_record.updated_at;

  if not found then
    raise exception 'Order not found.';
  end if;
end;
$$;

create or replace function public.save_admin_product(
  p_id integer,
  p_slug text,
  p_name text,
  p_category text,
  p_price numeric,
  p_badge text,
  p_description text,
  p_detail text,
  p_tags text[],
  p_palette text,
  p_extra_categories text[],
  p_image text,
  p_look jsonb
)
returns setof public.products
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_product_manager() then
    raise exception 'Admin access is required.'
      using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_name, ''))) = 0
    or char_length(trim(coalesce(p_slug, ''))) = 0
    or p_category not in ('clothes', 'hair', 'accessories', 'limited')
    or p_price is null
    or p_price < 0
    or char_length(trim(coalesce(p_description, ''))) = 0 then
    raise exception 'The product details are incomplete.';
  end if;

  if p_id is null then
    perform pg_advisory_xact_lock(9001);

    return query
    insert into public.products (
      id,
      slug,
      name,
      category,
      price,
      badge,
      description,
      detail,
      tags,
      palette,
      extra_categories,
      image,
      look,
      active
    )
    values (
      (select greatest(coalesce(max(products.id), 0), 9001) + 1 from public.products),
      trim(p_slug),
      trim(p_name),
      p_category,
      p_price,
      coalesce(nullif(trim(p_badge), ''), 'Fresh'),
      trim(p_description),
      coalesce(nullif(trim(p_detail), ''), 'Hand-drawn Soolou piece made for mix-and-match plush styling.'),
      coalesce(p_tags, array[]::text[]),
      coalesce(nullif(trim(p_palette), ''), '#7dc7ed'),
      coalesce(p_extra_categories, array[]::text[]),
      nullif(trim(p_image), ''),
      coalesce(p_look, '{}'::jsonb),
      true
    )
    returning *;
  else
    return query
    update public.products
    set
      slug = trim(p_slug),
      name = trim(p_name),
      category = p_category,
      price = p_price,
      badge = coalesce(nullif(trim(p_badge), ''), 'Fresh'),
      description = trim(p_description),
      detail = coalesce(nullif(trim(p_detail), ''), 'Hand-drawn Soolou piece made for mix-and-match plush styling.'),
      tags = coalesce(p_tags, array[]::text[]),
      palette = coalesce(nullif(trim(p_palette), ''), '#7dc7ed'),
      extra_categories = coalesce(p_extra_categories, array[]::text[]),
      image = nullif(trim(p_image), ''),
      look = coalesce(p_look, '{}'::jsonb),
      active = true
    where id = p_id
    returning *;

    if not found then
      raise exception 'The product could not be found.';
    end if;
  end if;
end;
$$;

create or replace function public.archive_admin_product(p_id integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_product_manager() then
    raise exception 'Admin access is required.'
      using errcode = '42501';
  end if;

  update public.products
  set active = false
  where id = p_id;

  if not found then
    raise exception 'The product could not be found.';
  end if;
end;
$$;

revoke all on function public.is_order_staff() from public;
grant execute on function public.is_order_staff() to authenticated;

revoke all on function public.get_admin_orders() from public;
revoke all on function public.get_admin_orders() from anon;
grant execute on function public.get_admin_orders() to authenticated;

revoke all on function public.update_order_status(uuid, text) from public;
revoke all on function public.update_order_status(uuid, text) from anon;
grant execute on function public.update_order_status(uuid, text) to authenticated;

notify pgrst, 'reload schema';
