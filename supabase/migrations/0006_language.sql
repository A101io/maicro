-- The owner's language: the dashboard and the report follow it (e-mails are still Dutch).
-- Set from the account page or the NL · EN switch while signed in.
alter table business add column if not exists language text not null default 'nl' check (language in ('nl', 'en'));
