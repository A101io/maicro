-- The four tables the browser never reads directly (prompt, sample, claim,
-- job) had no RLS. On Supabase every public table is reachable through the
-- Data API with the anon key that ships in the web app, so without RLS anyone
-- could read the evidence or write into the job queue. RLS with no policies
-- denies anon and authenticated; the service role and the table owner (the
-- worker's DATABASE_URL) are unaffected.
alter table prompt enable row level security;
alter table sample enable row level security;
alter table claim enable row level security;
alter table job enable row level security;

-- Supabase's "enable RLS automatically" option installs this event-trigger
-- function in public, where the Data API exposes it as an RPC. It only needs
-- to run as a trigger; nobody should call it over the API.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
