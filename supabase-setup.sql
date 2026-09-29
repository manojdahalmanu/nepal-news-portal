-- 1) Create news table
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  summary text,
  content text,
  image_url text,
  published boolean not null default true,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS
alter table public.news enable row level security;

-- Public users can only read published news
create policy "public can read published news"
on public.news
for select
using (published = true or auth.role() = 'authenticated');

-- Logged-in admin users can insert/update/delete
create policy "authenticated can insert news"
on public.news
for insert
to authenticated
with check (true);

create policy "authenticated can update news"
on public.news
for update
to authenticated
using (true)
with check (true);

create policy "authenticated can delete news"
on public.news
for delete
to authenticated
using (true);

-- 3) Create public storage bucket for news images
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do update set public = true;

-- Public can view image files
create policy "public can view news images"
on storage.objects
for select
using (bucket_id = 'news-images');

-- Authenticated admin can upload
create policy "authenticated can upload news images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'news-images');

-- Authenticated admin can update/delete
create policy "authenticated can update news images"
on storage.objects
for update
to authenticated
using (bucket_id = 'news-images');

create policy "authenticated can delete news images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'news-images');
