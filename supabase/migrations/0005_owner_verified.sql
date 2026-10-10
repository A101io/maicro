-- Ownership is proven, not claimed. An e-mail address only says who asked
-- for a report; owner_verified_at says someone signed in with a Google
-- Business Profile whose location is this business (place id match).
-- Saving facts, linking a domain and every publish/sync/fix job require it.
alter table business add column if not exists owner_verified_at timestamptz;
alter table business add column if not exists owner_verified_via text;
