// app.js
import { calcularIncentivos } from './math.js';
import { initTutorial } from './tutorial.js';

// Versión de la app. Actualizar en cada publicación (junto con el CHANGELOG).
const APP_VERSION = '1.1.0';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lógica de Pestañas (Tab Bar) ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');

    function cambiarPestana(targetId) {
        tabBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        if (btn) btn.classList.add('active');
        document.getElementById(targetId).classList.add('active');
        
        if (targetId === 'view-historial') renderHistorial();
        if (targetId === 'view-kpis') renderKPIs();
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarPestana(btn.getAttribute('data-target'));
        });
    });

    // --- 2. Lógica de los Bottom Sheets ---
    const backdrop = document.getElementById('backdrop');
    const sheetForm = document.getElementById('bottom-sheet-form');
    const sheetDetalle = document.getElementById('bottom-sheet-detalle');
    const sheetAsistente = document.getElementById('bottom-sheet-asistente');
    const snackbar = document.getElementById('snackbar');
    const snackbarText = document.getElementById('snackbar-text');
    const snackbarAction = document.getElementById('snackbar-action');
    
    let idEditando = null; 
    const formTitulo = sheetForm.querySelector('.sheet-header h2');
    const btnSubmitForm = sheetForm.querySelector('#btn-submit-form');

    function abrirSheet(sheet) {
        sheet.classList.add('active');
        backdrop.classList.add('active');
    }
    function cerrarSheets() {
        sheetForm.classList.remove('active');
        sheetDetalle.classList.remove('active');
        sheetAsistente.classList.remove('active');
        backdrop.classList.remove('active');
    }

    document.getElementById('btn-nuevo-calculo').addEventListener('click', () => {
        idEditando = null;
        formTitulo.textContent = "Ingresar Datos del Mes";
        btnSubmitForm.textContent = "Calcular y Guardar";
        document.getElementById('form-calculo').reset();
        sheetForm.querySelector('.sheet-body').scrollTop = 0;
        abrirSheet(sheetForm);
    });

    document.getElementById('btn-asistente').addEventListener('click', () => abrirSheet(sheetAsistente));
    document.getElementById('btn-cerrar-form').addEventListener('click', cerrarSheets);
    document.getElementById('btn-cerrar-detalle').addEventListener('click', cerrarSheets);
    document.getElementById('btn-cerrar-asistente').addEventListener('click', cerrarSheets);
    backdrop.addEventListener('click', cerrarSheets);

    // Función de Snackbar modificada para soportar el botón de actualizar
    let snackbarTimeout;
    function mostrarSnackbar(mensaje, esActualizacion = false) {
        clearTimeout(snackbarTimeout);
        snackbarText.textContent = mensaje;
        
        if (esActualizacion) {
            snackbarAction.style.display = 'block';
            snackbarAction.onclick = () => {
                window.location.reload(); // Recarga la app con la nueva versión
            };
        } else {
            snackbarAction.style.display = 'none';
        }

        snackbar.classList.add('show');
        
        // Si es una actualización, no ocultar el mensaje tan rápido
        const tiempo = esActualizacion ? 15000 : 3000;
        snackbarTimeout = setTimeout(() => snackbar.classList.remove('show'), tiempo);
    }

    // --- 3. Base de Datos Local (Historial) ---
    let historial = JSON.parse(localStorage.getItem('maestrazo_historial')) || [];

    function guardarEnHistorial(datos, resultado, idExistente = null) {
        if (idExistente) {
            const index = historial.findIndex(reg => reg.id === idExistente);
            if (index !== -1) {
                historial[index].fecha = datos.mes;
                historial[index].datos = datos;
                historial[index].resultado = resultado;
                mostrarSnackbar("Registro actualizado correctamente");
            }
        } else {
            const nuevoRegistro = { id: Date.now(), fecha: datos.mes, datos: datos, resultado: resultado };
            historial.unshift(nuevoRegistro);
            mostrarSnackbar("Cálculo guardado correctamente");
        }
        localStorage.setItem('maestrazo_historial', JSON.stringify(historial));
        renderHistorial(); 
        
        if (document.getElementById('view-kpis').classList.contains('active')) {
            renderKPIs();
        }
    }

    function renderHistorial() {
        const lista = document.getElementById('historial-lista');
        const vacio = document.getElementById('historial-vacio');
        
        if (historial.length === 0) {
            lista.innerHTML = ''; vacio.classList.remove('hidden'); return;
        }

        vacio.classList.add('hidden');
        lista.innerHTML = '';
        historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        historial.forEach(reg => {
            const [year, month] = reg.fecha.split('-');
            const fechaObj = new Date(year, month - 1);
            const fechaStr = fechaObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

            const wrapper = document.createElement('div');
            wrapper.className = 'history-item-wrapper';
            wrapper.innerHTML = `
                <button class="btn-delete-swipe" data-id="${reg.id}">Eliminar</button>
                <div class="history-card" data-id="${reg.id}">
                    <div class="history-info">
                        <h3>${fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)}</h3>
                        <p>Cumplimiento: ${reg.resultado.ponderado.toFixed(2)}%</p>
                    </div>
                    <div class="history-amount">S/ ${reg.resultado.totalMes.toFixed(2)}</div>
                </div>
            `;
            lista.appendChild(wrapper);
        });

        document.querySelectorAll('.history-card').forEach(card => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let hasSwiped = false;

            card.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                currentX = startX;
                isDragging = true;
                hasSwiped = false;
            }, {passive: true});

            card.addEventListener('touchmove', e => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                if (Math.abs(startX - currentX) > 10) hasSwiped = true;
            }, {passive: true});

            card.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                let diff = startX - currentX;
                if (diff > 50) card.classList.add('swiped');
                else if (diff < -50) card.classList.remove('swiped');
            });

            card.addEventListener('mousedown', e => {
                startX = e.clientX;
                currentX = startX;
                isDragging = true;
                hasSwiped = false;
            });

            card.addEventListener('mousemove', e => {
                if (!isDragging) return;
                currentX = e.clientX;
                if (Math.abs(startX - currentX) > 10) hasSwiped = true;
            });

            card.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                let diff = startX - currentX;
                if (diff > 50) card.classList.add('swiped');
                else if (diff < -50) card.classList.remove('swiped');
            });
            card.addEventListener('mouseleave', () => { isDragging = false; });

            card.addEventListener('click', () => {
                if (hasSwiped) { hasSwiped = false; return; }
                if (card.classList.contains('swiped')) {
                    card.classList.remove('swiped');
                } else {
                    abrirDetalle(parseInt(card.getAttribute('data-id')));
                }
            });
        });

        document.querySelectorAll('.btn-delete-swipe').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                historial = historial.filter(reg => reg.id !== id);
                localStorage.setItem('maestrazo_historial', JSON.stringify(historial));
                renderHistorial();
                mostrarSnackbar("Registro eliminado");
                if (document.getElementById('view-kpis').classList.contains('active')) renderKPIs();
            });
        });
    }

    function abrirDetalle(id) {
        const reg = historial.find(r => r.id === id);
        if (!reg) return;

        const [year, month] = reg.fecha.split('-');
        const fechaObj = new Date(year, month - 1);
        const fechaStr = fechaObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        document.getElementById('detalle-titulo').textContent = `Detalle: ${fechaStr}`;
        document.getElementById('detalle-contenido').innerHTML = `
            <div class="detalle-item"><span>Incentivo Tienda:</span> <strong>S/ ${reg.resultado.totalTienda.toFixed(2)}</strong></div>
            <div class="detalle-item sub-item"><span>Plan / NPS / NSR:</span> <span>${reg.resultado.bonoPlanTienda} / ${reg.resultado.bonoNPS} / ${reg.resultado.bonoNSR}</span></div>
            <div class="detalle-item"><span>Incentivo Maestrazo:</span> <strong>S/ ${reg.resultado.totalMaestrazo.toFixed(2)}</strong></div>
            <div class="detalle-item sub-item"><span>Cumplimiento Ponderado:</span> <span>${reg.resultado.ponderado.toFixed(2)}%</span></div>
            <div class="detalle-item sub-item"><span>Premio Base:</span> <span>S/ ${reg.resultado.premioBase.toFixed(2)}</span></div>
            <div class="detalle-item sub-item"><span>Multiplicador:</span> <span>${reg.resultado.multiplicador}</span></div>
            <div class="detalle-item sub-item"><span>Cálculo B-O (80%):</span> <span>S/ ${reg.resultado.bonoBO.toFixed(2)}</span></div>
            <div class="detalle-item sub-item"><span>Cálculo VE (20%):</span> <span>S/ ${reg.resultado.bonoVE.toFixed(2)}</span></div>
            <div class="detalle-item total"><span>Total a Recibir:</span> <span>S/ ${reg.resultado.totalMes.toFixed(2)}</span></div>
        `;
        
        document.getElementById('btn-editar-registro').onclick = () => prepararEdicion(id);
        abrirSheet(sheetDetalle);
    }

    function prepararEdicion(id) {
        const reg = historial.find(r => r.id === id);
        if (!reg) return;

        idEditando = id; 

        document.getElementById('mes').value = reg.datos.mes;
        document.getElementById('plan-tienda').value = reg.datos.planTienda;
        document.getElementById('nps').value = reg.datos.nps;
        document.getElementById('nsr').value = reg.datos.nsr;
        document.getElementById('venta-individual').value = reg.datos.ventaIndividual;
        document.getElementById('venta-grupal').value = reg.datos.ventaGrupal;
        document.getElementById('bo-retail').value = reg.datos.boRetail;
        document.getElementById('ve').value = reg.datos.ve;
        document.getElementById('frecuencia-bo').value = reg.datos.frecuenciaBO;
        document.getElementById('tipo-jornada').value = reg.datos.tipoJornada;
        document.getElementById('ausencias').value = reg.datos.ausencias;

        formTitulo.textContent = "Editar Datos del Mes";
        btnSubmitForm.textContent = "Actualizar Bono";

        cerrarSheets();
        setTimeout(() => {
            sheetForm.querySelector('.sheet-body').scrollTop = 0;
            abrirSheet(sheetForm);
        }, 200);
    }

    // --- 4. Manejo del Formulario ---
    document.getElementById('form-calculo').addEventListener('submit', (e) => {
        e.preventDefault();
        const datos = {
            mes: document.getElementById('mes').value,
            planTienda: parseFloat(document.getElementById('plan-tienda').value),
            nps: parseFloat(document.getElementById('nps').value),
            nsr: parseFloat(document.getElementById('nsr').value),
            ventaIndividual: parseFloat(document.getElementById('venta-individual').value),
            ventaGrupal: parseFloat(document.getElementById('venta-grupal').value),
            boRetail: parseFloat(document.getElementById('bo-retail').value),
            ve: parseFloat(document.getElementById('ve').value),
            frecuenciaBO: parseFloat(document.getElementById('frecuencia-bo').value),
            ausencias: parseInt(document.getElementById('ausencias').value),
            tipoJornada: document.getElementById('tipo-jornada').value
        };

        const resultado = calcularIncentivos(datos);
        if (resultado.error) { mostrarSnackbar(resultado.error); return; }

        if (idEditando) {
            cambiarPestana('view-historial');
        } else {
            document.getElementById('resultado-vacio').classList.add('hidden');
            document.getElementById('resultado-calculado').classList.remove('hidden');
            document.getElementById('res-total').textContent = `S/ ${resultado.totalMes.toFixed(2)}`;
            document.getElementById('res-tienda').textContent = `S/ ${resultado.totalTienda.toFixed(2)}`;
            document.getElementById('res-tienda-detalle').textContent = `${resultado.bonoPlanTienda} / ${resultado.bonoNPS} / ${resultado.bonoNSR}`;
            document.getElementById('res-maestrazo').textContent = `S/ ${resultado.totalMaestrazo.toFixed(2)}`;
            document.getElementById('res-ponderado').textContent = `${resultado.ponderado.toFixed(2)}%`;
            document.getElementById('res-premio-base').textContent = `S/ ${resultado.premioBase.toFixed(2)}`;
            document.getElementById('res-multiplicador').textContent = `${resultado.multiplicador}`;
            cambiarPestana('view-calculadora');
        }

        guardarEnHistorial(datos, resultado, idEditando);

        cerrarSheets();
        e.target.reset();
        idEditando = null; 
        formTitulo.textContent = "Ingresar Datos del Mes";
        btnSubmitForm.textContent = "Calcular y Guardar";
    });

    // --- 5. RENDERIZAR KPIs (Gráficos) ---
    let kpiChartInstance = null;

    function renderKPIs() {
        const vacio = document.getElementById('kpis-vacio');
        const dashboard = document.getElementById('kpis-dashboard');
        
        if (historial.length === 0) {
            vacio.classList.remove('hidden');
            dashboard.classList.add('hidden');
            return;
        }
        
        vacio.classList.add('hidden');
        dashboard.classList.remove('hidden');

        const sorted = [...historial].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        const totalAnual = sorted.reduce((sum, item) => sum + item.resultado.totalMes, 0);
        const promedio = totalAnual / sorted.length;
        const mejorMes = sorted.reduce((max, item) => item.resultado.totalMes > max.resultado.totalMes ? item : max, sorted[0]);
        
        document.getElementById('kpi-total').textContent = `S/ ${totalAnual.toFixed(2)}`;
        document.getElementById('kpi-promedio').textContent = `S/ ${promedio.toFixed(2)}`;
        
        const [year, month] = mejorMes.fecha.split('-');
        const dateObj = new Date(year, month - 1);
        const monthName = dateObj.toLocaleDateString('es-ES', { month: 'short' });
        document.getElementById('kpi-mejor').textContent = `S/ ${mejorMes.resultado.totalMes.toFixed(2)} (${monthName})`;

        const labels = sorted.map(item => {
            const [y, m] = item.fecha.split('-');
            const d = new Date(y, m - 1);
            return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        });
        const dataBonos = sorted.map(item => item.resultado.totalMes);
        const dataPonderado = sorted.map(item => item.resultado.ponderado);

        if (kpiChartInstance) {
            kpiChartInstance.destroy();
        }

        const ctx = document.getElementById('chart-kpis').getContext('2d');
        kpiChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bono Total (S/)',
                        data: dataBonos,
                        backgroundColor: 'rgba(0, 114, 206, 0.7)',
                        borderColor: 'rgba(0, 114, 206, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cumplimiento (%)',
                        data: dataPonderado,
                        type: 'line',
                        borderColor: '#e31837',
                        backgroundColor: '#e31837',
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Bono (S/)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Cumplimiento (%)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    // --- 6. EXPORTAR E IMPORTAR EXCEL ---
    const btnExportar = document.getElementById('btn-exportar');
    const btnImportar = document.getElementById('btn-importar');
    const fileInput = document.getElementById('file-input');

    btnExportar.addEventListener('click', () => {
        if (historial.length === 0) { mostrarSnackbar("No hay datos para exportar."); return; }

        const datosExcel = historial.map(reg => ({
            "Mes": reg.datos.mes,
            "Plan Tienda (%)": reg.datos.planTienda,
            "NPS (%)": reg.datos.nps,
            "NSR (%)": reg.datos.nsr,
            "Venta Individual (%)": reg.datos.ventaIndividual,
            "Venta Grupal (%)": reg.datos.ventaGrupal,
            "B-O Retail (%)": reg.datos.boRetail,
            "VE (%)": reg.datos.ve,
            "Frecuencia B&O (%)": reg.datos.frecuenciaBO,
            "Jornada": reg.datos.tipoJornada === 'peak' ? 'Peak Time' : 'Full/Part Time',
            "Ausencias (Días)": reg.datos.ausencias,
            "Total Tienda (S/)": reg.resultado.totalTienda,
            "Total Maestrazo (S/)": reg.resultado.totalMaestrazo,
            "Total Mes (S/)": reg.resultado.totalMes
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExcel);
        const wscols = [{wch: 10}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 18}, {wch: 15}, {wch: 15}, {wch: 18}, {wch: 20}, {wch: 15}];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Historial Maestrazo");
        XLSX.writeFile(wb, `Incentivos_Maestrazo_${new Date().toISOString().split('T')[0]}.xlsx`);
        mostrarSnackbar("Archivo exportado correctamente");
    });

    btnImportar.addEventListener('click', () => { fileInput.click(); });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) { mostrarSnackbar("El archivo está vacío."); return; }

                let importados = 0;
                jsonData.forEach(row => {
                    if (row["Mes"] && row["Plan Tienda (%)"] !== undefined) {
                        const num = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
                        const datos = {
                            mes: row["Mes"],
                            planTienda: num(row["Plan Tienda (%)"]),
                            nps: num(row["NPS (%)"]),
                            nsr: num(row["NSR (%)"]),
                            ventaIndividual: num(row["Venta Individual (%)"]),
                            ventaGrupal: num(row["Venta Grupal (%)"]),
                            boRetail: num(row["B-O Retail (%)"]),
                            ve: num(row["VE (%)"]),
                            frecuenciaBO: num(row["Frecuencia B&O (%)"]),
                            tipoJornada: row["Jornada"] === 'Peak Time' ? 'peak' : 'normal',
                            ausencias: num(row["Ausencias (Días)"])
                        };

                        const resultado = calcularIncentivos(datos);
                        if (resultado.error) {
                            resultado.totalTienda = 0; resultado.totalMaestrazo = 0; resultado.totalMes = 0; resultado.ponderado = 0; resultado.premioBase = 0; resultado.multiplicador = 1; resultado.bonoBO = 0; resultado.bonoVE = 0;
                        }

                        const existeIndex = historial.findIndex(h => h.fecha === datos.mes);
                        if (existeIndex !== -1) {
                            historial[existeIndex] = { id: Date.now() + importados, fecha: datos.mes, datos: datos, resultado: resultado };
                        } else {
                            historial.push({ id: Date.now() + importados, fecha: datos.mes, datos: datos, resultado: resultado });
                        }
                        importados++;
                    }
                });

                if (importados > 0) {
                    localStorage.setItem('maestrazo_historial', JSON.stringify(historial));
                    renderHistorial();
                    if (document.getElementById('view-kpis').classList.contains('active')) renderKPIs();
                    mostrarSnackbar(`Se importaron ${importados} registros.`);
                } else {
                    mostrarSnackbar("No se encontraron datos válidos. Revisa el formato.");
                }
            } catch (error) {
                console.error(error);
                mostrarSnackbar("Error al leer el archivo. Asegúrate de que sea un Excel válido.");
            }
            fileInput.value = '';
        };
        reader.readAsArrayBuffer(file);
    });

    // --- 7. INICIALIZAR TUTORIAL Y VISTAS ---
    const elVersion = document.getElementById('app-version');
    if (elVersion) elVersion.textContent = `v${APP_VERSION}`;

    initTutorial(abrirSheet, cerrarSheets, cambiarPestana, sheetForm);
    renderHistorial();

    // --- 8. DETECCIÓN DE ACTUALIZACIONES DE LA PWA ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                // Detectar si hay una nueva versión instalándose
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Si el nuevo worker se instaló y ya hay un controlador (versión antigua)
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            mostrarSnackbar("¡Nueva versión disponible!", true);
                        }
                    });
                });
            });

            // Si el Service Worker toma el control, recargar la página una vez
            let refreshing;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                window.location.reload();
                refreshing = true;
            });
        });
    }
});