-- Sector layer and criteria (docs/CRITERIA.md). Additive only.
--
-- Facts keep their new fields (serviceArea, urgency, credentials, sector) inside
-- the jsonb `data` column; nothing to migrate there. The fact_key enum gains the
-- keys for criteria 4, 5, 11 and 12; business gets the inferred sector; prompt
-- and finding carry the criterium and whether the evidence came from a
-- recommendation question.
alter type fact_key add value if not exists 'area';
alter type fact_key add value if not exists 'urgency';
alter type fact_key add value if not exists 'credential';
alter type fact_key add value if not exists 'identity';

alter table business add column if not exists sector text;
create index if not exists business_sector_idx on business (sector);

alter table prompt add column if not exists criterium int;
alter table prompt add column if not exists kind text not null default 'about';

-- Upsert key for findings is now (business, fact_key, subject, engine, verdict, evidence_kind).
alter table finding add column if not exists evidence_kind text not null default 'about';
alter table finding add column if not exists criterium int;
create index if not exists finding_criterium_idx on finding (business_id, criterium, engine);
