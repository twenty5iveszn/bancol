create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  story_number text,
  title text not null,
  title_accent text,
  origin text,
  read_time text default '5 min read',
  image_url text,
  image_alt text,
  image_caption text,
  excerpt text,
  description text not null,
  opening text not null,
  paragraphs text[] default '{}',
  closing text,
  note text,
  audio_url text,
  video_url text,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stories enable row level security;

drop policy if exists "Published stories are public" on public.stories;
create policy "Published stories are public"
on public.stories for select
using (is_published = true);

drop policy if exists "Authenticated users can add stories" on public.stories;
create policy "Authenticated users can add stories"
on public.stories for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Story owners can update stories" on public.stories;
create policy "Story owners can update stories"
on public.stories for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Story media is public" on storage.objects;
create policy "Story media is public"
on storage.objects for select
using (bucket_id = 'story-media');

drop policy if exists "Authenticated users can upload story media" on storage.objects;
create policy "Authenticated users can upload story media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'story-media');
