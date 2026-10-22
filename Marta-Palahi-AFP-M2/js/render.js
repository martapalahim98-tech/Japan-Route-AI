/* Japan Route AI
   Renderizado de los resultados en la interfaz */


/*
    1. Mostrar el resumen del viaje.
    2. Mostrar la ruta y los aeropuertos.
    3. Mostrar vuelos y presupuesto.
    4. Mostrar el mapa y la explicación de IA.
    5. Mostrar transportes y distribución de días.
    6. Gestionar los estados visuales y los errores.
*/


import {
    renderizarMapaRuta,
} from './mapa.js';


/* REFERENCIAS GENERALES AL DOM */

const seccionPlanificador = document.querySelector('#planificador');

const seccionEstadoCarga = document.querySelector('#estadoCarga');

const seccionResultados = document.querySelector('#resultadosViaje');

const seccionEstadoError = document.querySelector('#estadoError');

const tituloResultados = document.querySelector('#tituloResultados');

const subtituloResultados = document.querySelector('#subtituloResultados');

const resumenIntereses = document.querySelector('#resumenIntereses');

const resumenDuracion = document.querySelector('#resumenDuracion');

const resumenPresupuesto = document.querySelector('#resumenPresupuesto');

const resumenRitmo = document.querySelector('#resumenRitmo');

const resumenExperiencia = document.querySelector('#resumenExperiencia');

const avisosViaje = document.querySelector('#avisosViaje');

const tituloRuta = document.querySelector('#tituloRuta');

const insigniaRuta = document.querySelector('#insigniaRuta');

const rutaRecomendada = document.querySelector('#rutaRecomendada');

const aeropuertoEntradaResultado = document.querySelector(
    '#aeropuertoEntradaResultado',
);

const aeropuertoSalidaResultado = document.querySelector(
    '#aeropuertoSalidaResultado',
);

const motivoAeropuertos = document.querySelector('#motivoAeropuertos');

const listaTransportes = document.querySelector('#listaTransportes');

const distribucionDias = document.querySelector('#distribucionDias');

const mensajeErrorGeneral = document.querySelector('#mensajeErrorGeneral');

const contenedorMapa = document.querySelector('#mapaRuta');


/* REFERENCIAS DE LA EXPLICACIÓN DE IA */

const recomendacionIA = document.querySelector('#recomendacionIA');

const tituloRecomendacionIA = document.querySelector(
    '#tituloRecomendacionIA',
);

const resumenRecomendacionIA = document.querySelector(
    '#resumenRecomendacionIA',
);

const estadoRecomendacionIA = document.querySelector(
    '#estadoRecomendacionIA',
);

const explicacionRecomendacionIA = document.querySelector(
    '#explicacionRecomendacionIA',
);


/* REFERENCIAS DE LOS VUELOS */

const bloqueVuelos = document.querySelector('#bloqueVuelos');

const comparacionVuelos = document.querySelector('#comparacionVuelos');

const descripcionVuelos = document.querySelector('#descripcionVuelos');

const avisoVuelos = document.querySelector('#avisoVuelos');


/* REFERENCIAS DEL PRESUPUESTO */

const bloquePresupuesto = document.querySelector('#bloquePresupuesto');

const totalPresupuestoPersona = document.querySelector(
    '#totalPresupuestoPersona',
);

const presupuestoDisponiblePersona = document.querySelector(
    '#presupuestoDisponiblePersona',
);

const diferenciaPresupuestoPersona = document.querySelector(
    '#diferenciaPresupuestoPersona',
);

const porcentajePresupuesto = document.querySelector(
    '#porcentajePresupuesto',
);

const desglosePresupuesto = document.querySelector('#desglosePresupuesto');

const estadoPresupuesto = document.querySelector('#estadoPresupuesto');

const etiquetaEstadoPresupuesto = document.querySelector(
    '#etiquetaEstadoPresupuesto',
);

const tituloEstadoPresupuesto = document.querySelector(
    '#tituloEstadoPresupuesto',
);

const mensajeEstadoPresupuesto = document.querySelector(
    '#mensajeEstadoPresupuesto',
);

