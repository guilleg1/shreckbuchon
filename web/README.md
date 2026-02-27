# Web UI — Fase Estética (Tailwind)

Landing visual inicial para `Shreck`, enfocada en look & feel único:
- Maquetación con Tailwind CSS (CDN)
- Paleta personalizada neón ácido + púrpura
- Animaciones suaves de entrada y efecto tilt en cards
- Secciones preparadas para integrar catálogo real, auth y checkout

## Ejecutar local

Opción rápida con VS Code:
- Abrir `web/index.html` en navegador.

Opción recomendada (servidor local):
- Desde carpeta `Shreck/web`, ejecutar:
  - `python -m http.server 5500`
- Abrir:
  - `http://localhost:5500`

## Nota técnica
- `index.html` incluye `tailwindcss` por CDN y `tailwind.config` inline para prototipado rápido.
