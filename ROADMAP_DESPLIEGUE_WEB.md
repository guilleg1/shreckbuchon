# Roadmap de Despliegue Web (Railway + Supabase + Stripe + Google OAuth)

> Documento centrado **solo en despliegue técnico** y operación de la plataforma.
> Fecha: 2026-02-27
> Estado actual: **Fase 1 implementada a nivel de artefactos técnicos en Shreck**.

## 1) Objetivo y Alcance

### Objetivo
Tener una plataforma e-commerce desplegada, segura y operable en producción con:
- Frontend/backend desplegados en Railway.
- Base de datos y autenticación en Supabase.
- Pagos con Stripe (Checkout + webhooks).
- Login social con Google OAuth vía Supabase Auth.

### Fuera de alcance
- Marketing, pricing, catálogo y estrategia comercial.
- Creatividades/copy de producto.

---

## 2) Arquitectura de Despliegue

- **App Web**: Next.js/Node desplegado en Railway (`staging` y `production`).
- **DB/Auth/Storage**: Supabase (Postgres + Auth + Storage + RLS).
- **Pagos**: Stripe Checkout y Stripe Webhooks contra endpoint backend en Railway.
- **OAuth**: Proveedor Google configurado en Supabase Auth.
- **Observabilidad**: logs centralizados + errores (Sentry) + métricas uptime.
- **CDN/Assets**: estáticos servidos por el framework y/o Storage/CDN.

Flujo principal:
1. Usuario inicia sesión con Google (Supabase Auth).
2. Usuario crea pedido en app.
3. App crea sesión de Stripe Checkout.
4. Stripe confirma pago por webhook firmado.
5. Backend actualiza estado en Postgres y emite confirmación.

---

## 3) Estrategia de Entornos

## Entornos obligatorios
- **Local**: desarrollo en máquina de dev.
- **Staging**: réplica funcional para QA e integración (Railway + Supabase proyecto staging + Stripe test mode).
- **Production**: entorno real con datos y claves live.

## Reglas de promoción
- Todo cambio entra por PR a `main` con checks verdes.
- Deploy automático a staging.
- Smoke test en staging.
- Promote/redeploy versionado a production.
- Rollback inmediato si falla healthcheck o webhooks.

## Naming recomendado
- Railway services: `web-stg`, `web-prod`, `worker-stg`, `worker-prod` (si aplica).
- Supabase projects: `project-stg`, `project-prod`.
- Stripe: cuenta única con separación test/live (o cuentas separadas si necesitáis aislamiento estricto).

---

## 4) Fases de Despliegue (8 semanas)

## Fase 0 (Semana 1): Fundaciones de infraestructura

### Entregables
- Proyectos creados en Railway, Supabase y Stripe.
- Repositorio conectado a Railway.
- Variables de entorno definidas por entorno.
- Dominio principal y subdominio de staging configurados.

### Checklist técnico
- [ ] Railway: servicio web creado y build/start definidos.
- [ ] Supabase: proyecto creado, región definida, backups habilitados.
- [ ] Stripe: claves test/live, endpoint webhook test configurado.
- [ ] DNS: `staging.tudominio.com` y `www.tudominio.com` apuntando correctamente.
- [ ] TLS/HTTPS activo en ambos entornos.

## Fase 1 (Semana 2): Base de datos y migraciones seguras

**Estado:** ✅ Implementación base creada en `Shreck/supabase`.

### Entregables
- Esquema inicial en Supabase con migraciones versionadas.
- Políticas de seguridad (RLS) activas por tabla sensible.
- Seed mínimo para validación de integración.

### Checklist técnico
- [x] Tablas mínimas: `users`, `orders`, `order_items`, `payments`, `webhook_events`.
- [x] Índices para consultas de pedidos y estado de pago.
- [x] RLS activo + políticas explícitas (lectura/escritura por propietario o rol backend).
- [x] Estrategia de migraciones: forward-only + rollback documentado.
- [ ] Pipeline de migración staging antes que producción.

## Fase 2 (Semana 3): Autenticación con Google OAuth

### Entregables
- Login con Google operativo en staging.
- Callback URLs configuradas por entorno.
- Sesiones seguras y refresh token funcionando.

### Checklist técnico
- [ ] Credenciales OAuth de Google (staging/prod).
- [ ] Proveedor Google habilitado en Supabase Auth.
- [ ] Redirect URLs correctas (`/auth/callback`).
- [ ] Manejo de sesión expirado y logout limpio.
- [ ] Prueba de login desde navegador limpio/incógnito.

## Fase 3 (Semana 4): Stripe Checkout + Webhooks robustos

### Entregables
- Checkout funcional en staging (modo test).
- Endpoint webhook verificando firma.
- Persistencia idempotente de eventos Stripe.