const barraPresupuesto = document.querySelector('#barraPresupuesto');

const informacionCambio = document.querySelector('#informacionCambio');

const avisosPresupuesto = document.querySelector('#avisosPresupuesto');


/* ETIQUETAS DE LA INTERFAZ */

const etiquetasIntereses = {
    'cultura-templos': 'Cultura y templos',
    gastronomia: 'Gastronomía',
    naturaleza: 'Naturaleza',
    'grandes-ciudades': 'Grandes ciudades',
    'japon-tradicional': 'Japón tradicional',
    'anime-tecnologia-compras': 'Anime y tecnología',
};

const etiquetasRitmos = {
    relajado: 'Relajado',
    equilibrado: 'Equilibrado',
    intenso: 'Intenso',
};

const etiquetasExperiencias = {
    esencial: 'Japón imprescindible',
    equilibrada: 'Japón equilibrado',
    alternativa: 'Japón alternativo',
};

const etiquetasPrioridadesVuelo = {
    precio: 'Ahorrar al máximo',
    equilibrio: 'Mejor equilibrio',
    rapidez: 'Llegar antes',
};


/* FUNCIONES AUXILIARES */

/* Convierte un número en un valor con formato español. */
function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ES').format(numero);
}


/* Devuelve el texto de días en singular o plural. */
function formatearDias(dias) {
    if (dias === 1) {
        return '1 día';
    }

    return `${dias} días`;
}


/* Convierte una duración en minutos a horas y minutos. */
function formatearDuracionMinutos(duracionMinutos) {
    if (typeof duracionMinutos !== 'number') {
        return 'Sin información';
    }

    const horas = Math.floor(duracionMinutos / 60);

    const minutos = duracionMinutos % 60;

    if (horas === 0) {
        return `${minutos} min`;
    }

    if (minutos === 0) {
        return `${horas} h`;
    }

    return `${horas} h ${minutos} min`;
}


/* Devuelve el periodo asignado a una ciudad. */
function formatearPeriodo(ciudad) {
    if (ciudad.diaInicio === ciudad.diaFin) {
        return `Día ${ciudad.diaInicio}`;
    }

    return `Días ${ciudad.diaInicio}-${ciudad.diaFin}`;
}


/* Devuelve el texto correspondiente a los transbordos. */
function formatearTransbordos(transbordos) {
    if (typeof transbordos !== 'number') {
        return 'Sin información';
    }

    if (transbordos === 0) {
        return 'Directo';
    }

    if (transbordos === 1) {
        return '1 transbordo';
    }

    return `${transbordos} transbordos`;
}


/* Devuelve el texto correspondiente a las escalas de un vuelo. */
function formatearEscalas(escalas) {
    if (escalas === 0) {
        return 'Directo';
    }

    if (escalas === 1) {
        return '1 escala';
    }

    return `${escalas} escalas`;
}


/* Formatea una cantidad en euros. */
function formatearEuros(importe) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(importe);
}


/* Crea una fila del desglose económico. */
function crearFilaPresupuesto(concepto, importe, descripcion) {
    return `
        <article class="desglose-presupuesto__fila">
            <div>
                <strong>${concepto}</strong>
                <small>${descripcion}</small>
            </div>

            <span>${formatearEuros(importe)}</span>
        </article>
    `;
}


/* Limpia los resultados secundarios antes de generar una nueva ruta. */
function reiniciarBloquesSecundarios() {
    bloqueVuelos.hidden = true;

    comparacionVuelos.innerHTML = '';

    descripcionVuelos.textContent =
        'Comparación orientativa según tu aeropuerto, fechas y prioridad.';

    avisoVuelos.textContent = '';

    bloquePresupuesto.hidden = true;

    desglosePresupuesto.innerHTML = '';

    informacionCambio.innerHTML = '';

    avisosPresupuesto.innerHTML = '';

    barraPresupuesto.style.width = '0%';

    diferenciaPresupuestoPersona.classList.remove('importe-negativo');

    contenedorMapa.innerHTML = '';

    contenedorMapa.classList.remove('mapa-ruta--error');
}


