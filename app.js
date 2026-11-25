// app.js

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
        // Reseteamos el scroll interno del formulario
        sheetForm.querySelector('.sheet-body').scrollTop = 0;
        abrirSheet(sheetForm);
    });

    document.getElementById('btn-asistente').addEventListener('click', () => abrirSheet(sheetAsistente));
    
    document.getElementById('btn-cerrar-form').addEventListener('click', cerrarSheets);
    document.getElementById('btn-cerrar-detalle').addEventListener('click', cerrarSheets);
    document.getElementById('btn-cerrar-asistente').addEventListener('click', cerrarSheets);
    backdrop.addEventListener('click', cerrarSheets);

    function mostrarSnackbar(mensaje) {
        snackbar.textContent = mensaje;
        snackbar.classList.add('show');
        setTimeout(() => snackbar.classList.remove('show'), 3000);
    }

    // --- 3. Motor de Cálculo ---
    function obtenerPremioBase(ponderado) {
        if (ponderado >= 135) return 1200; if (ponderado >= 125) return 1050;
        if (ponderado >= 120) return 950; if (ponderado >= 115) return 850;
        if (ponderado >= 110) return 750; if (ponderado >= 105) return 600;
        if (ponderado >= 100) return 400; if (ponderado >= 95) return 100;
        return 0;
    }
    function obtenerMultiplicador(frecuencia) {
        if (frecuencia >= 110) return 1.2; if (frecuencia >= 105) return 1.15;
        if (frecuencia >= 100) return 1.1; return 1.0;
    }

    function calcularIncentivos(datos) {
        let limiteAusencias = datos.tipoJornada === 'peak' ? 2 : 3;
        if (datos.ausencias > limiteAusencias) {
            return { error: `Bono anulado. Superaste el límite de ${limiteAusencias} días.` };
        }

        let totalTienda = (datos.planTienda >= 100 ? 100 : 0) + (datos.nps >= 100 ? 50 : 0) + (datos.nsr >= 100 ? 50 : 0);
        let ponderado = (datos.ventaIndividual * 0.5) + (datos.ventaGrupal * 0.5);
        let premioBase = obtenerPremioBase(ponderado);
        let multiplicador = obtenerMultiplicador(datos.frecuenciaBO);
        let bonoBO = premioBase * (Math.min(datos.boRetail, 100) / 100) * 0.8 * multiplicador;
        let bonoVE = premioBase * (Math.min(datos.ve, 100) / 100) * 0.2 * multiplicador;
        let totalMaestrazo = bonoBO + bonoVE;

        return {
            totalTienda, bonoPlanTienda: datos.planTienda >= 100 ? 100 : 0, bonoNPS: datos.nps >= 100 ? 50 : 0, bonoNSR: datos.nsr >= 100 ? 50 : 0,
            ponderado, premioBase, multiplicador, bonoBO, bonoVE, totalMaestrazo,
            totalMes: totalTienda + totalMaestrazo
        };
    }

    // --- 4. Base de Datos Local (Historial) ---
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
            let startX = 0; let currentX = 0; let isDragging = false;
            function iniciarArrastre(x) { startX = x; isDragging = true; }
            function moverArrastre(x) { if (isDragging) currentX = x; }
            function terminarArrastre() {
                if (!isDragging) return;
                isDragging = false;
                let diferencia = startX - currentX;
                if (diferencia > 50) card.classList.add('swiped');
                else if (diferencia < -50) card.classList.remove('swiped');
            }

            card.addEventListener('touchstart', e => iniciarArrastre(e.touches[0].clientX), {passive: true});
            card.addEventListener('touchmove', e => moverArrastre(e.touches[0].clientX), {passive: true});
            card.addEventListener('touchend', terminarArrastre);
            card.addEventListener('mousedown', e => iniciarArrastre(e.clientX));
            card.addEventListener('mousemove', e => moverArrastre(e.clientX));
            card.addEventListener('mouseup', terminarArrastre);
            card.addEventListener('mouseleave', () => { isDragging = false; });

            card.addEventListener('click', () => {
                if (card.classList.contains('swiped')) { card.classList.remove('swiped'); return; }
                abrirDetalle(parseInt(card.getAttribute('data-id')));
            });
        });

        document.querySelectorAll('.btn-delete-swipe').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                historial = historial.filter(reg => reg.id !== id);
                localStorage.setItem('maestrazo_historial', JSON.stringify(historial));
                renderHistorial();
                mostrarSnackbar("Registro eliminado");
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

    // --- 5. Manejo del Formulario (Nuevo o Edición) ---
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

    // ==========================================
    // 6. SISTEMA DE TUTORIAL (ONBOARDING CORREGIDO)
    // ==========================================
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const spotlight = document.getElementById('tutorial-spotlight');
    const tooltip = document.getElementById('tutorial-tooltip');
    const tutTitle = document.getElementById('tut-title');
    const tutText = document.getElementById('tut-text');
    const btnNext = document.getElementById('tut-btn-next');
    const btnSkip = document.getElementById('tut-btn-skip');
    const appWrapper = document.querySelector('.app-wrapper');

    const pasosTutorial = [
        { elementId: 'btn-nuevo-calculo', title: 'Paso 1: Nuevo Cálculo', text: 'Presiona este botón para registrar tus datos del mes y calcular tu bono.' },
        { elementId: 'mes', title: 'Paso 2: El Mes', text: 'Selecciona el mes y año al que corresponden estos datos.', action: 'openForm' },
        { elementId: 'tut-tienda', title: 'Paso 3: Tienda', text: 'Aquí van los % de tu tienda. Si superas el 100%, sumas hasta S/ 200 extra.' },
        { elementId: 'tut-maestrazo', title: 'Paso 4: Maestrazo', text: 'Tus ventas individuales, grupales, B-O (Retail) y VE. Aquí se define tu bono principal.' },
        { elementId: 'tut-criterios', title: 'Paso 5: Criterios', text: 'Si tienes más de 3 faltas (o 2 en Peak Time) en el mes, el bono se anula.' },
        { elementId: 'btn-submit-form', title: 'Paso 6: Guardar', text: 'Al terminar, presiona aquí para calcular y guardar el registro en tu historial.' },
        { elementId: 'tab-bar-nav', title: 'Paso 7: Tu Historial', text: 'Usa la barra inferior para ver tus cálculos anteriores. Puedes editar o eliminar tocando un registro.', action: 'closeForm' }
    ];

    let pasoActual = 0;

    function iniciarTutorial() {
        pasoActual = 0;
        tutorialOverlay.classList.remove('hidden');
        mostrarPaso();
    }

    function mostrarPaso() {
        if (pasoActual >= pasosTutorial.length) { finalizarTutorial(); return; }

        const paso = pasosTutorial[pasoActual];
        
        if (paso.action === 'openForm') abrirSheet(sheetForm);
        if (paso.action === 'closeForm') cerrarSheets();

        // Esperar a que el Bottom Sheet termine su animación de apertura/cierre
        setTimeout(() => {
            const target = document.getElementById(paso.elementId);
            if (!target) return;

            // Si el target está dentro de un panel con scroll, hacemos scroll manual
            const sheetBody = target.closest('.sheet-body');
            if (sheetBody) {
                const targetRect = target.getBoundingClientRect();
                const sheetRect = sheetBody.getBoundingClientRect();
                
                // Si no está visible, calcular cuánto scrollear
                if (targetRect.top < sheetRect.top || targetRect.bottom > sheetRect.bottom) {
                    const scrollAmount = target.offsetTop - (sheetBody.clientHeight / 2) + (target.clientHeight / 2);
                    sheetBody.scrollTo({ top: scrollAmount, behavior: 'smooth' });
                }
            }

            // Esperar a que el scroll termine para dibujar el foco
            setTimeout(() => {
                const wrapperRect = appWrapper.getBoundingClientRect();
                const rect = target.getBoundingClientRect();
                const padding = 6;

                // Coordenadas relativas al app-wrapper
                const top = rect.top - wrapperRect.top;
                const left = rect.left - wrapperRect.left;

                spotlight.style.width = `${rect.width + padding * 2}px`;
                spotlight.style.height = `${rect.height + padding * 2}px`;
                spotlight.style.top = `${top - padding}px`;
                spotlight.style.left = `${left - padding}px`;

                tutTitle.textContent = paso.title;
                tutText.textContent = paso.text;
                btnNext.textContent = (pasoActual === pasosTutorial.length - 1) ? 'Finalizar' : 'Siguiente';

                // Posicionar tooltip
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
            }, 400); // 400ms para el scroll
        }, 350); // 350ms para la animación del sheet
    }

    btnNext.addEventListener('click', () => { pasoActual++; mostrarPaso(); });
    btnSkip.addEventListener('click', finalizarTutorial);

    function finalizarTutorial() {
        tutorialOverlay.classList.add('hidden');
        cerrarSheets();
        localStorage.setItem('maestrazo_tutorial_visto', 'true');
        cambiarPestana('view-calculadora');
        
        // Forzar reseteo de scrolls por si acaso
        document.querySelector('.content-area').scrollTop = 0;
        document.querySelectorAll('.sheet-body').forEach(el => el.scrollTop = 0);
    }

    document.getElementById('btn-reiniciar-tutorial').addEventListener('click', () => {
        cerrarSheets();
        setTimeout(iniciarTutorial, 300);
    });

    if (!localStorage.getItem('maestrazo_tutorial_visto')) {
        setTimeout(iniciarTutorial, 500);
    }

    // Inicializar
    renderHistorial();
});