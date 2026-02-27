# Fase 1 — Base de Datos y Migraciones (Supabase)

Este documento ejecuta la Fase 1 del roadmap en el proyecto `Shreck`.

## Entregables incluidos
- Migración inicial de esquema: `supabase/migrations/20260227_001_init_schema.sql`
- Migración de RLS/policies: `supabase/migrations/20260227_002_rls_policies.sql`
- Seed mínimo de staging: `supabase/seed/staging_seed.sql`

## Requisitos
- CLI de Supabase instalada.
- Proyecto Supabase `staging` y `production` ya creados.
- Variables de entorno configuradas en shell o gestor seguro.

## Flujo recomendado (staging primero)
1. Vincular proyecto staging:
   - `supabase link --project-ref <STAGING_PROJECT_REF>`
2. Aplicar migraciones:
   - `supabase db push`
3. Aplicar seed (opcional):
   - `psql "$SUPABASE_DB_URL_STAGING" -f supabase/seed/staging_seed.sql`
4. Validar tablas/policies desde dashboard SQL editor.

## Promoción a producción
1. Repetir link con proyecto prod.
2. Ejecutar `supabase db push`.
3. No aplicar seed de staging en producción.

## Validación mínima
- Existen tablas: `users`, `orders`, `order_items`, `payments`, `webhook_events`.
- RLS habilitado en todas las tablas.
- Índices creados sin error.
- Policies de lectura por propietario funcionan con usuario autenticado.

## Notas de seguridad
- `webhook_events` no expone acceso al cliente.
- Escritura operacional de pagos/webhooks debe hacerse con service role en backend.
- No usar service role key en frontend bajo ningún caso.
