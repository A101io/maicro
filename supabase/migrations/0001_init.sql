-- Maicro schema. Facts are owner-asserted; samples are evidence; findings are the diff.
create extension if not exists "pgcrypto";

create type business_status as enum ('scanned','trial','active','paused','churned');
create type business_plan as enum ('none','setup','monitor');
create type engine as enum ('chatgpt','gemini','perplexity','google_ai','copilot');
create type scan_kind as enum ('free','baseline','monthly','recheck','ondemand');
create type scan_status as enum ('queued','running','done','failed');
create type fact_key as enum ('existence','hours','phone','address','website','service','price','policy','payment');
create type source_type as enum ('owned_facts_page','owned_website','directory_api','directory_form','third_party','other_entity','none');
create type finding_status as enum ('open','fixing','recheck','resolved','unfixable');
create type fix_action as enum ('republish','sync','form','email','manual','none');
create type channel_type as enum ('facts_page','gbp','bing','apple','directory');
create type channel_status as enum ('pending','synced','mismatch','failed','manual');

create table business (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  place text not null,
  domain text,
  kvk text,
  google_place_id text,
  plan business_plan not null default 'none',
  status business_status not null default 'scanned',
  owner_email text,
  owner_user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  facts_host text,                       -- feiten.example.nl or {slug}.feiten.maicro.nl
  facts_host_verified_at timestamptz,
  anniversary_day int,                   -- day of month for monthly scan
  created_at timestamptz not null default now()
);
create index on business (status);
create index on business (owner_email);

create table facts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  version int not null,
  provisional boolean not null default true,
  verified_at timestamptz,
  data jsonb not null,                   -- Facts (see packages/core/src/types.ts)
  created_at timestamptz not null default now(),
  unique (business_id, version)
);
create index on facts (business_id, version desc);

create table prompt (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  category fact_key not null,
  text_nl text not null,
  probes text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on prompt (business_id) where active;

create table scan_run (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  kind scan_kind not null,
  engines engine[] not null,
  samples_per_prompt int not null,
  status scan_status not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  cost_cents int not null default 0,
  error text,
  created_at timestamptz not null default now()
);
create index on scan_run (business_id, created_at desc);

create table sample (
  id uuid primary key default gen_random_uuid(),
  scan_run_id uuid not null references scan_run(id) on delete cascade,
  prompt_id uuid not null references prompt(id) on delete cascade,
  engine engine not null,
  answer_text text not null,
  citations text[] not null default '{}',
  captured_at timestamptz not null default now(),
  cost_cents int not null default 0
);
create index on sample (scan_run_id);

create table claim (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references sample(id) on delete cascade,
  fact_key fact_key not null,
  subject text,
  value text not null,
  confidence real not null,
  other_entity boolean not null default false,
  raw_quote text
);
create index on claim (sample_id);

create table finding (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  scan_run_id uuid not null references scan_run(id) on delete cascade,
  fact_key fact_key not null,
  subject text,
  engine engine not null,
  wrong_value text not null,
  correct_value text not null,
  frequency int not null,
  sample_count int not null,
  source_url text,
  source_type source_type not null default 'none',
  status finding_status not null default 'open',
  first_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  evidence_before uuid references sample(id),
  evidence_after uuid references sample(id)
);
create index on finding (business_id, status);

create table fix (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references finding(id) on delete cascade,
  action fix_action not null,
  target text not null,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  recheck_at timestamptz,
  resolved_at timestamptz,
  evidence jsonb not null default '{}'::jsonb
);
create index on fix (recheck_at) where resolved_at is null;

create table channel (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  type channel_type not null,
  name text not null,
  external_id text,
  url text,
  status channel_status not null default 'pending',
  last_synced_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);
create index on channel (business_id);

create table event (
  id bigserial primary key,
  business_id uuid references business(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index on event (business_id, at desc);

-- Simple Postgres job queue (no external queue dependency).
create table job (
  id bigserial primary key,
  kind text not null,              -- 'scan' | 'publish' | 'sync' | 'fix' | 'recheck' | 'report'
  payload jsonb not null default '{}'::jsonb,
  run_at timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_at timestamptz,
  done_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index on job (run_at) where done_at is null and locked_at is null;

-- Row level security: owners see their own business through the web app.
alter table business enable row level security;
alter table facts enable row level security;
alter table finding enable row level security;
alter table fix enable row level security;
alter table channel enable row level security;
alter table event enable row level security;
alter table scan_run enable row level security;

create policy owner_business on business for select using (owner_user_id = auth.uid());
create policy owner_facts on facts for select using (exists (select 1 from business b where b.id = business_id and b.owner_user_id = auth.uid()));
create policy owner_finding on finding for select using (exists (select 1 from business b where b.id = business_id and b.owner_user_id = auth.uid()));
create policy owner_fix on fix for select using (exists (select 1 from finding f join business b on b.id = f.business_id where f.id = finding_id and b.owner_user_id = auth.uid()));
create policy owner_channel on channel for select using (exists (select 1 from business b where b.id = business_id and b.owner_user_id = auth.uid()));
create policy owner_event on event for select using (exists (select 1 from business b where b.id = business_id and b.owner_user_id = auth.uid()));
create policy owner_scan on scan_run for select using (exists (select 1 from business b where b.id = business_id and b.owner_user_id = auth.uid()));
-- Writes go through the service role (API routes / workers).
