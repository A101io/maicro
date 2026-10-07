-- Not-found verdict: an engine that says it has no information about the
-- business is its own state, never "nothing wrong". Existing findings are
-- "wrong"; the upsert match key is now (business, fact_key, subject, engine, verdict).
create type verdict as enum ('wrong', 'not_found');
alter table finding add column verdict verdict not null default 'wrong';
create index on finding (business_id, fact_key, engine, verdict);