/* Muestra un error únicamente dentro del mapa. */
function renderizarErrorMapa(error) {
    if (!contenedorMapa) {
        return;
    }

    contenedorMapa.innerHTML = '';

    contenedorMapa.classList.add('mapa-ruta--error');

    const contenidoError = document.createElement('div');

    contenidoError.className = 'mapa-error';

    const titulo = document.createElement('strong');

    titulo.textContent = 'No se ha podido cargar el mapa';

    const mensaje = document.createElement('p');

    mensaje.textContent =
        error?.message ||
        'El mapa no está disponible en este momento.';

    const aclaracion = document.createElement('small');

    aclaracion.textContent =
        'La ruta y el resto de la información siguen siendo válidos.';

    contenidoError.append(
        titulo,
        mensaje,
        aclaracion,
    );

    contenedorMapa.append(contenidoError);

    console.error(
        'No se ha podido mostrar el mapa:',
        error,
    );
}


/* RENDERIZADO DEL RESUMEN */

/* Muestra las preferencias principales del viaje. */
function renderizarResumen(resultadoViaje) {
    const preferencias = resultadoViaje.preferencias;

    const primeraCiudad = resultadoViaje.ciudades[0];

    const ultimaCiudad =
        resultadoViaje.ciudades[
            resultadoViaje.ciudades.length - 1
        ];

    tituloResultados.textContent =
        'Tu ruta ideal por Japón';

    subtituloResultados.textContent =
        `${resultadoViaje.resumen.cantidadDestinos} destinos entre ` +
        `${primeraCiudad.nombre} y ${ultimaCiudad.nombre}, ` +
        'adaptados a tu estilo de viaje.';

    resumenDuracion.textContent =
        formatearDias(
            resultadoViaje.resumen.duracionDias,
        );

    resumenPresupuesto.textContent =
        `${formatearNumero(preferencias.presupuestoPorPersona)} € por persona`;

    resumenRitmo.textContent =
        etiquetasRitmos[preferencias.ritmoViaje] ||
        preferencias.ritmoViaje;

    resumenExperiencia.textContent =
        etiquetasExperiencias[preferencias.tipoExperiencia] ||
        preferencias.tipoExperiencia;

    tituloRuta.textContent =
        `De ${primeraCiudad.nombre} a ${ultimaCiudad.nombre}`;

    insigniaRuta.textContent =
        etiquetasPrioridadesVuelo[preferencias.prioridadVuelo] ||
        'Ruta personalizada';
}


/* Muestra las etiquetas de los intereses seleccionados. */
function renderizarIntereses(intereses) {
    resumenIntereses.innerHTML =
        intereses
            .map(function (interes) {
                const etiqueta =
                    etiquetasIntereses[interes] ||
                    interes;

                return `<span>${etiqueta}</span>`;
            })
            .join('');
}


/* RENDERIZADO DE LA RUTA */

/* Muestra las ciudades en el orden del recorrido. */
function renderizarRuta(ciudades) {
    rutaRecomendada.innerHTML =
        ciudades
            .map(function (ciudad, indice) {
                return `
                    <article
                        class="ruta-recomendada__parada"
                        data-city="${ciudad.id}"
                    >
                        <span>${indice + 1}</span>

                        <div>
                            <strong>
                                ${ciudad.nombre}

                                <small lang="ja">
                                    ${ciudad.nombreJapones}
                                </small>
                            </strong>

                            <small>
                                ${formatearPeriodo(ciudad)}
                                ·
                                ${formatearDias(ciudad.diasAsignados)}
                            </small>
                        </div>
                    </article>
                `;
            })
            .join('');
}


/* RENDERIZADO DE AEROPUERTOS */

/* Muestra los aeropuertos recomendados de entrada y salida. */
function renderizarAeropuertos(aeropuertos) {
    aeropuertoEntradaResultado.textContent =
        `${aeropuertos.entrada.codigo} · ` +
        `${aeropuertos.entrada.ciudadReferencia}`;

    aeropuertoSalidaResultado.textContent =
        `${aeropuertos.salida.codigo} · ` +
        `${aeropuertos.salida.ciudadReferencia}`;

    motivoAeropuertos.textContent =
        aeropuertos.motivo;
}


