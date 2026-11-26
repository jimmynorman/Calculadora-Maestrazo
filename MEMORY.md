# 🧠 Memoria del Proyecto

Documento técnico para futuros desarrolladores.

[⬅️ Volver al README](./README.md)

---

## 🏗️ Arquitectura de archivos

| Archivo | Rol | Cuidado |
|:--------|:----|:-------:|
| `app.js` | Controla el DOM, eventos y gráficos. | 🟡 |
| `math.js` | Lógica de negocio y fórmulas. | 🔴 |
| `tutorial.js` | Onboarding interactivo. | 🟢 |
| Service Worker | Cache para uso offline. | 🟡 |
| Manifest | Datos de instalación de la PWA. | 🟢 |

---

## 🔴 Sobre `math.js`

> [!WARNING]
> **No toques `math.js` a la ligera.**
> Un cambio mínimo altera el dinero que ve el asesor.

Reglas que debes respetar:

- 🎯 **B-O** y **VE** tienen un tope máximo del **100%**.
- 🚫 Si las ausencias superan el límite, el bono es **S/ 0**.
- 🧪 Prueba cada cambio con casos conocidos antes de publicar.

> [!TIP]
> Mantén esta lógica pura: sin acceso al DOM ni a `localStorage`.

---

## 🎮 Sobre `app.js`

Conecta la interfaz con `math.js`.

Recibe los datos del formulario, llama a las funciones de cálculo y pinta el resultado.

También maneja historial, edición, swipe, Excel y gráficos.

---

## 🎓 Sobre `tutorial.js`

Guía al usuario nuevo por la app.

Es independiente de la lógica de cálculo. Puedes modificarlo con bajo riesgo.

---

## 💾 Base de datos local (`localStorage`)

Los datos viven **solo en el navegador del usuario**.

No hay servidor ni base de datos remota.

> [!IMPORTANT]
> Si el usuario borra los datos del navegador, pierde su historial.
> Por eso existe la exportación a Excel.

### 📦 Ejemplo del objeto JSON

> [!NOTE]
> Este es un ejemplo ilustrativo. Ajusta los nombres de campos y la clave de `localStorage` a los reales de `app.js`.

```json
{
  "id": "1700000000000",
  "mes": "2026-11",
  "bo": 95,
  "ve": 100,
  "nps": 80,
  "nsr": 90,
  "ausencias": 0,
  "bono": 0
}
```

El historial completo se guarda como una lista (*array*) de objetos como este.

---

## 📴 Modo offline

- 🔧 El Service Worker guarda los archivos en cache.
- 🔄 Al cambiar archivos, sube la versión del cache para que los usuarios reciban la actualización.

> [!WARNING]
> Si no actualizas la versión del cache, los usuarios seguirán viendo la versión vieja.

---

## 📚 Librerías externas

- 📊 **Chart.js** → gráficos de barras y líneas.
- 📥 **SheetJS** → exportar e importar Excel.

---

## ✅ Checklist antes de publicar

- [ ] 🧪 Probé los cálculos con casos conocidos.
- [ ] 🔄 Subí la versión del cache del Service Worker.
- [ ] 📝 Actualicé el [CHANGELOG](./CHANGELOG.md).
- [ ] 📴 Probé la app sin internet.
- [ ] 🏷️ Actualicé `APP_VERSION` en `app.js` (igual que en el [CHANGELOG](./CHANGELOG.md)).