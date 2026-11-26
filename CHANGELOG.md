# 📝 Changelog

Todos los cambios importantes del proyecto.

[⬅️ Volver al README](./README.md)

---
## ✨ [1.1.0] - 2026-11-26

### ✨ Añadido

- 🏷️ El asistente muestra la versión instalada de la app.
- 🔗 Enlace al repositorio de GitHub dentro del asistente.

---

## 🚀 [1.0.0] - Lanzamiento inicial

### ✨ Añadido

- 🧮 Calculadora de bonos con B-O, VE, NPS y NSR.
- 🎯 Tope máximo del 100% para B-O y VE.
- 🚫 Anulación del bono (S/ 0) cuando las ausencias superan el límite.
- 🗂️ Historial local guardado en `localStorage`.
- ✏️ Edición de registros existentes.
- 🗑️ Eliminación de registros con swipe.
- 📊 Dashboard de KPIs con gráficos de barras y líneas (Chart.js).
- 📥 Exportación e importación de archivos Excel (SheetJS).
- 🎓 Asistente con glosario y tutorial interactivo.
- 📴 Funcionamiento offline con Service Worker y Manifest.
- 📲 Instalación como PWA en Android y PC.

### 🏗️ Arquitectura

- 🎮 `app.js` como controlador del DOM.
- 🧠 `math.js` con la lógica de negocio.
- 🎓 `tutorial.js` para el onboarding.

---

> [!NOTE]
> El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado [SemVer](https://semver.org/lang/es/).