/* RENDERIZADO DE TRANSPORTES */

/* Muestra los transportes existentes entre las ciudades. */
function renderizarTransportes(transportes) {
    listaTransportes.innerHTML =
        transportes
            .map(function (transporte, indice) {
                if (!transporte.disponible) {
                    return `
                        <article class="tarjeta-transporte tarjeta-transporte--no-disponible">
                            <small>Trayecto ${indice + 1}</small>

                            <h4>
                                ${transporte.nombreOrigen}
                                →
                                ${transporte.nombreDestino}
                            </h4>

                            <p>
                                No hay información registrada para este trayecto.
                            </p>

                            <span class="estado-transporte estado-transporte--aviso">
                                Pendiente de verificar
                            </span>
                        </article>
                    `;
                }

                return `
                    <article class="tarjeta-transporte">
                        <small>Trayecto ${indice + 1}</small>

                        <h4>
                            ${transporte.nombreOrigen}
                            →
                            ${transporte.nombreDestino}
                        </h4>

                        <p class="tarjeta-transporte__estaciones">
                            ${transporte.estacionOrigen}
                            →
                            ${transporte.estacionDestino}
                        </p>

                        <dl>
                            <div>
                                <dt>Medio</dt>
                                <dd>${transporte.medio}</dd>
                            </div>

                            <div>
                                <dt>Duración</dt>
                                <dd>
                                    ${formatearDuracionMinutos(
                                        transporte.duracionMinutos,
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>Precio</dt>
                                <dd>
                                    ${formatearNumero(
                                        transporte.precioAproximadoYenes,
                                    )}
                                    ¥
                                </dd>
                            </div>

                            <div>
                                <dt>Conexión</dt>
                                <dd>
                                    ${formatearTransbordos(
                                        transporte.transbordos,
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <span class="estado-transporte">
                            Datos aproximados
                        </span>
                    </article>
                `;
            })
            .join('');
}


/* RENDERIZADO DE DÍAS */

/* Muestra los días asignados a cada ciudad. */
function renderizarDistribucionDias(ciudades) {
    distribucionDias.innerHTML =
        ciudades
            .map(function (ciudad) {
                return `
                    <div>
                        <div>
                            <span>${ciudad.nombre}</span>

                            <small>
                                ${formatearPeriodo(ciudad)}
                            </small>
                        </div>

                        <strong>
                            ${formatearDias(ciudad.diasAsignados)}
                        </strong>
                    </div>
                `;
            })
            .join('');
}


/* RENDERIZADO DE AVISOS */

/* Muestra los avisos generados por el algoritmo. */
function renderizarAvisos(avisos) {
    if (
        !Array.isArray(avisos) ||
        avisos.length === 0
    ) {
        avisosViaje.innerHTML = '';

        avisosViaje.hidden = true;

        return;
    }

    avisosViaje.innerHTML = `
        <strong>Información importante</strong>

        <ul>
            ${avisos
                .map(function (aviso) {
                    return `<li>${aviso}</li>`;
                })
                .join('')}
        </ul>
    `;

    avisosViaje.hidden = false;
}


/* RECOMENDACIÓN DE IA */

/* Prepara la tarjeta mientras Qwen genera su respuesta. */
export function mostrarCargaExplicacionIA() {
    recomendacionIA.hidden = false;

    recomendacionIA.setAttribute(
        'aria-busy',
        'true',
    );

    recomendacionIA.classList.remove(
        'recomendacion-ia--error',
    );

    tituloRecomendacionIA.textContent =
        'Preparando la explicación de tu ruta';

    resumenRecomendacionIA.textContent =
        'Qwen está analizando la propuesta calculada por la aplicación.';

    estadoRecomendacionIA.hidden = false;

    explicacionRecomendacionIA.hidden = true;

    explicacionRecomendacionIA.innerHTML = '';
}


