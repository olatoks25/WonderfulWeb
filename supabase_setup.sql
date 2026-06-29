-- ================================================================
-- RCCG WONDERFUL MEGA CHURCH — FULL BAAS DATABASE SETUP (Supabase)
-- ================================================================
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE everywhere)
-- ================================================================


-- ================================================================
-- 1. CONTACT SUBMISSIONS
-- ================================================================
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     text default 'new',           -- 'new' | 'read' | 'replied'
  created_at timestamptz default now()
);

alter table contact_submissions enable row level security;

drop policy if exists "Public can submit contact form" on contact_submissions;
create policy "Public can submit contact form"
  on contact_submissions for insert to anon with check (true);

drop policy if exists "Admins can view contact submissions" on contact_submissions;
create policy "Admins can view contact submissions"
  on contact_submissions for select to authenticated using (true);

drop policy if exists "Admins can update contact submissions" on contact_submissions;
create policy "Admins can update contact submissions"
  on contact_submissions for update to authenticated using (true);

drop policy if exists "Admins can delete contact submissions" on contact_submissions;
create policy "Admins can delete contact submissions"
  on contact_submissions for delete to authenticated using (true);


-- ================================================================
-- 2. EVENTS
-- ================================================================
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  tag         text,
  event_date  date not null,
  start_time  text,
  end_time    text,
  location    text,
  cta_label   text default 'Register Now',
  image_url   text,
  published   boolean default true,
  created_at  timestamptz default now()
);

alter table events enable row level security;

drop policy if exists "Public can view published events" on events;
create policy "Public can view published events"
  on events for select to anon using (published = true);

drop policy if exists "Admins can view all events" on events;
create policy "Admins can view all events"
  on events for select to authenticated using (true);

drop policy if exists "Admins can insert events" on events;
create policy "Admins can insert events"
  on events for insert to authenticated with check (true);

drop policy if exists "Admins can update events" on events;
create policy "Admins can update events"
  on events for update to authenticated using (true);

drop policy if exists "Admins can delete events" on events;
create policy "Admins can delete events"
  on events for delete to authenticated using (true);


-- ================================================================
-- 3. EVENT REGISTRATIONS
-- ================================================================
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id   uuid references events(id) on delete cascade,
  full_name  text not null,
  email      text,
  phone      text not null,
  notes      text,
  created_at timestamptz default now()
);

alter table event_registrations enable row level security;

drop policy if exists "Public can register for events" on event_registrations;
create policy "Public can register for events"
  on event_registrations for insert to anon with check (true);

drop policy if exists "Admins can view registrations" on event_registrations;
create policy "Admins can view registrations"
  on event_registrations for select to authenticated using (true);

drop policy if exists "Admins can delete registrations" on event_registrations;
create policy "Admins can delete registrations"
  on event_registrations for delete to authenticated using (true);


-- ================================================================
-- 4. SERMONS
-- ================================================================
create table if not exists sermons (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  preacher     text not null,
  category     text default 'sunday',
  sermon_date  date not null,
  image_url    text,
  watch_url    text,
  listen_url   text,
  is_new       boolean default false,
  published    boolean default true,
  created_at   timestamptz default now()
);

alter table sermons enable row level security;

drop policy if exists "Public can view published sermons" on sermons;
create policy "Public can view published sermons"
  on sermons for select to anon using (published = true);

drop policy if exists "Admins can view all sermons" on sermons;
create policy "Admins can view all sermons"
  on sermons for select to authenticated using (true);

drop policy if exists "Admins can insert sermons" on sermons;
create policy "Admins can insert sermons"
  on sermons for insert to authenticated with check (true);

drop policy if exists "Admins can update sermons" on sermons;
create policy "Admins can update sermons"
  on sermons for update to authenticated using (true);

drop policy if exists "Admins can delete sermons" on sermons;
create policy "Admins can delete sermons"
  on sermons for delete to authenticated using (true);


-- ================================================================
-- 5. PRAYER REQUESTS
-- ================================================================
create table if not exists prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text,
  phone        text,
  request_text text not null,
  is_private   boolean default false,
  status       text default 'new',
  created_at   timestamptz default now()
);

alter table prayer_requests enable row level security;

drop policy if exists "Public can submit prayer requests" on prayer_requests;
create policy "Public can submit prayer requests"
  on prayer_requests for insert to anon with check (true);

drop policy if exists "Admins can view prayer requests" on prayer_requests;
create policy "Admins can view prayer requests"
  on prayer_requests for select to authenticated using (true);

drop policy if exists "Admins can update prayer requests" on prayer_requests;
create policy "Admins can update prayer requests"
  on prayer_requests for update to authenticated using (true);

drop policy if exists "Admins can delete prayer requests" on prayer_requests;
create policy "Admins can delete prayer requests"
  on prayer_requests for delete to authenticated using (true);


