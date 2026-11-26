<div align="center">

<img src="./images/logo.png" alt="Logo Maestrazo" width="120" />

# 🧮 Calculadora Maestrazo

**La herramienta definitiva para calcular, proyectar y analizar tus incentivos de venta.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 🚀 ¿Qué es esto?
Una Aplicación Web Progresiva (PWA) diseñada **exclusivamente** para los asesores "Maestrazo" de Sodimac. Permite calcular el bono mensual de forma transparente, visualizar el desglose exacto y llevar un historial proyectado de ganancias.

> [!TIP]
> **Diseño "TDAH-Friendly":** Interfaz libre de distracciones, tutoriales paso a paso, gráficos claros y feedback visual inmediato. ¡No necesitas leer un manual de 50 páginas para usarla!

<div align="center">
  <img src="./images/calculadora.png" alt="Pantalla Calculadora" width="250" style="margin: 10px;" />
  <img src="./images/historial.png" alt="Pantalla Historial" width="250" style="margin: 10px;" />
  <img src="./images/kpis.png" alt="Pantalla KPIs" width="250" style="margin: 10px;" />
</div>

## ✨ Características Principales
| Módulo | Descripción | Icono |
| :--- | :--- | :---: |
| **Calculadora** | Lógica exacta basada en el PDF oficial (B-O, VE, NPS, NSR). | 🧮 |
| **Historial** | Guarda tus meses. Edita si te equivocaste o desliza para eliminar. | 📋 |
| **KPIs y Gráficos** | Visualiza tu promedio mensual, tu mejor mes y tu evolución. | 📈 |
| **Exportación Excel** | Descarga tu historial a `.xlsx` o impórtalo al celular. | 📤 |
| **Modo Offline** | Úsala en el almacén sin internet. Los datos son 100% privados. | ✈️ |

---

## 🏗️ Arquitectura del Software
El proyecto está diseñado con **Separación de Responsabilidades** (Vanilla JS). No hay frameworks pesados.

```mermaid
graph TD
    A[index.html] --> B[app.js]
    B -->|Importa| C[math.js]
    B -->|Importa| D[tutorial.js]
    B --> E[(localStorage)]
    B --> F[SheetJS - Excel]
    B --> G[Chart.js - Gráficos]
    
    style A fill:#0072ce,color:#fff
    style B fill:#f39c12,color:#fff
    style C fill:#e31837,color:#fff
    style D fill:#555,color:#fff
    
📱 Instalación Rápida (Android / PC)
Abre la app en Chrome: Ir a la Calculadora

Abre el menú de Chrome (los 3 puntos ⋮).

Selecciona "Instalar aplicación" o "Agregar a la pantalla principal".

¡Listo! Se abrirá a pantalla completa como una app nativa.

📚 Documentación Adicional
📖 Manual de Usuario (Wiki) - Guía paso a paso + Anexo técnico.

🗺️ Roadmap - ¿Qué sigue en el futuro?

📝 Changelog - Historial de versiones.

🧠 Memoria del Proyecto - Arquitectura técnica para desarrolladores.

<div align="center"> Hecho con ❤️ para el equipo Maestrazo. </div> ```