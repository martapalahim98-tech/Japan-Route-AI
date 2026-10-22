/* Japan Route AI
   Coordinación principal de la aplicación */


import {
    inicializarFormulario,
} from './formulario.js';

import {
    cargarCiudades,
    cargarConexiones,
    cargarVuelosLocales,
} from './datos.js';

import {
    puntuarCiudades,
    seleccionarCiudades,
    ordenarRuta,
    recomendarAeropuertos,
    obtenerTransportesRuta,
    distribuirDiasRuta,
    crearResultadoViaje,
    compararVuelos,
    calcularPresupuestoViaje,
} from './algoritmo.js';

import {
    mostrarEstadoCarga,
    renderizarResultadoViaje,
    renderizarError,
    renderizarExplicacionIA,
    renderizarErrorExplicacionIA,
    renderizarVuelos,
    renderizarErrorVuelos,
    renderizarPresupuesto,
} from './render.js';

import {
    generarExplicacionIA,
    obtenerTipoCambioEURJPY,
} from './servicios.js';


/* GESTIÓN PRINCIPAL */

/* Genera y muestra una ruta a partir de las preferencias validadas. */
async function procesarPreferencias(preferenciasViaje) {
    mostrarEstadoCarga();

    try {
        /* CARGA DE DATOS */

        const ciudades = await cargarCiudades();

        const conexiones = await cargarConexiones();


        /* CÁLCULO DE LA RUTA */

        const ciudadesPuntuadas = puntuarCiudades(
            ciudades,
            preferenciasViaje,
        );

        const ciudadesSeleccionadas = seleccionarCiudades(
            ciudadesPuntuadas,
            preferenciasViaje,
        );

        const resultadoRuta = ordenarRuta(
            ciudadesSeleccionadas,
        );

        const aeropuertosRecomendados = recomendarAeropuertos(
            resultadoRuta.ciudades,
            preferenciasViaje,
        );

        const transportesRuta = obtenerTransportesRuta(
            resultadoRuta.ciudades,
            conexiones,
        );

        const rutaConDias = distribuirDiasRuta(
            resultadoRuta.ciudades,
            preferenciasViaje,
        );


        /* RESULTADO PRINCIPAL */

        const resultadoViaje = crearResultadoViaje(
            preferenciasViaje,
            resultadoRuta,
            aeropuertosRecomendados,
            rutaConDias,
            transportesRuta,
        );

        renderizarResultadoViaje(
            resultadoViaje,
        );


        /* COMPARACIÓN DE VUELOS */

        try {
            const vuelosLocales = await cargarVuelosLocales();

            const comparacionVuelos = compararVuelos(
                vuelosLocales,
                preferenciasViaje,
                aeropuertosRecomendados,
            );

            resultadoViaje.vuelos = comparacionVuelos;

            renderizarVuelos(
                comparacionVuelos,
            );
        } catch (errorVuelos) {
            resultadoViaje.vuelos = {
                disponible: false,
                origenDatos: 'local-respaldo',
                error: errorVuelos.message,
            };

            renderizarErrorVuelos(
                errorVuelos,
            );
        }


        /* ESTIMACIÓN DEL PRESUPUESTO */

        const tipoCambio = await obtenerTipoCambioEURJPY();

        resultadoViaje.divisa = tipoCambio;

        const presupuestoEstimado = calcularPresupuestoViaje(
            resultadoViaje,
            tipoCambio,
        );

        resultadoViaje.presupuesto = presupuestoEstimado;

        renderizarPresupuesto(
            presupuestoEstimado,
        );


        /* EXPLICACIÓN DE IA */

        try {
            const explicacionIA = await generarExplicacionIA(
                resultadoViaje,
            );

            resultadoViaje.explicacionIA = explicacionIA;

            renderizarExplicacionIA(
                explicacionIA,
            );
        } catch (errorIA) {
            resultadoViaje.explicacionIA = {
                disponible: false,
                origen: 'ollama-local',
                error: errorIA.message,
            };

            renderizarErrorExplicacionIA(
                errorIA,
            );
        }
    } catch (error) {
        console.error(
            'No se ha podido procesar el viaje:',
            error,
        );

        renderizarError(
            error,
        );
    }
}


/* INICIALIZACIÓN */

inicializarFormulario(procesarPreferencias);