-- ================================================================
-- 6. GIVING RECORDS
-- ================================================================
-- NOTE: Supabase does not process payments. This table logs giving
-- NOTIFICATIONS submitted by the giver after a manual bank transfer,
-- so the church has a record and can follow up. It is NOT a live
-- payment gateway and does not move money.
create table if not exists giving_records (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text,
  phone          text,
  giving_type    text default 'offering',
  amount         numeric,
  payment_method text default 'bank_transfer',
  reference_note text,
  status         text default 'pending',
  created_at     timestamptz default now()
);

alter table giving_records enable row level security;

drop policy if exists "Public can submit giving records" on giving_records;
create policy "Public can submit giving records"
  on giving_records for insert to anon with check (true);

drop policy if exists "Admins can view giving records" on giving_records;
create policy "Admins can view giving records"
  on giving_records for select to authenticated using (true);

drop policy if exists "Admins can update giving records" on giving_records;
create policy "Admins can update giving records"
  on giving_records for update to authenticated using (true);

drop policy if exists "Admins can delete giving records" on giving_records;
create policy "Admins can delete giving records"
  on giving_records for delete to authenticated using (true);


-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_contact_created     on contact_submissions (created_at desc);
create index if not exists idx_events_date          on events (event_date asc);
create index if not exists idx_registrations_event  on event_registrations (event_id);
create index if not exists idx_sermons_date         on sermons (sermon_date desc);
create index if not exists idx_sermons_category     on sermons (category);
create index if not exists idx_prayer_created       on prayer_requests (created_at desc);
create index if not exists idx_giving_created       on giving_records (created_at desc);


-- ================================================================
-- SEED DATA (your current hardcoded events & sermons, so the site
-- isn't empty the moment you switch from static HTML to live data)
-- ================================================================
insert into events (title, description, tag, event_date, start_time, end_time, location, cta_label)
values
  ('Pentecost Sunday Celebration', 'A powerful day of worship, fire, and the outpouring of the Holy Spirit. Come expectant, leave transformed.', 'Annual', '2026-05-18', '8:00 AM', '1:00 PM', 'RCCG Wonderful Mega, Ijero Ekiti', 'Register Now'),
  ('Youth Empowerment Summit', 'A full-day conference for young adults — leadership, identity, career, and faith in today''s world.', 'Youth', '2026-06-07', '10:00 AM', '5:00 PM', 'RCCG Wonderful Mega, Ijero Ekiti', 'Register Now'),
  ('Community Outreach Day', 'Serving our community with food, medical check-ups, and the love of Christ. Volunteers welcome!', 'Outreach', '2026-06-22', '9:00 AM', '3:00 PM', 'Ijero Ekiti Town Square', 'Volunteer'),
  ('Night of Breakthrough', 'An all-night prayer meeting for divine intervention, breakthroughs, and fresh encounters with God.', 'Prayer', '2026-07-05', '10:00 PM', '4:00 AM', 'RCCG Wonderful Mega, Ijero Ekiti', 'Register Now'),
  ('Family Fun Day', 'A day of food, games, fellowship, and celebration for the whole church family. Bring everyone!', 'Family', '2026-07-20', '11:00 AM', '6:00 PM', 'RCCG Wonderful Mega Grounds', 'RSVP'),
  ('Harvest Thanksgiving Service', 'Our annual harvest thanksgiving — celebrating God''s faithfulness over our lives, homes, and nation.', 'Annual', '2026-08-10', '8:00 AM', '2:00 PM', 'RCCG Wonderful Mega, Ijero Ekiti', 'Register Now')
on conflict do nothing;

insert into sermons (title, preacher, category, sermon_date, is_new)
values
  ('Walking in Divine Purpose', 'Pastor Majek (PICP)', 'sunday', '2025-04-27', true),
  ('The Power of Persistent Prayer', 'Pastor Olatokun (PICZ)', 'sunday', '2025-04-20', false),
  ('Rooted in His Grace', 'Pastor Majek (PICP)', 'bible', '2025-04-13', false),
  ('The God Who Provides', 'Pastor Olatokun (PICZ)', 'special', '2025-04-06', false),
  ('Overflow of the Spirit', 'Pastor Majek (PICP)', 'sunday', '2025-03-30', false),
  ('Faith That Moves Mountains', 'Pastor Olatokun (PICZ)', 'bible', '2025-03-23', false)
on conflict do nothing;


-- ================================================================
-- DONE. NEXT STEPS:
-- 1. Supabase Dashboard → Authentication → Users → Add User
--    Create your admin email/password (this logs into admin.html)
-- 2. Settings → API → copy Project URL + anon public key
--    into supabase-config.js
-- ================================================================
