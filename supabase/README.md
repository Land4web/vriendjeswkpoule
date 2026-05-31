# Supabase Setup

## Database migraties uitvoeren

1. Open je Supabase project: https://supabase.com/dashboard
2. Ga naar **SQL Editor**
3. Voer de migraties één voor één uit in volgorde:

```
migrations/001_initial_schema.sql   ← Tabellen, triggers, indexen
migrations/002_rls_policies.sql     ← Row Level Security
migrations/003_seed_settings.sql    ← Standaard puntensysteem
```

## Admin account aanmaken

Na registratie van het eerste account:

```sql
update public.profiles
set role = 'admin'
where username = 'jouw-gebruikersnaam';
```

## Supabase Auth instellingen

In Supabase Dashboard → Authentication → Providers:
- E-mail: ingeschakeld
- Confirm email: **UIT** (want wij sturen zelf de uitnodiging)
- Minimum password length: 8

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: https://jouw-app.vercel.app
- Redirect URLs: https://jouw-app.vercel.app/wachtwoord-reset
