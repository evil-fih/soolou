create or replace function public.create_admin_product(
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
end;
$$;

revoke all on function public.create_admin_product(
  text,
  text,
  text,
  numeric,
  text,
  text,
  text,
  text[],
  text,
  text[],
  text,
  jsonb
) from public;

grant execute on function public.create_admin_product(
  text,
  text,
  text,
  numeric,
  text,
  text,
  text,
  text[],
  text,
  text[],
  text,
  jsonb
) to authenticated;

notify pgrst, 'reload schema';