/* Muestra la explicación generada por Qwen. */
export function renderizarExplicacionIA(explicacionIA) {
    recomendacionIA.setAttribute(
        'aria-busy',
        'false',
    );

    recomendacionIA.classList.remove(
        'recomendacion-ia--error',
    );

    tituloRecomendacionIA.textContent =
        explicacionIA.titulo;

    resumenRecomendacionIA.textContent =
        explicacionIA.resumen;

    estadoRecomendacionIA.hidden = true;

    explicacionRecomendacionIA.innerHTML = '';

    const listaMotivos = document.createElement('ul');

    listaMotivos.className =
        'recomendacion-ia__motivos';

    explicacionIA.motivos.forEach(function (motivo) {
        const elemento = document.createElement('li');

        elemento.textContent = motivo;

        listaMotivos.append(elemento);
    });

    const bloqueConsejo = document.createElement('div');

    bloqueConsejo.className =
        'recomendacion-ia__consejo';

    const tituloConsejo = document.createElement('strong');

    tituloConsejo.textContent =
        'Consejo para tu viaje';

    const textoConsejo = document.createElement('p');

    textoConsejo.textContent =
        explicacionIA.consejo;

    bloqueConsejo.append(
        tituloConsejo,
        textoConsejo,
    );

    explicacionRecomendacionIA.append(
        listaMotivos,
        bloqueConsejo,
    );

    explicacionRecomendacionIA.hidden = false;
}


/* Muestra un error local de IA sin ocultar el resto del viaje. */
export function renderizarErrorExplicacionIA(error) {
    recomendacionIA.setAttribute(
        'aria-busy',
        'false',
    );

    recomendacionIA.classList.add(
        'recomendacion-ia--error',
    );

    tituloRecomendacionIA.textContent =
        'La explicación de IA no está disponible';

    resumenRecomendacionIA.textContent =
        error?.message ||
        'No se ha podido conectar con Qwen.';

    estadoRecomendacionIA.hidden = true;

    explicacionRecomendacionIA.innerHTML = '';

    const aclaracion = document.createElement('p');

    aclaracion.textContent =
        'La ruta, los días, los aeropuertos y los transportes ' +
        'han sido calculados correctamente por la aplicación.';

    explicacionRecomendacionIA.append(aclaracion);

    explicacionRecomendacionIA.hidden = false;

    console.error(
        'No se ha podido generar la explicación de IA:',
        error,
    );
}


/* VUELOS */

/* Crea una tarjeta con una opción simulada de vuelo. */
function crearTarjetaVuelo(vuelo, etiquetaPrincipal, vueloRecomendado) {
    const esRecomendado =
        vuelo.id === vueloRecomendado.id;

    const claseRecomendado =
        esRecomendado
            ? ' tarjeta-vuelo--recomendado'
            : '';

    const insigniaRecomendada =
        esRecomendado
            ? `
                <span class="insignia insignia--roja">
                    Recomendado
                </span>
            `
            : '';

    const motivoRecomendacion =
        esRecomendado
            ? `
                <div>
                    <dt>Motivo</dt>

                    <dd>
                        ${vueloRecomendado.motivo}
                    </dd>
                </div>
            `
            : '';

    return `
        <article class="tarjeta-vuelo${claseRecomendado}">
            <div class="tarjeta-vuelo__insignias">
                <span class="insignia">
                    ${etiquetaPrincipal}
                </span>

                ${insigniaRecomendada}
            </div>

            <p class="tarjeta-vuelo__trayecto">
                ${vuelo.origen} → ${vuelo.destino}
            </p>

            <strong class="tarjeta-vuelo__precio">
                ${formatearNumero(vuelo.precioPorPersona)}
                € por persona
            </strong>

            <dl>
                <div>
                    <dt>Duración</dt>

                    <dd>
                        ${formatearDuracionMinutos(
                            vuelo.duracionMinutos,
                        )}
                    </dd>
                </div>

                <div>
                    <dt>Escalas</dt>

                    <dd>
                        ${formatearEscalas(vuelo.escalas)}
                    </dd>
                </div>

                <div>
                    <dt>Total del grupo</dt>

                    <dd>
                        ${formatearNumero(vuelo.precioTotal)}
                        €
                    </dd>
                </div>

                ${motivoRecomendacion}
            </dl>

            <small class="tarjeta-vuelo__origen-datos">
                Datos simulados
            </small>
        </article>
    `;
}


