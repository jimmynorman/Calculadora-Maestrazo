// tutorial.js
const CLAVE_TUTORIAL_VISTO = 'maestrazo_tutorial_visto';

// Si el navegador bloquea el almacenamiento, no se muestra el tour automático
// (sigue disponible desde el botón "?" del asistente).
function tutorialYaVisto() {
    try {
        return !!localStorage.getItem(CLAVE_TUTORIAL_VISTO);
    } catch (error) {
        console.error('No se pudo leer el estado del tutorial:', error);
        return true;
    }
}

function marcarTutorialVisto() {
    try {
        localStorage.setItem(CLAVE_TUTORIAL_VISTO, 'true');
    } catch (error) {
        console.error('No se pudo guardar el estado del tutorial:', error);
    }
}

export function initTutorial(abrirSheet, cerrarSheets, cambiarPestana, sheetForm) {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const spotlight = document.getElementById('tutorial-spotlight');
    const tooltip = document.getElementById('tutorial-tooltip');
    const tutTitle = document.getElementById('tut-title');
    const tutText = document.getElementById('tut-text');
    const btnNext = document.getElementById('tut-btn-next');
    const btnSkip = document.getElementById('tut-btn-skip');
    const appWrapper = document.querySelector('.app-wrapper');

    // Definimos los 3 tours
    const tours = {
        principal: [
            { elementId: 'btn-nuevo-calculo', title: 'Paso 1: Nuevo Cálculo', text: 'Presiona este botón para registrar tus datos del mes y calcular tu bono.' },
            { elementId: 'mes', title: 'Paso 2: El Mes', text: 'Selecciona el mes y año al que corresponden estos datos.', action: 'openForm' },
            { elementId: 'tut-tienda', title: 'Paso 3: Tienda', text: 'Aquí van los % de tu tienda. Si superas el 100%, sumas hasta S/ 200 extra.' },
            { elementId: 'tut-maestrazo', title: 'Paso 4: Maestrazo', text: 'Tus ventas individuales, grupales, B-O (Retail) y VE. Aquí se define tu bono principal.' },
            { elementId: 'tut-criterios', title: 'Paso 5: Criterios', text: 'Si tienes más de 3 faltas (o 2 en Peak Time) en el mes, el bono se anula.' },
            { elementId: 'btn-submit-form', title: 'Paso 6: Guardar', text: 'Al terminar, presiona aquí para calcular y guardar el registro en tu historial.' },
            { elementId: 'tab-bar-nav', title: 'Paso 7: Tu Historial', text: 'Usa la barra inferior para ver tus cálculos anteriores. Puedes editar o eliminar tocando un registro.', action: 'closeForm' }
        ],
        historial: [
            { elementId: 'tab-btn-historial', title: 'Sección Historial', text: 'Aquí guardamos todos tus meses calculados.', action: 'tab-historial' },
            { elementId: 'btn-exportar', title: 'Exportar e Importar', text: 'Descarga tu historial en Excel o súbelo para respaldar tus datos.' },
            { elementId: 'dyn-historial', title: 'Tus Registros', text: 'Haz clic en un mes para ver el desglose y editarlo. Desliza hacia la izquierda para eliminar un registro.' }
        ],
        kpis: [
            { elementId: 'tab-btn-kpis', title: 'Sección KPIs', text: 'Visualiza tu progreso y proyecciones.', action: 'tab-kpis' },
            { elementId: 'dyn-kpis-resumen', title: 'Resumen Financiero', text: 'Aquí ves el total ganado, tu promedio mensual y tu mejor mes.' },
            { elementId: 'dyn-kpis-grafico', title: 'Gráfico de Evolución', text: 'Observa cómo varían tus bonos (barras azules) y tu cumplimiento (línea roja) mes a mes.' }
        ]
    };

    let pasoActual = 0;
    let tourActual = 'principal';

    function iniciarTour(nombreTour) {
        tourActual = nombreTour;
        pasoActual = 0;
        tutorialOverlay.classList.remove('hidden');
        mostrarPaso();
    }

    function mostrarPaso() {
        const pasos = tours[tourActual];
        if (pasoActual >= pasos.length) { finalizarTutorial(); return; }

        const paso = pasos[pasoActual];
        
        if (paso.action === 'openForm') abrirSheet(sheetForm);
        if (paso.action === 'closeForm') cerrarSheets();
        if (paso.action === 'tab-historial') cambiarPestana('view-historial');
        if (paso.action === 'tab-kpis') cambiarPestana('view-kpis');

        setTimeout(() => {
            // Manejo de IDs dinámicos (por si el historial está vacío)
            let targetId = paso.elementId;
            if (targetId === 'dyn-historial') {
                targetId = document.getElementById('historial-lista').children.length > 0 ? 'historial-lista' : 'historial-vacio';
            } else if (targetId === 'dyn-kpis-resumen') {
                targetId = document.getElementById('kpis-dashboard').classList.contains('hidden') ? 'kpis-vacio' : 'kpi-resumen';
            } else if (targetId === 'dyn-kpis-grafico') {
                targetId = document.getElementById('kpis-dashboard').classList.contains('hidden') ? 'kpis-vacio' : 'kpi-chart-container';
            }

            const target = document.getElementById(targetId);
            if (!target) return;

            const sheetBody = target.closest('.sheet-body');
            if (sheetBody) {
                const targetRect = target.getBoundingClientRect();
                const sheetRect = sheetBody.getBoundingClientRect();
                if (targetRect.top < sheetRect.top || targetRect.bottom > sheetRect.bottom) {
                    const scrollAmount = target.offsetTop - (sheetBody.clientHeight / 2) + (target.clientHeight / 2);
                    sheetBody.scrollTo({ top: scrollAmount, behavior: 'smooth' });
                }
            }

            setTimeout(() => {
                const wrapperRect = appWrapper.getBoundingClientRect();
                const rect = target.getBoundingClientRect();
                const padding = 6;

                const top = rect.top - wrapperRect.top;
                const left = rect.left - wrapperRect.left;

                spotlight.style.width = `${rect.width + padding * 2}px`;
                spotlight.style.height = `${rect.height + padding * 2}px`;
                spotlight.style.top = `${top - padding}px`;
                spotlight.style.left = `${left - padding}px`;

                tutTitle.textContent = paso.title;
                tutText.textContent = paso.text;
                btnNext.textContent = (pasoActual === pasos.length - 1) ? 'Finalizar' : 'Siguiente';

                const tooltipHeight = 140; 
                let tooltipTop = top + rect.height + 12;
                if (tooltipTop + tooltipHeight > wrapperRect.height) {
                    tooltipTop = top - tooltipHeight - 12;
                }
                
                let tooltipLeft = left + (rect.width / 2) - 140; 
                if (tooltipLeft < 10) tooltipLeft = 10;
                if (tooltipLeft + 280 > wrapperRect.width - 10) tooltipLeft = wrapperRect.width - 290;

                tooltip.style.top = `${tooltipTop}px`;
                tooltip.style.left = `${tooltipLeft}px`;
            }, 400); 
        }, 350); 
    }

    btnNext.addEventListener('click', () => { pasoActual++; mostrarPaso(); });
    btnSkip.addEventListener('click', finalizarTutorial);

    function finalizarTutorial() {
        tutorialOverlay.classList.add('hidden');
        cerrarSheets();
        if (tourActual === 'principal') {
            marcarTutorialVisto();
        }
        cambiarPestana('view-calculadora');
        document.querySelector('.content-area').scrollTop = 0;
        document.querySelectorAll('.sheet-body').forEach(el => el.scrollTop = 0);
    }

    // Asignar eventos a los nuevos botones del Asistente
    document.getElementById('btn-tut-principal').addEventListener('click', () => {
        cerrarSheets();
        setTimeout(() => iniciarTour('principal'), 300);
    });
    document.getElementById('btn-tut-historial').addEventListener('click', () => {
        cerrarSheets();
        setTimeout(() => iniciarTour('historial'), 300);
    });
    document.getElementById('btn-tut-kpis').addEventListener('click', () => {
        cerrarSheets();
        setTimeout(() => iniciarTour('kpis'), 300);
    });

    // Auto-iniciar solo el principal la primera vez
    if (!tutorialYaVisto()) {
        setTimeout(() => iniciarTour('principal'), 500);
    }
}