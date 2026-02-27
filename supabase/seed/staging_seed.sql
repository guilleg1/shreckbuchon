begin;

-- Seed mínimo de soporte para integración en staging.
-- Los usuarios reales se crean vía Supabase Auth; este archivo no inserta auth.users.

insert into public.webhook_events (provider, provider_event_id, event_type, payload, processed)
values
  ('stripe', 'evt_seed_001', 'checkout.session.completed', '{"seed": true}'::jsonb, true)
on conflict (provider, provider_event_id) do nothing;

commit;