/* Muestra la comparación de las opciones de vuelo. */
export function renderizarVuelos(resultadoVuelos) {
    if (
        !resultadoVuelos ||
        !resultadoVuelos.disponible
    ) {
        bloqueVuelos.hidden = true;

        return;
    }

    const opciones = resultadoVuelos.opciones;

    descripcionVuelos.textContent =
        `${resultadoVuelos.origen} → ${resultadoVuelos.destino} · ` +
        `${resultadoVuelos.numeroViajeros} ` +
        `viajero${resultadoVuelos.numeroViajeros === 1 ? '' : 's'}`;

    const vuelosVisibles = [];

    vuelosVisibles.push({
        vuelo: opciones.masBarato,
        etiqueta: 'Más barato',
    });

    if (
        opciones.masRapido.id !==
        opciones.masBarato.id
    ) {
        vuelosVisibles.push({
            vuelo: opciones.masRapido,
            etiqueta: 'Más rápido',
        });
    }

    comparacionVuelos.innerHTML =
        vuelosVisibles
            .map(function (opcion) {
                return crearTarjetaVuelo(
                    opcion.vuelo,
                    opcion.etiqueta,
                    opciones.recomendado,
                );
            })
            .join('');

    avisoVuelos.textContent =
        resultadoVuelos.aviso;

    bloqueVuelos.hidden = false;
}


/* Muestra un error local de vuelos sin bloquear la ruta. */
export function renderizarErrorVuelos(error) {
    descripcionVuelos.textContent =
        'No se ha podido completar la comparación de vuelos.';

    comparacionVuelos.innerHTML = '';

    const contenidoError = document.createElement('div');

    contenidoError.className = 'vuelos-error';

    const titulo = document.createElement('strong');

    titulo.textContent =
        'Opciones de vuelo no disponibles';

    const mensaje = document.createElement('p');

    mensaje.textContent =
        error?.message ||
        'No se han podido obtener vuelos.';

    const aclaracion = document.createElement('small');

    aclaracion.textContent =
        'La ruta por Japón sigue siendo válida.';

    contenidoError.append(
        titulo,
        mensaje,
        aclaracion,
    );

    comparacionVuelos.append(contenidoError);

    avisoVuelos.textContent =
        'Japan Route AI no realiza reservas ni garantiza disponibilidad o precios.';

    bloqueVuelos.hidden = false;

    console.error(
        'No se han podido preparar los vuelos:',
        error,
    );
}


/* PRESUPUESTO */

