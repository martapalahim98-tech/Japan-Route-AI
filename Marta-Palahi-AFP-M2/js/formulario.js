/* Japan Route AI
   Navegación, validación y recogida de preferencias */


/* FUNCIÓN PRINCIPAL DEL FORMULARIO */

/**
 * Inicializa la navegación, las validaciones y los eventos del formulario.
 *
 * @param {Function} alEnviarFormulario Función que procesa las preferencias.
 * @returns {void}
 */
export function inicializarFormulario(alEnviarFormulario) {
    /* REFERENCIAS AL DOM */

    const formPlanificador = document.querySelector('#formPlanificador');

    const pasoDatosViaje = document.querySelector('#pasoDatosViaje');

    const pasoPreferenciasViaje = document.querySelector('#pasoPreferenciasViaje');

    const aeropuertoSalida = document.querySelector('#aeropuertoSalida');

    const fechaIda = document.querySelector('#fechaIda');

    const fechaVuelta = document.querySelector('#fechaVuelta');

    const numeroViajeros = document.querySelector('#numeroViajeros');

    const presupuestoPorPersona = document.querySelector('#presupuestoPorPersona');

    const checkboxIntereses = document.querySelector('#checkboxIntereses');

    const btnContinuarPaso1 = document.querySelector('#btnContinuarPaso1');

    const btnAnteriorPaso2 = document.querySelector('#btnAnteriorPaso2');

    const btnGenerarRuta = document.querySelector('#btnGenerarRuta');

    const btnModificarPreferencias = document.querySelector('#btnModificarPreferencias');

    const btnGenerarOtraRuta = document.querySelector('#btnGenerarOtraRuta');

    const btnReintentar = document.querySelector('#btnReintentar');

    const mensajeFormulario = document.querySelector('#mensajeFormulario');

    const textoPasoActual = document.querySelector('#textoPasoActual');

    const porcentajeProgreso = document.querySelector('#porcentajeProgreso');

    const barraProgreso = document.querySelector('#barraProgreso');

    const barraProgresoContenedor = document.querySelector('.progreso-formulario__barra');

    const indicadoresProgreso = document.querySelectorAll('[data-progress-step]');

    const resultadosViaje = document.querySelector('#resultadosViaje');

    const estadoCarga = document.querySelector('#estadoCarga');

    const estadoError = document.querySelector('#estadoError');

    const tituloPasoDatosViaje = document.querySelector('#tituloPasoDatosViaje');

    const tituloPasoPreferenciasViaje = document.querySelector('#tituloPasoPreferenciasViaje');

    const seccionPlanificador = document.querySelector('#planificador');


    /* VARIABLES DE ESTADO */

    let pasoActual = 1;


    /* FUNCIONES AUXILIARES */

    /* Muestra un mensaje informativo, de éxito o de error en el formulario. */
    function mostrarMensaje(texto, tipo = 'error') {
        mensajeFormulario.textContent = texto;

        mensajeFormulario.className = `mensaje-formulario mensaje-formulario--${tipo}`;

        if (tipo === 'error') {
            mensajeFormulario.setAttribute('role', 'alert');
        } else {
            mensajeFormulario.removeAttribute('role');
        }
    }


    /* Elimina el mensaje mostrado en el formulario. */
    function limpiarMensaje() {
        mensajeFormulario.textContent = '';

        mensajeFormulario.className = 'mensaje-formulario';

        mensajeFormulario.removeAttribute('role');
    }


    /* Marca un campo como incorrecto para comunicar el error visualmente. */
    function marcarCampoInvalido(campo) {
        campo.setAttribute('aria-invalid', 'true');
    }


    /* Elimina el estado de error de un campo. */
    function limpiarCampoInvalido(campo) {
        campo.removeAttribute('aria-invalid');
    }


    /* Elimina todos los estados de error del primer paso. */
    function limpiarErroresPaso1() {
        const camposPaso1 = [
            aeropuertoSalida,
            fechaIda,
            fechaVuelta,
            numeroViajeros,
            presupuestoPorPersona,
        ];

        camposPaso1.forEach(function (campo) {
            limpiarCampoInvalido(campo);
        });
    }


    /* Devuelve la opción seleccionada de un grupo de botones de radio. */
    function obtenerOpcionSeleccionada(nombreGrupo) {
        return document.querySelector(`input[name='${nombreGrupo}']:checked`);
    }


    /* Devuelve los intereses seleccionados en el segundo paso. */
    function obtenerInteresesSeleccionados() {
        return Array.from(
            document.querySelectorAll('input[name="intereses"]:checked'),
        );
    }


    /* Convierte una fecha de formulario en un objeto Date. */
    function convertirFecha(fecha) {
        return new Date(`${fecha}T00:00:00`);
    }


    /* Calcula los días existentes entre dos fechas. */
    function calcularDuracionDias(inicio, final) {
        const fechaInicio = convertirFecha(inicio);

        const fechaFinal = convertirFecha(final);

        const milisegundosPorDia = 1000 * 60 * 60 * 24;

        return Math.round((fechaFinal - fechaInicio) / milisegundosPorDia);
    }


    /* Clasifica el presupuesto introducido por el usuario. */
    function clasificarPresupuesto(presupuesto) {
        if (presupuesto < 2500) {
            return 'ajustado';
        }

        if (presupuesto <= 4500) {
            return 'medio';
        }

        return 'alto';
    }


    /* PROGRESO Y NAVEGACIÓN */

    /* Actualiza la barra y los indicadores del progreso del formulario. */
    function actualizarProgreso(numeroPaso) {
        const porcentaje = numeroPaso === 1 ? 50 : 100;

        textoPasoActual.textContent = `Paso ${numeroPaso} de 2`;

        porcentajeProgreso.textContent = `${porcentaje}%`;

        barraProgreso.style.width = `${porcentaje}%`;

        barraProgresoContenedor.setAttribute('aria-valuenow', String(numeroPaso));

        barraProgresoContenedor.setAttribute(
            'aria-valuetext',
            `Paso ${numeroPaso} de 2`,
        );

        indicadoresProgreso.forEach(function (indicador) {
            const pasoIndicador = Number(indicador.dataset.progressStep);

            indicador.classList.remove('esta-activo', 'esta-completado');

            indicador.removeAttribute('aria-current');

            if (pasoIndicador === numeroPaso) {
                indicador.classList.add('esta-activo');

                indicador.setAttribute('aria-current', 'step');
            }

            if (pasoIndicador < numeroPaso) {
                indicador.classList.add('esta-completado');
            }
        });
    }


    /* Muestra uno de los dos pasos y actualiza el foco y el progreso. */
    function mostrarPaso(numeroPaso) {
        pasoActual = numeroPaso;

        const mostrarPrimerPaso = numeroPaso === 1;

        pasoDatosViaje.hidden = !mostrarPrimerPaso;

        pasoPreferenciasViaje.hidden = mostrarPrimerPaso;

        pasoDatosViaje.classList.toggle('esta-activo', mostrarPrimerPaso);

        pasoPreferenciasViaje.classList.toggle('esta-activo', !mostrarPrimerPaso);

        actualizarProgreso(numeroPaso);

        limpiarMensaje();

        if (mostrarPrimerPaso) {
            tituloPasoDatosViaje.focus({
                preventScroll: true,
            });
        } else {
            tituloPasoPreferenciasViaje.focus({
                preventScroll: true,
            });
        }

        seccionPlanificador.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }


    /* VALIDACIONES */

    /* Valida los datos principales introducidos en el primer paso. */
    function validarPaso1() {
        limpiarMensaje();

        limpiarErroresPaso1();

        const viajeros = Number(numeroViajeros.value);

        const presupuesto = Number(presupuestoPorPersona.value);

        const prioridadVuelo = obtenerOpcionSeleccionada('prioridadVuelo');

        if (aeropuertoSalida.value === '') {
            marcarCampoInvalido(aeropuertoSalida);

            mostrarMensaje('Selecciona el aeropuerto desde el que quieres salir.');

            aeropuertoSalida.focus();

            return false;
        }

        if (fechaIda.value === '') {
            marcarCampoInvalido(fechaIda);

            mostrarMensaje('Selecciona una fecha de ida.');

            fechaIda.focus();

            return false;
        }

        if (fechaVuelta.value === '') {
            marcarCampoInvalido(fechaVuelta);

            mostrarMensaje('Selecciona una fecha de vuelta.');

            fechaVuelta.focus();

            return false;
        }

        const inicio = convertirFecha(fechaIda.value);

        const final = convertirFecha(fechaVuelta.value);

        if (
            Number.isNaN(inicio.getTime()) ||
            Number.isNaN(final.getTime())
        ) {
            marcarCampoInvalido(fechaIda);

            marcarCampoInvalido(fechaVuelta);

            mostrarMensaje('Las fechas introducidas no son válidas.');

            fechaIda.focus();

            return false;
        }

        if (final <= inicio) {
            marcarCampoInvalido(fechaVuelta);

            mostrarMensaje('La fecha de vuelta debe ser posterior a la fecha de ida.');

            fechaVuelta.focus();

            return false;
        }

        const duracionDias = calcularDuracionDias(
            fechaIda.value,
            fechaVuelta.value,
        );

        if (duracionDias < 7) {
            marcarCampoInvalido(fechaVuelta);

            mostrarMensaje('El viaje debe tener una duración mínima de 7 días.');

            fechaVuelta.focus();

            return false;
        }

        if (duracionDias > 21) {
            marcarCampoInvalido(fechaVuelta);

            mostrarMensaje('El viaje no puede superar los 21 días.');

            fechaVuelta.focus();

            return false;
        }

        if (
            !Number.isInteger(viajeros) ||
            viajeros < 1 ||
            viajeros > 4
        ) {
            marcarCampoInvalido(numeroViajeros);

            mostrarMensaje('El número de viajeros debe estar entre 1 y 4.');

            numeroViajeros.focus();

            return false;
        }

        if (
            !Number.isFinite(presupuesto) ||
            presupuesto < 1000 ||
            presupuesto > 10000
        ) {
            marcarCampoInvalido(presupuestoPorPersona);

            mostrarMensaje(
                'El presupuesto por persona debe estar entre 1.000 € y 10.000 €.',
            );

            presupuestoPorPersona.focus();

            return false;
        }

        if (!prioridadVuelo) {
            mostrarMensaje('Selecciona una prioridad para los vuelos.');

            return false;
        }

        return true;
    }


    /* Valida los intereses, el ritmo y la experiencia del segundo paso. */
    function validarPaso2() {
        limpiarMensaje();

        const interesesSeleccionados = obtenerInteresesSeleccionados();

        const ritmoViaje = obtenerOpcionSeleccionada('ritmoViaje');

        const tipoExperiencia = obtenerOpcionSeleccionada('tipoExperiencia');

        if (interesesSeleccionados.length === 0) {
            mostrarMensaje(
                'Selecciona al menos un interés para personalizar la ruta.',
            );

            checkboxIntereses.querySelector('input').focus();

            return false;
        }

        if (interesesSeleccionados.length > 3) {
            mostrarMensaje('Puedes seleccionar un máximo de tres intereses.');

            return false;
        }

        if (!ritmoViaje) {
            mostrarMensaje('Selecciona el ritmo que prefieres para el viaje.');

            return false;
        }

        if (!tipoExperiencia) {
            mostrarMensaje('Selecciona el tipo de experiencia que buscas.');

            return false;
        }

        return true;
    }


    /* PREFERENCIAS DEL VIAJE */

    /* Crea el objeto con las preferencias validadas del usuario. */
    function crearPreferenciasViaje() {
        const prioridadVuelo = obtenerOpcionSeleccionada('prioridadVuelo');

        const ritmoViaje = obtenerOpcionSeleccionada('ritmoViaje');

        const tipoExperiencia = obtenerOpcionSeleccionada('tipoExperiencia');

        const intereses = obtenerInteresesSeleccionados().map(function (checkbox) {
            return checkbox.value;
        });

        const presupuesto = Number(presupuestoPorPersona.value);

        return {
            aeropuertoSalida: aeropuertoSalida.value,
            fechaIda: fechaIda.value,
            fechaVuelta: fechaVuelta.value,
            duracionDias: calcularDuracionDias(
                fechaIda.value,
                fechaVuelta.value,
            ),
            numeroViajeros: Number(numeroViajeros.value),
            presupuestoPorPersona: presupuesto,
            nivelPresupuesto: clasificarPresupuesto(presupuesto),
            prioridadVuelo: prioridadVuelo.value,
            intereses: intereses,
            ritmoViaje: ritmoViaje.value,
            tipoExperiencia: tipoExperiencia.value,
        };
    }


    /* Vuelve al planificador y muestra el paso indicado. */
    function volverAlPlanificador(numeroPaso = 1) {
        estadoCarga.hidden = true;

        resultadosViaje.hidden = true;

        estadoError.hidden = true;

        seccionPlanificador.hidden = false;

        mostrarPaso(numeroPaso);
    }


    /* EVENTOS DEL FORMULARIO */

    btnContinuarPaso1.addEventListener('click', () => {
        if (!validarPaso1()) {
            return;
        }

        mostrarPaso(2);
    });


    btnAnteriorPaso2.addEventListener('click', () => {
        mostrarPaso(1);
    });


    formPlanificador.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (!validarPaso1()) {
            mostrarPaso(1);

            return;
        }

        if (!validarPaso2()) {
            return;
        }

        const preferenciasViaje = crearPreferenciasViaje();

        limpiarMensaje();

        btnGenerarRuta.disabled = true;

        btnGenerarRuta.textContent = 'Generando ruta...';

        try {
            if (typeof alEnviarFormulario === 'function') {
                await alEnviarFormulario(preferenciasViaje);
            }
        } finally {
            btnGenerarRuta.disabled = false;

            btnGenerarRuta.textContent = 'Generar mi ruta';
        }
    });


    checkboxIntereses.addEventListener('change', (evento) => {
        const interesesSeleccionados = obtenerInteresesSeleccionados();

        if (interesesSeleccionados.length > 3) {
            evento.target.checked = false;

            mostrarMensaje('Puedes seleccionar un máximo de tres intereses.');

            return;
        }

        limpiarMensaje();
    });


    fechaIda.addEventListener('change', () => {
        limpiarCampoInvalido(fechaIda);

        limpiarCampoInvalido(fechaVuelta);

        if (fechaIda.value !== '') {
            fechaVuelta.min = fechaIda.value;
        } else {
            fechaVuelta.removeAttribute('min');
        }
    });


    fechaVuelta.addEventListener('change', () => {
        limpiarCampoInvalido(fechaVuelta);
    });


    aeropuertoSalida.addEventListener('change', () => {
        limpiarCampoInvalido(aeropuertoSalida);
    });


    numeroViajeros.addEventListener('input', () => {
        limpiarCampoInvalido(numeroViajeros);
    });


    presupuestoPorPersona.addEventListener('input', () => {
        limpiarCampoInvalido(presupuestoPorPersona);
    });


    btnModificarPreferencias.addEventListener('click', () => {
        volverAlPlanificador(2);
    });


    btnGenerarOtraRuta.addEventListener('click', () => {
        formPlanificador.reset();

        limpiarMensaje();

        limpiarErroresPaso1();

        fechaVuelta.removeAttribute('min');

        volverAlPlanificador(1);
    });


    btnReintentar.addEventListener('click', () => {
        volverAlPlanificador(pasoActual);
    });


    /* INICIALIZACIÓN */

    actualizarProgreso(1);
}