### Checklist técnico
- [ ] Endpoint `POST /api/stripe/webhook` sin auth de usuario y con firma validada.
- [ ] Tabla `webhook_events` para evitar doble procesamiento.
- [ ] Eventos mínimos manejados: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
- [ ] Reintentos seguros sin duplicar pedidos.
- [ ] Stripe CLI o dashboard para replay de eventos.

## Fase 4 (Semana 5): CI/CD y calidad de despliegue

### Entregables
- Pipeline con lint/test/build obligatorios.
- Deploy automático a staging y manual gate a prod.
- Smoke tests post-deploy.

### Checklist técnico
- [ ] GitHub Actions (o equivalente) con jobs: `lint`, `test`, `build`.
- [ ] Bloqueo de merge si falla pipeline.
- [ ] Smoke tests de rutas críticas (`/`, `/login`, `/checkout/success`).
- [ ] Health endpoint (`/api/health`) comprobando app + DB.
- [ ] Estrategia de rollback documentada y ensayada.

## Fase 5 (Semana 6): Seguridad y hardening

### Entregables
- Endurecimiento de seguridad aplicado en staging y prod.
- Secret management completo en Railway/Supabase.
- Auditoría básica de exposición y permisos.

### Checklist técnico
- [ ] Secretos solo en gestores de entorno (nunca en repo).
- [ ] CORS estricto por entorno.
- [ ] Rate limiting en endpoints sensibles (auth, checkout, webhook).
- [ ] Headers de seguridad (CSP, HSTS, X-Frame-Options, etc.).
- [ ] Validación server-side de precios/importes (no confiar en cliente).

## Fase 6 (Semana 7): Observabilidad y operación

### Entregables
- Dashboard operativo con métricas y alertas.
- Trazabilidad completa de errores de pago y auth.
- Manual de incidentes (runbook).

### Checklist técnico
- [ ] Error tracking activo (Sentry o similar).
- [ ] Logs estructurados con `request_id` y `user_id` (cuando aplique).
- [ ] Alertas: caída de healthcheck, error rate alto, fallo webhook.
- [ ] Métricas mínimas: latencia p95, errores 5xx, éxito checkout, éxito login OAuth.
- [ ] Runbook con pasos de diagnóstico y rollback.

## Fase 7 (Semana 8): Go-Live controlado

### Entregables
- Producción en live mode (Stripe live + Google OAuth prod).
- Checklist de salida completado.
- Plan de soporte de primera semana.

### Checklist técnico
- [ ] Cambio final de claves test -> live verificado.
- [ ] Webhook live apuntando a dominio productivo.
- [ ] Prueba E2E completa en producción con compra real controlada.
- [ ] Monitoreo reforzado primeras 72h.
- [ ] Freeze de cambios no críticos durante ventana de estabilización.

---

## 5) Variables de Entorno (mínimas)

## Aplicación (Railway)
- `NODE_ENV`
- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo backend seguro)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_OAUTH_CLIENT_ID` (si aplica en backend)
- `GOOGLE_OAUTH_CLIENT_SECRET` (si aplica en backend)
- `SENTRY_DSN` (opcional recomendado)

## Reglas
- No reutilizar secretos entre staging y prod.
- Rotación trimestral o tras incidente.
- Registro de alta/baja de secretos por responsable.

---

## 6) Criterios de Aceptación por Fase

Se considera fase completada cuando:
- Todos los checkboxes de fase están cerrados.
- Existe evidencia (capturas/logs/enlaces de ejecución).
- No hay bloqueantes P0/P1 abiertos.
- Se actualiza este documento con fecha y responsable.

---

## 7) Riesgos Técnicos y Mitigaciones

- **Webhook duplicado o fuera de orden**
  - Mitigar con idempotencia por `event_id` y estado transaccional.
- **Desfase de configuración entre entornos**
  - Mitigar con IaC ligero o checklist de paridad.
- **Errores OAuth por redirect URI**
  - Mitigar con matriz de URIs por entorno y smoke test automático.
- **Fallo en deploy crítico**
  - Mitigar con rollback probado + release tags.
- **Exposición de secretos**
  - Mitigar con escaneo de secretos y rotación inmediata.

---

## 8) Definición de “Producción Lista” (Production Ready)

- Login Google estable en desktop/móvil.
- Checkout Stripe live confirmado end-to-end.
- Webhooks con tasa de éxito > 99%.
- Error rate 5xx bajo umbral acordado.
- Backups y restauración verificados.
- Alertas activas con responsable on-call.
- Runbook accesible para todo el equipo técnico.

---

## 9) Operación Continua (post go-live)

- Ventana semanal de mantenimiento y revisión de incidentes.
- Revisión quincenal de seguridad (dependencias, secretos, permisos).
- Ensayo mensual de rollback y restauración de backup.
- Control de costes Railway/Supabase/Stripe con alertas de presupuesto.

---

## 10) Plantilla de Estado Semanal

- Semana:
- Fase actual:
- Entregables cerrados:
- Bloqueos activos:
- Riesgos nuevos:
- Decisiones tomadas:
- Responsable técnico:
- Próximo hito:
