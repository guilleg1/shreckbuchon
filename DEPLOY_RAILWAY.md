# Deploy en Railway (Shreck)

## Requisitos
- Repositorio subido a GitHub.
- Cuenta de Railway conectada a GitHub.

## Configuración ya incluida en este proyecto
- Servidor Node para servir `web/` en `server.js`.
- Script de arranque en `package.json` (`npm start`).
- Healthcheck en `/api/health`.
- Configuración Railway en `railway.json`.

## Pasos de despliegue
1. En Railway, crear **New Project** > **Deploy from GitHub repo**.
2. Seleccionar el repositorio y rama.
3. Railway detectará Node y usará `npm start`.
4. Esperar a que termine el primer deploy.
5. Verificar endpoint de salud: `https://<tu-dominio>.up.railway.app/api/health`.
6. Abrir la web en la URL pública.

## Variables de entorno
No se requieren variables para esta versión estática.

## Desarrollo local
- Desde la carpeta raíz del proyecto:
  - `npm start`
- Abrir `http://localhost:3000`.

## Siguientes pasos sugeridos
- Conectar el botón de checkout a Stripe Checkout real.
- Añadir cabeceras de seguridad y CSP para producción.
- Separar catálogo a `products.json` o API backend.
