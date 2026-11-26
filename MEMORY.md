# 🧠 Memoria del Proyecto (Contexto para Desarrolladores)

## 🏗️ Arquitectura del Código
El proyecto usa **Vanilla JS** con **ES Modules**. No hay frameworks pesados.

*   `index.html`: Contiene la estructura de las 3 vistas (Calculadora, Historial, KPIs) y los Bottom Sheets.
*   `styles.css`: Variables CSS en `:root`. Diseño Mobile-First con un contenedor `app-wrapper` que simula un celular en PC.
*   `math.js`: **(NO TOCAR A LA LIGERA)**. Contiene la función pura `calcularIncentivos(datos)`. Aquí viven las tablas de Premio Base y Multiplicadores.
*   `tutorial.js`: Contiene el motor del tutorial. Recibe las funciones de UI como parámetros para no acoplarse al `app.js`.
*   `app.js`: El "pegamento". Maneja el DOM, el estado del `localStorage`, la lógica de Excel y conecta con `math.js` y `tutorial.js`.

## ⚠️ Reglas de Negocio Críticas (Math.js)
1.  **Topes:** El cálculo de B-O y VE usa `Math.min(valor, 100)`. Esto significa que si el usuario ingresa 114%, el sistema calcula con 100%.
2.  **Ausencias:** Si las ausencias superan el límite (3 días normal, 2 días Peak Time), la función retorna un objeto con `{ error: "..." }` y el bono es 0.
3.  **El Multiplicador:** Afecta a TODO el bono Maestrazo. Si la frecuencia B-O es >= 110%, el multiplicador es 1.2.
4.  **El Ejemplo del PDF:** El documento original tiene un error tipográfico (dice 107% pero usa 1.1). En la app, el cálculo es exacto a las tablas: si es 107%, el multiplicador es 1.15.

## 🛠️ ¿Cómo actualizar la App?
1.  Si Sodimac cambia los montos de los bonos, **solo edita `math.js`** (las funciones `obtenerPremioBase` y `obtenerMultiplicador`).
2.  Si agregas una nueva vista, debes agregarla en el HTML, darle estilo y agregar la lógica de cambio de pestaña en `app.js`.

## 💾 Base de Datos Local
Los datos se guardan en `localStorage` bajo la clave `maestrazo_historial` como un string JSON.
El objeto que se guarda tiene esta estructura:
```json
{
  "id": 171234567890,
  "fecha": "2024-05",
  "datos": { ...inputs del usuario },
  "resultado": { ...cálculos devueltos por math.js }
}