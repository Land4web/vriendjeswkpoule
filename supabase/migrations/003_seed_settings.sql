-- ============================================================
-- WK Poule 2026 — Standaard instellingen (seed)
-- ============================================================

insert into public.settings (key, value, description) values
  ('points_exact',                  '{"value": 5}',                          'Punten voor exacte uitslag'),
  ('points_winner',                 '{"value": 3}',                          'Punten voor juiste winnaar of gelijkspel'),
  ('points_champion',               '{"value": 15}',                         'Punten voor juiste wereldkampioen'),
  ('points_runner_up',              '{"value": 10}',                         'Punten voor juiste verliezend finalist'),
  ('points_third_place',            '{"value": 5}',                          'Punten voor juiste derde plek'),
  ('points_top_scorer',             '{"value": 10}',                         'Punten voor juiste topscorer'),
  ('tournament_prediction_deadline','{"value": "2026-06-11T11:00:00Z"}',     'Deadline toernooivoorspellingen (voor eerste WK-wedstrijd)'),
  ('tournament_name',               '{"value": "FIFA World Cup 2026"}',      'Naam van het toernooi'),
  ('api_competition_id',            '{"value": "2000"}',                     'football-data.org competition ID voor WK')
on conflict (key) do nothing;
