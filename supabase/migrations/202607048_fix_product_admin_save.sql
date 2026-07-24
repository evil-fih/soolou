alter table public.products
alter column id drop default;

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
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (admin_role in ('admin', 'sub_admin') or is_admin = true)
  ) then
    raise exception 'Product manager access is required.'
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
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (admin_role in ('admin', 'sub_admin') or is_admin = true)
  ) then
    raise exception 'Product manager access is required.'
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

grant select on public.products to anon;
grant select on public.products to authenticated;

revoke all on function public.save_admin_product(
  integer,
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
revoke all on function public.archive_admin_product(integer) from public;

grant execute on function public.save_admin_product(
  integer,
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
grant execute on function public.archive_admin_product(integer) to authenticated;

notify pgrst, 'reload schema';
