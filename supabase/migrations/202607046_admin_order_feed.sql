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
  if not public.is_product_manager() then
    raise exception 'Admin or sub-admin access is required.';
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

revoke all on function public.update_order_status(uuid, text) from public;
revoke all on function public.update_order_status(uuid, text) from anon;
grant execute on function public.update_order_status(uuid, text) to authenticated;

notify pgrst, 'reload schema';
