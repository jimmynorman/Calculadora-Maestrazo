<div align="center">

# 🧮 Calculadora Maestrazo

**Calcula, proyecta y analiza tus incentivos de venta Sodimac. Rápido, offline y sin complicaciones.**

<br>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)

<br>

[🌐 **Abrir la App en Producción**](https://jimmynorman.github.io/Calculadora-Maestrazo/)

</div>

---

> [!TIP]
> **TL;DR:** Una PWA para que los asesores Maestrazo de Sodimac calculen sus bonos exactos.
> Guarda tu historial, mira tus KPIs en gráficos y úsala 100% sin internet.

---

## 📸 Flujo Visual

<div align="center">

<img src="./images/formulario.jpg" alt="Formulario de ingreso de datos" width="300">

*📝 Paso 1: ingresa tus porcentajes en el formulario.*

<br>

<img src="./images/detalle.jpg" alt="Desglose del cálculo con montos" width="300">

*💰 Paso 2: mira el desglose de tu bono con montos exactos.*

<br>

<img src="./images/editar.jpg" alt="Pantalla para editar un registro" width="300">

*✏️ Paso 3: corrige cualquier registro cuando lo necesites.*

</div>

---

## ✨ Características Principales

| Módulo | Descripción | Icono |
|:-------|:------------|:-----:|
| **Calculadora** | Cálculo exacto de bonos con B-O, VE, NPS y NSR. | 🧮 |
| **Historial** | Guarda tus meses en el dispositivo. Edita o elimina con un deslizamiento. | 🗂️ |
| **Dashboard de KPIs** | Gráficos de barras y líneas para ver tu evolución. | 📊 |
| **Excel** | Exporta e importa tus datos con archivos `.xlsx`. | 📥 |
| **Asistente** | Glosario y tutoriales dentro de la app. | 🎓 |
| **Modo Offline** | Funciona sin conexión gracias al Service Worker. | 📴 |

---

## 🚀 Instalación Rápida

1. 🌐 Abre la [app en Chrome](https://jimmynorman.github.io/Calculadora-Maestrazo/) desde tu Android o PC.

2. 📲 Toca el ícono de **Instalar** en la barra de direcciones (PC) o en el menú ⋮ → *Instalar aplicación* (Android).

3. ✅ Confirma la instalación y abre la app desde tu pantalla de inicio.

> [!NOTE]
> Después de instalarla, la app funciona sin internet.

---

## 🏗️ Arquitectura del Software

El código está dividido en **3 módulos** con responsabilidades claras:

- 🎮 **`app.js`** → Controlador del DOM y orquestador principal.
- 🧠 **`math.js`** → Lógica de negocio y fórmulas de bonos.
- 🎓 **`tutorial.js`** → Onboarding interactivo para nuevos usuarios.

```mermaid
graph LR
    A["app.js<br/>Controlador DOM"] -->|"usa"| B["math.js<br/>Logica de negocio"]
    A -->|"inicia"| C["tutorial.js<br/>Onboarding"]
    A -->|"renderiza"| D["Chart.js<br/>Graficos"]
    A -->|"exporta e importa"| E["Excel<br/>SheetJS"]
    A -->|"guarda"| F["LocalStorage<br/>Historial"]
```

> [!TIP]
> Toda la lógica de cálculo vive en `math.js`. Si cambian las reglas, solo tocas ese archivo.

---

## 📚 Documentación Adicional

- 📖 [**Manual de Usuario**](./MANUAL.md) → Guía paso a paso de la app.
- 🗺️ [**Roadmap**](./ROADMAP.md) → Qué viene en el futuro.
- 📝 [**Changelog**](./CHANGELOG.md) → Historial de cambios por versión.
- 🧠 [**Memoria del Proyecto**](./MEMORY.md) → Decisiones y contexto técnico.

---

## 🧠 Reglas de Negocio

> [!IMPORTANT]
> 🎯 El cálculo de **B-O** y **VE** tiene un **tope máximo del 100%**.
>
> 🚫 Si las **ausencias superan el límite**, el bono se anula (**S/ 0**).

---

<div align="center">

### 💙 Hecho con cariño para los Maestrazos

Si te sirvió, regálale una ⭐ al repositorio.

**¡Muchos éxitos con tus ventas!** 🚀

</div>