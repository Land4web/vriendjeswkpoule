-- ============================================================
-- WK Poule 2026 — Row Level Security policies
-- ============================================================

-- Helper functie: is de huidige gebruiker admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

-- Iedereen die ingelogd is mag alle actieve profielen zien
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (is_active = true);

-- Eigen profiel altijd zichtbaar (ook als inactief)
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Alleen eigen profiel bijwerken
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Admin: alle profielen bewerken
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- Profielen worden aangemaakt via trigger (service role), niet door gebruikers zelf
create policy "profiles_insert_service"
  on public.profiles for insert
  to service_role
  with check (true);

-- ============================================================
-- INVITATIONS
-- ============================================================
alter table public.invitations enable row level security;

-- Admin: alles lezen en aanmaken
create policy "invitations_admin_all"
  on public.invitations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Anoniem: eigen token lezen (voor registratiepagina)
create policy "invitations_select_by_token"
  on public.invitations for select
  to anon, authenticated
  using (true);

-- Service role: alles
create policy "invitations_service_all"
  on public.invitations for all
  to service_role
  with check (true);

-- ============================================================
-- TEAMS
-- ============================================================
alter table public.teams enable row level security;

-- Iedereen mag teams zien
create policy "teams_select_all"
  on public.teams for select
  to authenticated, anon
  using (true);

-- Alleen service role mag teams schrijven (via sync)
create policy "teams_write_service"
  on public.teams for all
  to service_role
  with check (true);

-- ============================================================
-- MATCHES
-- ============================================================
alter table public.matches enable row level security;

-- Iedereen mag wedstrijden zien
create policy "matches_select_all"
  on public.matches for select
  to authenticated, anon
  using (true);

-- Alleen service role mag wedstrijden schrijven (via sync)
create policy "matches_write_service"
  on public.matches for all
  to service_role
  with check (true);

-- Admin mag ook scores corrigeren
create policy "matches_update_admin"
  on public.matches for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- SCORERS
-- ============================================================
alter table public.scorers enable row level security;

-- Iedereen mag topscorers zien
create policy "scorers_select_all"
  on public.scorers for select
  to authenticated, anon
  using (true);

-- Alleen service role schrijft topscorers
create policy "scorers_write_service"
  on public.scorers for all
  to service_role
  with check (true);

-- ============================================================
-- PREDICTIONS
-- ============================================================
alter table public.predictions enable row level security;

-- Eigen voorspellingen altijd zien
create policy "predictions_select_own"
  on public.predictions for select
  to authenticated
  using (user_id = auth.uid());

-- Andermans voorspellingen zien NADAT de wedstrijd gestart is
create policy "predictions_select_others_after_kickoff"
  on public.predictions for select
  to authenticated
  using (
    user_id != auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.scheduled_at <= now()
    )
  );

-- Voorspelling invoeren: alleen eigen, alleen als wedstrijd nog niet begonnen
create policy "predictions_insert_own"
  on public.predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.scheduled_at > now()
      and m.status in ('SCHEDULED', 'TIMED')
    )
  );

-- Voorspelling wijzigen: alleen eigen, alleen als wedstrijd nog niet begonnen
create policy "predictions_update_own"
  on public.predictions for update
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and m.scheduled_at > now()
      and m.status in ('SCHEDULED', 'TIMED')
    )
  );

-- Service role: alles (voor puntentelling)
create policy "predictions_service_all"
  on public.predictions for all
  to service_role
  with check (true);

-- Admin: alles
create policy "predictions_admin_all"
  on public.predictions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- TOURNAMENT PREDICTIONS
-- ============================================================
alter table public.tournament_predictions enable row level security;

-- Eigen toernooivoorspelling altijd zien
create policy "tournament_predictions_select_own"
  on public.tournament_predictions for select
  to authenticated
  using (user_id = auth.uid());

-- Andermans toernooivoorspellingen NA deadline (locked = true)
create policy "tournament_predictions_select_others_after_deadline"
  on public.tournament_predictions for select
  to authenticated
  using (
    user_id != auth.uid()
    and locked = true
  );

-- Aanmaken: eigen, alleen als nog niet vergrendeld
create policy "tournament_predictions_insert_own"
  on public.tournament_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.tournament_predictions tp
      where tp.user_id = auth.uid() and tp.locked = true
    )
  );

-- Wijzigen: eigen, alleen als nog niet vergrendeld
create policy "tournament_predictions_update_own"
  on public.tournament_predictions for update
  to authenticated
  using (user_id = auth.uid() and locked = false)
  with check (user_id = auth.uid() and locked = false);

-- Service role: alles (voor vergrendelen en puntentelling)
create policy "tournament_predictions_service_all"
  on public.tournament_predictions for all
  to service_role
  with check (true);

-- Admin: alles
create policy "tournament_predictions_admin_all"
  on public.tournament_predictions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- STANDINGS
-- ============================================================
alter table public.standings enable row level security;

-- Iedereen (ingelogd) mag ranglijst zien
create policy "standings_select_authenticated"
  on public.standings for select
  to authenticated
  using (true);

-- Alleen service role schrijft standings
create policy "standings_write_service"
  on public.standings for all
  to service_role
  with check (true);

-- ============================================================
-- POINTS HISTORY
-- ============================================================
alter table public.points_history enable row level security;

-- Iedereen (ingelogd) mag puntenhistorie zien
create policy "points_history_select_authenticated"
  on public.points_history for select
  to authenticated
  using (true);

-- Alleen service role schrijft puntenhistorie
create policy "points_history_write_service"
  on public.points_history for all
  to service_role
  with check (true);

-- ============================================================
-- SYNC LOGS
-- ============================================================
alter table public.sync_logs enable row level security;

-- Alleen admins mogen sync logs zien
create policy "sync_logs_select_admin"
  on public.sync_logs for select
  to authenticated
  using (public.is_admin());

-- Alleen service role schrijft sync logs
create policy "sync_logs_write_service"
  on public.sync_logs for all
  to service_role
  with check (true);

-- ============================================================
-- SETTINGS
-- ============================================================
alter table public.settings enable row level security;

-- Admins mogen settings lezen
create policy "settings_select_admin"
  on public.settings for select
  to authenticated
  using (public.is_admin());

-- Service role leest ook settings (voor sync en puntentelling)
create policy "settings_select_service"
  on public.settings for select
  to service_role
  using (true);

-- Admins en service role mogen settings schrijven
create policy "settings_write_admin"
  on public.settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "settings_write_service"
  on public.settings for all
  to service_role
  with check (true);
