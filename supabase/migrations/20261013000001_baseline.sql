-- ============================================================
-- Seekers Community — Baseline Schema (P0 foundations)
-- ============================================================
-- Rules:
--   • Money is integer paise, never float
--   • Ledgers (credit_transactions, owner_commissions, payouts) are append-only
--   • PII tables have NO policy — accessible only via server key
--   • Actor is always derived from auth.uid(), never from the request body
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
create type referral_status as enum (
  'INITIATED','ACCEPTED','CONTACTED','IN_PROGRESS',
  'CLOSED_WON','CLOSED_LOST','EXPIRED','UNRESOLVED','DISPUTED'
);

create type referral_type as enum ('self_service','third_party');

create type approval_status as enum ('pending','approved','rejected');

create type credit_type as enum ('CREDIT','DEBIT');

create type badge_type as enum ('verified_business','verified_freelancer');

create type event_rsvp_status as enum ('going','waitlist','cancelled','attended');

create type content_status as enum ('pending','approved','rejected');

create type content_source as enum ('member','editorial');

create type user_role as enum ('member','business','community_owner','moderator','admin');

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique not null references auth.users(id) on delete cascade,
  name                  text not null,
  photo_url             text,
  location              text,
  bio                   text,
  designation           text,
  company               text,
  industry              text,
  directory_visible     boolean not null default false,
  leaderboard_opt_in    boolean not null default false,
  spotlight_opt_in      boolean not null default false,
  roles                 user_role[] not null default '{member}',
  invite_code           text unique not null default 'INV-' || upper(substr(gen_random_uuid()::text,1,8)),
  invited_by            uuid references profiles(id),
  attributed_owner_id   uuid references profiles(id),  -- set-once, never changed by member
  grandfathered         boolean not null default true,   -- true while platform is in free mode
  tier                  text not null default 'free',
  created_at            timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  referral_fee_allowed  boolean not null default true,
  regulator             text,   -- e.g. 'SEBI', 'IRDAI', 'BCI', 'ICAI'
  created_at            timestamptz not null default now()
);

-- Regulated categories — no credits and no paid referral
insert into categories (slug, name, referral_fee_allowed, regulator) values
  ('insurance',           'Insurance',           false, 'IRDAI'),
  ('legal',               'Legal',               false, 'BCI'),
  ('ca-tax',              'CA / Tax',             false, 'ICAI'),
  ('investment-advisory', 'Investment advisory',  false, 'SEBI');

-- ============================================================
-- BUSINESS PROFILES
-- ============================================================
create table business_profiles (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references profiles(id) on delete cascade,
  name             text not null,
  slug             text unique,
  type             text not null check (type in ('business','freelancer')),
  category_id      uuid references categories(id),
  bio              text,
  logo_path        text,
  location         text,
  years            int,
  website          text,
  social_links     jsonb,
  approval_status  approval_status not null default 'pending',
  approved_at      timestamptz,
  approved_by      uuid references profiles(id),
  rating           numeric(3,2),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint slug_not_empty check (slug is null or length(slug) > 0)
);

create table slug_history (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references business_profiles(id) on delete cascade,
  old_slug     text not null,
  changed_at   timestamptz not null default now()
);

