-- ============================================================
-- WK Poule 2026 — Initieel database schema
-- ============================================================

-- Extensies
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  username    text        not null unique,
  full_name   text        not null,
  avatar_url  text,
  role        text        not null default 'player' check (role in ('player', 'admin')),
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_role     on public.profiles(role);
create index if not exists idx_profiles_active   on public.profiles(is_active);

-- Trigger: updated_at automatisch bijwerken
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Trigger: profiel aanmaken bij registratie
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INVITATIONS
-- ============================================================
create table if not exists public.invitations (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  token       text        not null unique,
  invited_by  uuid        references public.profiles(id) on delete set null,
  used_at     timestamptz,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invitations_token    on public.invitations(token);
create index if not exists idx_invitations_email    on public.invitations(email);
create index if not exists idx_invitations_used_at  on public.invitations(used_at);

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists public.teams (
  id          uuid        primary key default gen_random_uuid(),
  external_id text        not null unique,
  name        text        not null,
  short_name  text        not null,
  tla         text,
  flag_url    text,
  group_name  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_teams_external_id  on public.teams(external_id);
create index if not exists idx_teams_group_name   on public.teams(group_name);

create trigger teams_updated_at
  before update on public.teams
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- MATCHES
-- ============================================================
create table if not exists public.matches (
  id              uuid        primary key default gen_random_uuid(),
  external_id     text        not null unique,
  home_team_id    uuid        references public.teams(id) on delete set null,
  away_team_id    uuid        references public.teams(id) on delete set null,
  scheduled_at    timestamptz not null,
  stage           text        not null check (stage in ('GROUP','LAST_32','LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL')),
  group_name      text,
  matchday        integer,
  status          text        not null default 'SCHEDULED' check (status in ('SCHEDULED','TIMED','IN_PLAY','PAUSED','FINISHED','POSTPONED','CANCELLED','SUSPENDED')),
  home_score      integer     check (home_score >= 0),
  away_score      integer     check (away_score >= 0),
  score_processed boolean     not null default false,
  venue           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_matches_external_id      on public.matches(external_id);
create index if not exists idx_matches_status           on public.matches(status);
create index if not exists idx_matches_scheduled_at     on public.matches(scheduled_at);
create index if not exists idx_matches_score_processed  on public.matches(score_processed);

create trigger matches_updated_at
  before update on public.matches
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- SCORERS
-- ============================================================
create table if not exists public.scorers (
  id          uuid        primary key default gen_random_uuid(),
  external_id text        not null unique,
  name        text        not null,
  team_id     uuid        references public.teams(id) on delete set null,
  goals       integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_scorers_external_id  on public.scorers(external_id);
create index if not exists idx_scorers_goals        on public.scorers(goals desc);

create trigger scorers_updated_at
  before update on public.scorers
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PREDICTIONS
-- ============================================================
create table if not exists public.predictions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  match_id        uuid        not null references public.matches(id) on delete cascade,
  home_score      integer     not null check (home_score >= 0),
  away_score      integer     not null check (away_score >= 0),
  points_awarded  integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_predictions_user_id       on public.predictions(user_id);
create index if not exists idx_predictions_match_id      on public.predictions(match_id);
create index if not exists idx_predictions_points        on public.predictions(points_awarded);

create trigger predictions_updated_at
  before update on public.predictions
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TOURNAMENT PREDICTIONS
-- ============================================================
create table if not exists public.tournament_predictions (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null unique references public.profiles(id) on delete cascade,
  champion_team_id      uuid        references public.teams(id) on delete set null,
  runner_up_team_id     uuid        references public.teams(id) on delete set null,
  third_place_team_id   uuid        references public.teams(id) on delete set null,
  top_scorer_id         uuid        references public.scorers(id) on delete set null,
  champion_points       integer,
  runner_up_points      integer,
  third_place_points    integer,
  top_scorer_points     integer,
  locked                boolean     not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger tournament_predictions_updated_at
  before update on public.tournament_predictions
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- STANDINGS
-- ============================================================
create table if not exists public.standings (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null unique references public.profiles(id) on delete cascade,
  total_points      integer     not null default 0,
  match_points      integer     not null default 0,
  tournament_points integer     not null default 0,
  correct_exact     integer     not null default 0,
  correct_winner    integer     not null default 0,
  predictions_made  integer     not null default 0,
  rank              integer,
  previous_rank     integer,
  updated_at        timestamptz not null default now()
);

create index if not exists idx_standings_total_points on public.standings(total_points desc);

-- Trigger: maak standings rij aan bij nieuw profiel
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.standings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ============================================================
-- POINTS HISTORY
-- ============================================================
create table if not exists public.points_history (
  id                          uuid        primary key default gen_random_uuid(),
  user_id                     uuid        not null references public.profiles(id) on delete cascade,
  match_id                    uuid        references public.matches(id) on delete cascade,
  prediction_id               uuid        references public.predictions(id) on delete cascade,
  tournament_prediction_id    uuid        references public.tournament_predictions(id) on delete cascade,
  points                      integer     not null,
  reason                      text        not null,
  created_at                  timestamptz not null default now()
);

create index if not exists idx_points_history_user_id    on public.points_history(user_id);
create index if not exists idx_points_history_match_id   on public.points_history(match_id);
create index if not exists idx_points_history_created_at on public.points_history(created_at desc);

-- ============================================================
-- SYNC LOGS
-- ============================================================
create table if not exists public.sync_logs (
  id                  uuid        primary key default gen_random_uuid(),
  sync_type           text        not null check (sync_type in ('teams','matches','scores','scorers')),
  status              text        not null check (status in ('running','success','error')),
  records_processed   integer     not null default 0,
  error_message       text,
  started_at          timestamptz not null default now(),
  finished_at         timestamptz
);

create index if not exists idx_sync_logs_type       on public.sync_logs(sync_type);
create index if not exists idx_sync_logs_started_at on public.sync_logs(started_at desc);

-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists public.settings (
  id          uuid        primary key default gen_random_uuid(),
  key         text        not null unique,
  value       jsonb       not null,
  description text,
  updated_by  uuid        references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create trigger settings_updated_at
  before update on public.settings
  for each row execute procedure public.set_updated_at();
