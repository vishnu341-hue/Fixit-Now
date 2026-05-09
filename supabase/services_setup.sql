create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  category text not null default 'electrician',
  keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

insert into public.services (name, description, category, keywords)
values
  (
    'Fan Repair',
    'Ceiling and wall fan troubleshooting, repair, and safe rewiring.',
    'electrician',
    array['fan', 'repair', 'electrician']
  ),
  (
    'Tube Light Fixing',
    'Tube light fitting, starter/choke replacement, and wiring fixes.',
    'electrician',
    array['tube light', 'light fixing', 'electrician']
  )
on conflict (name) do update
set
  description = excluded.description,
  category = excluded.category,
  keywords = excluded.keywords;
