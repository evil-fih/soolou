insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "Anyone can read product images" on storage.objects;
drop policy if exists "Product managers upload product images" on storage.objects;
drop policy if exists "Product managers update product images" on storage.objects;
drop policy if exists "Product managers delete product images" on storage.objects;

create policy "Anyone can read product images"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "Product managers upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_product_manager());

create policy "Product managers update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_product_manager())
with check (bucket_id = 'product-images' and public.is_product_manager());

create policy "Product managers delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_product_manager());
