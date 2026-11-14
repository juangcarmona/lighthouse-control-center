# Reproducir la auditoría

Los scripts fueron ejecutados desde un directorio temporal separado; sus rutas absolutas reflejan ese directorio de la sesión. Ajustar `root`, `origin` y la ruta del estado privado antes de repetir. No se ha incluido el estado de sesión.

Dependencias de auditoría: `playwright@1.64.1`, `@axe-core/playwright@4.14.0`, Chromium. No se modificaron dependencias del repositorio.

- `audit.mjs`: capturas de nueve rutas y controles Axe, sin escrituras de origen.
- `flows.mjs`: búsqueda, board, lector, borrador sin envío, navegación, demora de lecturas y 503 simulado.
- `secondary-flows.mjs`: carga adicional, lectura de evidencia, Health/proyecto/run y foco inicial.
- `render-proposals.mjs`: servidor local temporal y checks del HTML ilustrativo.

Para abrir las propuestas no hace falta autenticación: servir este directorio con un servidor HTTP local y abrir `index.html`. El `sessionStorage` de la demo solo guarda el texto que escriba su usuario y no llama al servicio. La aplicación real requiere una política por ámbito y limpieza que esta demo no acredita.

Los JSON son los recibos de la ejecución retenida; no hay trazas ni credenciales. Los valores vivos pueden cambiar entre pantallas. Los scripts no son tests de aceptación de operaciones reales.
