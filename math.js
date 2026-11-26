// math.js
// MÓDULO EXCLUSIVO PARA CÁLCULOS MATEMÁTICOS
// (No modificar la lógica a menos que cambien las reglas del negocio)

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

// Exportamos la función principal para que app.js pueda usarla
export function calcularIncentivos(datos) {
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
        totalTienda, 
        bonoPlanTienda: datos.planTienda >= 100 ? 100 : 0, 
        bonoNPS: datos.nps >= 100 ? 50 : 0, 
        bonoNSR: datos.nsr >= 100 ? 50 : 0,
        ponderado, premioBase, multiplicador, bonoBO, bonoVE, totalMaestrazo,
        totalMes: totalTienda + totalMaestrazo
    };
}