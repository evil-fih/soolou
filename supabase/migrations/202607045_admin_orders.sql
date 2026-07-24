drop policy if exists "Store managers read orders" on public.orders;
create policy "Store managers read orders"
on public.orders
for select
using (public.is_product_manager());

drop policy if exists "Store managers update orders" on public.orders;

drop policy if exists "Store managers read order items" on public.order_items;
create policy "Store managers read order items"
on public.order_items
for select
using (public.is_product_manager());

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
grant execute on function public.update_order_status(uuid, text) to authenticated;