-- ============================================================
-- CATALOGUE
-- ============================================================
create table catalogue_items (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references business_profiles(id) on delete cascade,
  title        text not null,
  description  text,
  price_paise  int,               -- null = "price on request"
  price_label  text,
  image_path   text,
  position     int not null default 0,
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- REFERRAL ENGINE
-- ============================================================
create table referral_terms_defaults (
  id                      uuid primary key default gen_random_uuid(),
  reward_credits          int not null default 100,
  success_fee_percent     numeric(5,2),
  success_fee_flat_paise  int,
  success_fee_type        text check (success_fee_type in ('percent','flat','slab')),
  unresolved_timeout_days int not null default 30,
  pending_timeout_days    int not null default 7,
  effective_from          timestamptz not null default now(),
  set_by                  uuid references profiles(id)
);

create table business_referral_terms (
  id                      uuid primary key default gen_random_uuid(),
  business_id             uuid not null references business_profiles(id) on delete cascade,
  reward_credits          int not null,
  success_fee_percent     numeric(5,2),
  success_fee_flat_paise  int,
  success_fee_type        text check (success_fee_type in ('percent','flat','slab')),
  effective_from          timestamptz not null default now(),
  set_by                  uuid references profiles(id)
);

create table success_fee_slabs (
  id           uuid primary key default gen_random_uuid(),
  terms_id     uuid not null references business_referral_terms(id) on delete cascade,
  min_paise    int not null,
  max_paise    int,
  fee_paise    int not null
);

-- Legal state-machine transitions (14 allowed moves)
create table referral_transitions (
  from_state referral_status,
  to_state   referral_status,
  actor      text not null check (actor in ('referrer','business','seeker','system','admin')),
  primary key (from_state, to_state)
);
insert into referral_transitions values
  ('INITIATED',   'ACCEPTED',     'business'),
  ('INITIATED',   'CLOSED_LOST',  'business'),
  ('INITIATED',   'EXPIRED',      'system'),
  ('ACCEPTED',    'CONTACTED',    'business'),
  ('ACCEPTED',    'CLOSED_LOST',  'business'),
  ('ACCEPTED',    'UNRESOLVED',   'system'),
  ('CONTACTED',   'IN_PROGRESS',  'business'),
  ('CONTACTED',   'CLOSED_LOST',  'business'),
  ('IN_PROGRESS', 'CLOSED_WON',   'seeker'),
  ('IN_PROGRESS', 'CLOSED_LOST',  'business'),
  ('IN_PROGRESS', 'UNRESOLVED',   'system'),
  ('CLOSED_WON',  'DISPUTED',     'business'),
  ('CLOSED_WON',  'DISPUTED',     'admin'),
  ('DISPUTED',    'CLOSED_WON',   'admin'),
  ('DISPUTED',    'CLOSED_LOST',  'admin');

create table referrals (
  id                  uuid primary key default gen_random_uuid(),
  code                text unique not null default 'REF-' || upper(substr(gen_random_uuid()::text,1,8)),
  type                referral_type not null,
  referrer_id         uuid not null references profiles(id),
  business_id         uuid not null references business_profiles(id),
  seeker_id           uuid references profiles(id),  -- null for third-party non-member
  state               referral_status not null default 'INITIATED',
  deal_value_paise    int,
  lost_reason         text,
  terms_snapshot      jsonb,   -- copy of terms at creation time
  credits             int,
  success_fee_paise   int,
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Seeker contact lives in its own private table, not on referrals (F5 fix)
create table referral_seeker_contact (
  referral_id   uuid primary key references referrals(id) on delete cascade,
  name          text not null,
  phone         text,          -- stored only after business accepts
  created_at    timestamptz not null default now()
);

create table referral_transitions_log (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references referrals(id) on delete cascade,
  from_state   referral_status,
  to_state     referral_status not null,
  actor_id     uuid references profiles(id),
  actor_role   text,
  note         text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- CREDITS LEDGER (append-only)
-- ============================================================
create table credit_transactions (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references profiles(id),
  referral_id  uuid unique references referrals(id),  -- unique: no double-award (F8 fix)
  amount       int not null,
  type         credit_type not null,
  status       text not null default 'pending' check (status in ('pending','settled')),
  currency     text not null default 'CREDIT',
  settles_at   timestamptz,
  settled_at   timestamptz,
  note         text,
  created_at   timestamptz not null default now()
);

-- Derived view: member balance from ledger (never a stored column)
create view member_balance as
  select
    member_id,
    sum(case when type='CREDIT' and status='settled' then amount else 0 end)  as settled,
    sum(case when type='CREDIT' and status='pending' then amount else 0 end)  as pending,
    sum(case when type='DEBIT'  then amount else 0 end)                        as spent
  from credit_transactions
  group by member_id;

-- ============================================================
-- ENQUIRIES  (PII — server-key only)
-- ============================================================
create table enquiries (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references business_profiles(id) on delete cascade,
  sender_profile_id   uuid references profiles(id),
  name                text not null,
  contact_encrypted   text not null,  -- AES-GCM, key in env
  message             text not null,
  status              text not null default 'new' check (status in ('new','replied','became_customer')),
  became_customer     boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- MEMBER CONTACTS  (PII — server-key only)
-- ============================================================
create table member_contacts (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  phone       text,
  email       text,
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CONNECT REQUESTS (Members Directory)
-- ============================================================
create table connect_requests (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references profiles(id),
  to_id       uuid not null references profiles(id),
  note        text,
  status      text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at  timestamptz not null default now(),
  unique (from_id, to_id)
);

create table blocks (
  blocker_id  uuid not null references profiles(id),
  blocked_id  uuid not null references profiles(id),
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- Tags for members directory
create table tags (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null
);

create table profile_tags (
  profile_id  uuid not null references profiles(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (profile_id, tag_id)
);

-- ============================================================
-- EVENTS
-- ============================================================
create table events (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  date_time      timestamptz not null,
  location       text,
  online_url     text,         -- shown only to RSVPd members
  capacity       int,
  is_paid        boolean not null default false,
  price_paise    int,
  host_id        uuid not null references profiles(id),
  status         text not null default 'upcoming' check (status in ('upcoming','past','cancelled')),
  cover_image    text,
  created_at     timestamptz not null default now()
);

create table event_rsvps (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id) on delete cascade,
  profile_id      uuid not null references profiles(id),
  status          event_rsvp_status not null default 'going',
  paid_recorded   boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (event_id, profile_id)
);

-- ============================================================
-- INITIATIVES
-- ============================================================
create table initiatives (
  id           uuid primary key default gen_random_uuid(),
  org_name     text not null,
  title        text not null,
  description  text,
  image_path   text,
  donate_url   text,
  contact_info text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table initiative_responses (
  id             uuid primary key default gen_random_uuid(),
  initiative_id  uuid not null references initiatives(id) on delete cascade,
  profile_id     uuid not null references profiles(id),
  type           text not null check (type in ('volunteer','contact')),
  message        text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- KNOWLEDGE / CONTENT
-- ============================================================
create table content (
  id             uuid primary key default gen_random_uuid(),
  url            text not null,
  title          text not null,
  description    text,             -- max 280 chars enforced in app
  preview_image  text,
  preview_title  text,
  site_name      text,
  category       text not null,
  source         content_source not null default 'member',
  status         content_status not null default 'pending',
  author_id      uuid not null references profiles(id),
  featured       boolean not null default false,
  created_at     timestamptz not null default now()
);

create table content_reactions (
  content_id   uuid not null references content(id) on delete cascade,
  profile_id   uuid not null references profiles(id),
  type         text not null check (type in ('helpful','save')),
  created_at   timestamptz not null default now(),
  primary key (content_id, profile_id, type)
);

create table content_reports (
  id           uuid primary key default gen_random_uuid(),
  content_id   uuid not null references content(id) on delete cascade,
  reporter_id  uuid not null references profiles(id),
  reason       text not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- SITE CONTENT (CMS)
-- ============================================================
create table site_content (
  key         text primary key,
  body        jsonb not null default '{}',
  version     int not null default 1,
  updated_by  uuid references profiles(id),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- VERIFICATION
-- ============================================================
create table verification_applications (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references business_profiles(id) on delete cascade,
  type         badge_type not null,
  status       approval_status not null default 'pending',
  notes        text,
  delete_after timestamptz,     -- admin sets retention period
  created_at   timestamptz not null default now()
);

create table verification_documents (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references verification_applications(id) on delete cascade,
  storage_path    text not null,   -- private bucket path
  label           text,
  created_at      timestamptz not null default now()
);

create table badges (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references business_profiles(id) on delete cascade,
  type         badge_type not null,
  granted_at   timestamptz not null default now(),
  expires_at   timestamptz,
  revoked_at   timestamptz
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id                uuid primary key default gen_random_uuid(),
  type              text not null check (type in ('verified','testimonial')),
  business_id       uuid not null references business_profiles(id) on delete cascade,
  author_profile_id uuid references profiles(id),
  referral_id       uuid references referrals(id),
  enquiry_id        uuid references enquiries(id),
  token_hash        text unique,   -- single-use testimonial token
  rating            int check (rating between 1 and 5),
  text              text not null check (length(text) <= 200),
  status            content_status not null default 'pending',
  reply             text,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- COMMUNITY OWNERS
-- ============================================================
create table community_owners (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid unique not null references profiles(id),
  code        text unique not null,
  status      text not null default 'active' check (status in ('active','suspended')),
  created_at  timestamptz not null default now()
);

create table owner_rates (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references community_owners(id),
  percent         numeric(5,2) not null,
  effective_from  timestamptz not null default now(),
  effective_to    timestamptz,
  set_by          uuid references profiles(id)
);

-- ============================================================
-- REVENUE & COMMISSIONS (append-only)
-- ============================================================
create table revenue_events (
  id              uuid primary key default gen_random_uuid(),
  source          text not null check (source in ('subscription','paid_event','success_fee','wealth_seekers','other')),
  profile_id      uuid references profiles(id),
  amount_paise    int not null,
  occurred_on     date not null default current_date,
  commissionable  boolean not null default true,
  recorded_by     uuid references profiles(id),
  reference       text,
  created_at      timestamptz not null default now()
);

create table owner_commissions (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references community_owners(id),
  revenue_event_id  uuid not null references revenue_events(id),
  rate              numeric(5,2) not null,
  amount_paise      int not null,
  created_at        timestamptz not null default now()
);

create table payouts (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references community_owners(id),
  period       text not null,   -- e.g. '2026-09'
  amount_paise int not null,
  paid_on      date,
  method       text,
  reference    text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- FEATURE FLAGS / SUBSCRIPTIONS
-- ============================================================
create table feature_flags (
  key      text primary key,
  enabled  boolean not null default false,
  note     text
);

create table plans (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null,
  price_paise int not null default 0
);

create table entitlements (
  plan_id      uuid not null references plans(id),
  feature_key  text not null references feature_flags(key),
  primary key (plan_id, feature_key)
);

-- Seed feature flags (all off at launch)
insert into feature_flags (key, enabled, note) values
  ('paid_mode',             false, 'Master paywall switch'),
  ('business_listing_paid', false, 'Upgraded listing tier'),
  ('directory_search',      false, 'Advanced directory filters'),
  ('event_access_paid',     false, 'Paid events visible');

-- ============================================================
-- ONBOARDING
-- ============================================================
create table onboarding_progress (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  step        text not null default 'profile',
  done_at     timestamptz
);

-- ============================================================
-- SPOTLIGHTS
-- ============================================================
create table spotlights (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('business','owner','knowledge','event','announcement')),
  ref_id      uuid not null,
  reason      text,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
create table announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  pinned     boolean not null default false,
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FAQ / SUPPORT
-- ============================================================
create table faq_items (
  id        uuid primary key default gen_random_uuid(),
  question  text not null,
  answer    text not null,
  topic     text not null,
  position  int not null default 0,
  created_at timestamptz not null default now()
);

create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references profiles(id),
  email       text,
  message     text not null,
  status      text not null default 'open' check (status in ('open','resolved')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INVITES
-- ============================================================
create table invite_events (
  id          uuid primary key default gen_random_uuid(),
  inviter_id  uuid not null references profiles(id),
  type        text not null check (type in ('opened','joined')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid not null references profiles(id),
  type        text not null,
  payload     jsonb not null default '{}',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table email_log (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid references profiles(id),
  email       text not null,
  template    text not null,
  status      text not null default 'queued',
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table notification_prefs (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  categories  jsonb not null default '{}'
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references profiles(id),
  action       text not null,
  target_type  text not null,
  target_id    uuid,
  detail       jsonb,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- WEALTH SEEKERS LEADS  (PII — server-key only)
-- ============================================================
create table ws_leads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  contact_encrypted text not null,
  interest          text,
  consent_at        timestamptz not null,
  member_id         uuid references profiles(id),
  utm               jsonb,
  created_at        timestamptz not null default now()
);

create table compliance_approvals (
  content_key  text not null,
  version      int not null,
  approved_by  uuid not null references profiles(id),
  approved_at  timestamptz not null default now(),
  primary key (content_key, version)
);

-- ============================================================
-- VIEWS
-- ============================================================
create view business_honour as
  select
    r.business_id,
    count(*) filter (where r.state = 'CLOSED_WON')::float /
      nullif(count(*) filter (where r.state in ('CLOSED_WON','CLOSED_LOST','EXPIRED','UNRESOLVED')), 0)
      as honour_rate
  from referrals r
  group by r.business_id;

-- ============================================================
-- INDEXES  (full-text search)
-- ============================================================
create index on business_profiles using gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(bio,'')));
create index on profiles using gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(company,'')));
create index on content using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));
create index on referrals(business_id, state);
create index on referrals(referrer_id);
create index on credit_transactions(member_id);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- Profiles: public read; own-row update restricted columns
alter table profiles enable row level security;
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_own_update" on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Business profiles: approved ones are public; owner can update own
alter table business_profiles enable row level security;
create policy "bp_public_read" on business_profiles for select
  using (approval_status = 'approved');
create policy "bp_owner_update" on business_profiles for update
  using (owner_id = (select id from profiles where user_id = auth.uid()));
create policy "bp_owner_insert" on business_profiles for insert
  with check (owner_id = (select id from profiles where user_id = auth.uid()));

-- Catalogue: public read on approved businesses
alter table catalogue_items enable row level security;
create policy "cat_public_read" on catalogue_items for select
  using (exists (
    select 1 from business_profiles bp
    where bp.id = business_id and bp.approval_status = 'approved' and not hidden
  ));
create policy "cat_owner_write" on catalogue_items for all
  using (exists (
    select 1 from business_profiles bp
    where bp.id = business_id and bp.owner_id = (select id from profiles where user_id = auth.uid())
  ));

-- Categories: members read, admin write
alter table categories enable row level security;
create policy "cat_member_read" on categories for select
  using (auth.uid() is not null);

-- Referral config tables: members read, no browser write
alter table referral_transitions enable row level security;
create policy "rt_member_read" on referral_transitions for select using (auth.uid() is not null);

alter table referral_terms_defaults enable row level security;
create policy "rtd_member_read" on referral_terms_defaults for select using (auth.uid() is not null);

alter table business_referral_terms enable row level security;
create policy "brt_member_read" on business_referral_terms for select using (auth.uid() is not null);

alter table success_fee_slabs enable row level security;
create policy "sfs_member_read" on success_fee_slabs for select using (auth.uid() is not null);

-- Referrals: parties only
alter table referrals enable row level security;
create policy "ref_parties_read" on referrals for select
  using (
    referrer_id = (select id from profiles where user_id = auth.uid())
    or business_id in (
      select id from business_profiles where owner_id = (select id from profiles where user_id = auth.uid())
    )
    or seeker_id = (select id from profiles where user_id = auth.uid())
  );

-- PII tables: NO policy — server key only
alter table member_contacts enable row level security;
alter table enquiries enable row level security;
alter table referral_seeker_contact enable row level security;
alter table ws_leads enable row level security;
-- No policies added — zero rows returned to browser role

-- Connect requests: parties only
alter table connect_requests enable row level security;
create policy "cr_parties" on connect_requests for select
  using (
    from_id = (select id from profiles where user_id = auth.uid())
    or to_id = (select id from profiles where user_id = auth.uid())
  );
create policy "cr_own_insert" on connect_requests for insert
  with check (from_id = (select id from profiles where user_id = auth.uid()));

-- Blocks: self
alter table blocks enable row level security;
create policy "blocks_self" on blocks for all
  using (blocker_id = (select id from profiles where user_id = auth.uid()));

-- Events: public read
alter table events enable row level security;
create policy "events_public_read" on events for select using (true);

-- Event RSVPs: self + admin
alter table event_rsvps enable row level security;
create policy "rsvp_self" on event_rsvps for select
  using (profile_id = (select id from profiles where user_id = auth.uid()));
create policy "rsvp_self_insert" on event_rsvps for insert
  with check (profile_id = (select id from profiles where user_id = auth.uid()));

-- Content: approved posts public; pending visible to author
alter table content enable row level security;
create policy "content_approved_read" on content for select
  using (status = 'approved' or author_id = (select id from profiles where user_id = auth.uid()));
create policy "content_member_insert" on content for insert
  with check (auth.uid() is not null and author_id = (select id from profiles where user_id = auth.uid()));

-- Reviews: approved public
alter table reviews enable row level security;
create policy "reviews_approved_read" on reviews for select using (status = 'approved');

-- Badges: public
alter table badges enable row level security;
create policy "badges_public_read" on badges for select using (true);

-- Credit transactions: own rows
alter table credit_transactions enable row level security;
create policy "credits_own_read" on credit_transactions for select
  using (member_id = (select id from profiles where user_id = auth.uid()));

-- Feature flags: member read
alter table feature_flags enable row level security;
create policy "flags_member_read" on feature_flags for select using (auth.uid() is not null);

-- Notifications: self
alter table notifications enable row level security;
create policy "notif_self" on notifications for select
  using (recipient = (select id from profiles where user_id = auth.uid()));

-- Spotlights: public
alter table spotlights enable row level security;
create policy "spotlights_public" on spotlights for select using (true);

-- Announcements: member read
alter table announcements enable row level security;
create policy "ann_member_read" on announcements for select using (auth.uid() is not null);

-- FAQ: public
alter table faq_items enable row level security;
create policy "faq_public" on faq_items for select using (true);

-- Site content: public (body) — no PII
alter table site_content enable row level security;
create policy "sc_public_read" on site_content for select using (true);

-- Audit log: admin read, insert only
alter table audit_log enable row level security;
create policy "audit_insert" on audit_log for insert with check (true);

-- Tags: member read
alter table tags enable row level security;
create policy "tags_member_read" on tags for select using (auth.uid() is not null);
alter table profile_tags enable row level security;
create policy "ptags_member_read" on profile_tags for select using (auth.uid() is not null);

-- Onboarding: self
alter table onboarding_progress enable row level security;
create policy "onb_self" on onboarding_progress for all
  using (profile_id = (select id from profiles where user_id = auth.uid()));