/* Muestra la estimación económica del viaje. */
export function renderizarPresupuesto(presupuesto) {
    if (
        !presupuesto ||
        !presupuesto.disponible
    ) {
        bloquePresupuesto.hidden = true;

        return;
    }

    const resumen = presupuesto.resumen;

    const costes = presupuesto.costesPorPersona;

    totalPresupuestoPersona.textContent =
        formatearEuros(
            resumen.totalEstimadoPorPersona,
        );

    presupuestoDisponiblePersona.textContent =
        formatearEuros(
            resumen.presupuestoDisponiblePorPersona,
        );

    diferenciaPresupuestoPersona.textContent =
        formatearEuros(
            resumen.diferenciaPorPersona,
        );

    diferenciaPresupuestoPersona.classList.toggle(
        'importe-negativo',
        resumen.diferenciaPorPersona < 0,
    );

    porcentajePresupuesto.textContent =
        `${formatearNumero(resumen.porcentajeUtilizado)} %`;

    desglosePresupuesto.innerHTML =
        crearFilaPresupuesto(
            'Vuelos',
            costes.vuelos,
            presupuesto.esEstimacionCompleta
                ? 'Opción recomendada por persona'
                : 'No incluidos',
        ) +
        crearFilaPresupuesto(
            'Alojamiento',
            costes.alojamiento,
            `${presupuesto.duracionDias} días · ` +
            `estimación ${presupuesto.nivelPresupuesto}`,
        ) +
        crearFilaPresupuesto(
            'Transporte interno',
            costes.transporteInterno,
            `${formatearNumero(
                presupuesto.transporteInterno.yenesPorPersona,
            )} ¥ convertidos a euros`,
        ) +
        crearFilaPresupuesto(
            'Comida',
            costes.comida,
            `${presupuesto.duracionDias} días · por persona`,
        ) +
        crearFilaPresupuesto(
            'Actividades',
            costes.actividades,
            `${presupuesto.duracionDias} días · por persona`,
        );

    etiquetaEstadoPresupuesto.textContent =
        presupuesto.esEstimacionCompleta
            ? 'Comparación completa'
            : 'Comparación parcial';

    tituloEstadoPresupuesto.textContent =
        presupuesto.estado.titulo;

    mensajeEstadoPresupuesto.textContent =
        presupuesto.estado.mensaje;

    estadoPresupuesto.className =
        `estado-presupuesto estado-presupuesto--${presupuesto.estado.codigo}`;

    const anchoBarra =
        Math.min(
            resumen.porcentajeUtilizado,
            100,
        );

    barraPresupuesto.style.width =
        `${anchoBarra}%`;

    informacionCambio.innerHTML = `
        <strong>Conversión EUR / JPY</strong>

        <span>
            1 € =
            ${formatearNumero(
                presupuesto.tipoCambio.yenesPorEuro,
            )}
            ¥
        </span>

        <small>
            ${
                presupuesto.tipoCambio.esRespaldo
                    ? 'Tipo de cambio local orientativo'
                    : `Dato consultado mediante Frankfurter · ${presupuesto.tipoCambio.fecha}`
            }
        </small>
    `;

    const avisos =
        Array.isArray(presupuesto.avisos)
            ? presupuesto.avisos
            : [];

    avisosPresupuesto.innerHTML = `
        <strong>Sobre esta estimación</strong>

        <ul>
            ${avisos
                .map(function (aviso) {
                    return `<li>${aviso}</li>`;
                })
                .join('')}
        </ul>
    `;

    bloquePresupuesto.hidden = false;
}


/* ESTADOS GENERALES */

/* Muestra el estado general de carga. */
export function mostrarEstadoCarga() {
    seccionPlanificador.hidden = true;

    seccionResultados.hidden = true;

    seccionEstadoError.hidden = true;

    seccionEstadoCarga.hidden = false;

    seccionEstadoCarga.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}


/* Muestra el resultado principal en la interfaz. */
export function renderizarResultadoViaje(resultadoViaje) {
    if (
        !resultadoViaje ||
        !Array.isArray(resultadoViaje.ciudades) ||
        resultadoViaje.ciudades.length === 0
    ) {
        throw new Error(
            'No se puede renderizar un resultado de viaje vacío.',
        );
    }

    reiniciarBloquesSecundarios();

    renderizarResumen(
        resultadoViaje,
    );

    renderizarIntereses(
        resultadoViaje.preferencias.intereses,
    );

    renderizarRuta(
        resultadoViaje.ciudades,
    );

    renderizarAeropuertos(
        resultadoViaje.aeropuertos,
    );

    renderizarTransportes(
        resultadoViaje.transportes,
    );

    renderizarDistribucionDias(
        resultadoViaje.ciudades,
    );

    renderizarAvisos(
        resultadoViaje.avisos,
    );

    mostrarCargaExplicacionIA();

    seccionEstadoCarga.hidden = true;

    seccionEstadoError.hidden = true;

    seccionResultados.hidden = false;

    try {
        renderizarMapaRuta(
            resultadoViaje.ciudades,
        );
    } catch (errorMapa) {
        renderizarErrorMapa(errorMapa);
    }

    seccionResultados.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}


/* Muestra un error general en la interfaz. */
export function renderizarError(error) {
    seccionEstadoCarga.hidden = true;

    seccionResultados.hidden = true;

    seccionEstadoError.hidden = false;

    mensajeErrorGeneral.textContent =
        error?.message ||
        'No se ha podido generar la ruta.';

    seccionEstadoError.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}