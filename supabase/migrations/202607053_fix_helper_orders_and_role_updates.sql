drop trigger if exists profiles_keep_admin_safe on public.profiles;

update public.profiles
set
  admin_role = 'helper',
  is_admin = false
where admin_role = 'sub_admin';

create trigger profiles_keep_admin_safe
before update on public.profiles
for each row execute function public.keep_profile_admin_flag_safe();

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
      and (
        admin_role in ('admin', 'helper', 'sub_admin')
        or is_admin = true
      )
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

create or replace function public.set_profile_admin_role(
  p_user_id uuid,
  p_admin_role text
)
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change account roles.'
      using errcode = '42501';
  end if;

  if p_admin_role not in ('customer', 'helper', 'admin') then
    raise exception 'Invalid account role.';
  end if;

  return query
  update public.profiles
  set
    admin_role = p_admin_role,
    is_admin = p_admin_role = 'admin'
  where id = p_user_id
  returning *;

  if not found then
    raise exception 'Account not found.';
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

revoke all on function public.set_profile_admin_role(uuid, text) from public;
revoke all on function public.set_profile_admin_role(uuid, text) from anon;
grant execute on function public.set_profile_admin_role(uuid, text) to authenticated;

notify pgrst, 'reload schema';
