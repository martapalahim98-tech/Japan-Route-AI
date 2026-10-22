/* Japan Route AI
   Selección y organización de la ruta */


/*
    1. Puntuar ciudades.
    2. Seleccionar destinos.
    3. Ordenar la ruta.
    4. Recomendar aeropuertos.
    5. Obtener transportes internos.
    6. Distribuir los días.
    7. Construir el resultado completo.
    8. Comparar vuelos simulados.
    9. Calcular el presupuesto estimado.
*/


/* PUNTUACIÓN DE CIUDADES */

/* Calcula la puntuación de una ciudad según los intereses del usuario. */
function puntuarIntereses(ciudad, preferenciasViaje) {
    let puntuacion = 0;

    const motivos = [];

    preferenciasViaje.intereses.forEach(function (interes) {
        if (ciudad.intereses.includes(interes)) {
            puntuacion += 3;

            motivos.push(
                `Coincide con el interés ${interes}`,
            );
        }
    });

    return {
        puntuacion: puntuacion,
        motivos: motivos,
    };
}


/* Calcula la puntuación según el tipo de experiencia. */
function puntuarTipoExperiencia(ciudad, preferenciasViaje) {
    let puntuacion = 0;

    const motivos = [];

    if (
        ciudad.tiposExperiencia.includes(
            preferenciasViaje.tipoExperiencia,
        )
    ) {
        puntuacion += 2;

        motivos.push(
            `Encaja con una experiencia ${preferenciasViaje.tipoExperiencia}`,
        );
    }

    if (
        preferenciasViaje.tipoExperiencia === 'esencial' &&
        ciudad.esDestinoPrincipal
    ) {
        puntuacion += 2;

        motivos.push(
            'Es uno de los destinos principales de Japón',
        );
    }

    if (
        preferenciasViaje.tipoExperiencia === 'alternativa' &&
        !ciudad.esDestinoPrincipal
    ) {
        puntuacion += 2;

        motivos.push(
            'Ofrece una experiencia menos habitual',
        );
    }

    return {
        puntuacion: puntuacion,
        motivos: motivos,
    };
}


/* Calcula la puntuación según el presupuesto. */
function puntuarPresupuesto(ciudad, preferenciasViaje) {
    let puntuacion = 0;

    const motivos = [];

    const presupuestoCompatible =
        ciudad.nivelesPresupuesto.includes(
            preferenciasViaje.nivelPresupuesto,
        );

    if (presupuestoCompatible) {
        puntuacion += 1;

        motivos.push(
            `Es compatible con un presupuesto ${preferenciasViaje.nivelPresupuesto}`,
        );
    } else {
        puntuacion -= 2;

        motivos.push(
            `Es menos adecuada para un presupuesto ${preferenciasViaje.nivelPresupuesto}`,
        );
    }

    return {
        puntuacion: puntuacion,
        motivos: motivos,
    };
}


/* Calcula la puntuación total de una ciudad. */
export function calcularPuntuacionCiudad(ciudad, preferenciasViaje) {
    const resultadoIntereses =
        puntuarIntereses(
            ciudad,
            preferenciasViaje,
        );

    const resultadoExperiencia =
        puntuarTipoExperiencia(
            ciudad,
            preferenciasViaje,
        );

    const resultadoPresupuesto =
        puntuarPresupuesto(
            ciudad,
            preferenciasViaje,
        );

    const puntuacionTotal =
        resultadoIntereses.puntuacion +
        resultadoExperiencia.puntuacion +
        resultadoPresupuesto.puntuacion;

    const motivos = [
        ...resultadoIntereses.motivos,
        ...resultadoExperiencia.motivos,
        ...resultadoPresupuesto.motivos,
    ];

    return {
        puntuacion: puntuacionTotal,
        motivos: motivos,
    };
}


/* Puntúa todas las ciudades y las ordena de mayor a menor. */
export function puntuarCiudades(ciudades, preferenciasViaje) {

    const ciudadesPuntuadas = ciudades.map(function (ciudad) {

        const resultadoPuntuacion = calcularPuntuacionCiudad(ciudad, preferenciasViaje);

        return {
            ...ciudad,
            puntuacion: resultadoPuntuacion.puntuacion,
            motivosPuntuacion: resultadoPuntuacion.motivos,
        };
    });

    ciudadesPuntuadas.sort(function (ciudadA, ciudadB) {

        if (ciudadB.puntuacion !== ciudadA.puntuacion) {
            return ciudadB.puntuacion - ciudadA.puntuacion;
        }

        return (ciudadA.ordenGeografico - ciudadB.ordenGeografico);
    });

    return ciudadesPuntuadas;
}



/* SELECCIÓN DE DESTINOS */

/* Calcula la cantidad base de destinos según la duración. */
function calcularCantidadBaseDestinos(duracionDias) {
    if (duracionDias <= 9) {
        return 3;
    }

    if (duracionDias <= 14) {
        return 4;
    }

    return 5;
}


/* Ajusta la cantidad de destinos según el ritmo del viaje. */
function ajustarCantidadPorRitmo(cantidadBase, ritmoViaje) {
    let cantidadDestinos = cantidadBase;

    if (ritmoViaje === 'relajado') {
        cantidadDestinos -= 1;
    }

    if (ritmoViaje === 'intenso') {
        cantidadDestinos += 1;
    }

    if (cantidadDestinos < 3) {
        cantidadDestinos = 3;
    }

    if (cantidadDestinos > 5) {
        cantidadDestinos = 5;
    }

    return cantidadDestinos;
}


/* Calcula cuántos destinos debe tener la ruta. */
export function calcularCantidadDestinos(preferenciasViaje) {
    const cantidadBase = calcularCantidadBaseDestinos(preferenciasViaje.duracionDias);

    const cantidadFinal = ajustarCantidadPorRitmo(cantidadBase, preferenciasViaje.ritmoViaje);

    return cantidadFinal;
}


/* Calcula la suma de días mínimos de una lista de ciudades. */
function calcularDiasMinimosTotales(ciudades) {

    return ciudades.reduce(function (total, ciudad) {

        return total + ciudad.diasMinimos;

    }, 0);
}


/* Selecciona las ciudades mejor puntuadas que caben en el viaje. */
export function seleccionarCiudades(ciudadesPuntuadas, preferenciasViaje) {
    
    const cantidadDestinos = calcularCantidadDestinos(preferenciasViaje);

    const ciudadesSeleccionadas = [];

    ciudadesPuntuadas.forEach(function (ciudad) {
        if (ciudadesSeleccionadas.length >= cantidadDestinos) {
            return;
        }

        const seleccionProvisional = [
            ...ciudadesSeleccionadas,
            ciudad,
        ];

        const diasMinimosTotales = calcularDiasMinimosTotales(seleccionProvisional);

        if (diasMinimosTotales <= preferenciasViaje.duracionDias) {

            ciudadesSeleccionadas.push(ciudad);
        }
    });

    if (ciudadesSeleccionadas.length < 3) {
        throw new Error('No se han podido seleccionar suficientes destinos para crear una ruta.',
        );
    }

    return ciudadesSeleccionadas;
}



/* ORDENACIÓN DE LA RUTA */

/* Ordena las ciudades seleccionadas de oeste a este. */
function ordenarCiudadesOesteEste(ciudadesSeleccionadas) {
    return [...ciudadesSeleccionadas].sort(function (ciudadA, ciudadB) {
        return (ciudadA.ordenGeografico - ciudadB.ordenGeografico
        );
    });
}


/* Ordena las ciudades seleccionadas de este a oeste. */
function ordenarCiudadesEsteOeste(ciudadesSeleccionadas) {
    return [...ciudadesSeleccionadas].sort(function (ciudadA, ciudadB) {
        return (ciudadB.ordenGeografico - ciudadA.ordenGeografico);
    });
}


/* Comprueba si la selección contiene destinos del oeste y del este. */
function rutaEntreDosZonas(ciudadesSeleccionadas) {
    const contieneZonaOeste = ciudadesSeleccionadas.some(function (ciudad) {
            return ciudad.ordenGeografico <= 4;
        });

    const contieneZonaEste = ciudadesSeleccionadas.some(function (ciudad) {
            return ciudad.ordenGeografico >= 6;
        });

    return (contieneZonaOeste && contieneZonaEste);
}


/* Decide el sentido inicial del recorrido. */
function determinarSentidoRuta(ciudadesSeleccionadas) {
    if (rutaEntreDosZonas(ciudadesSeleccionadas)) {
        return 'oeste-este';
    }

    const mediaGeografica = ciudadesSeleccionadas.reduce(function (total, ciudad) {
        
        return total + ciudad.ordenGeografico;

    }, 0) / ciudadesSeleccionadas.length;

    if (mediaGeografica > 4.5) {
        return 'este-oeste';
    }

    return 'oeste-este';
}


/* Ordena la ruta según el sentido recomendado. */
export function ordenarRuta(ciudadesSeleccionadas) {
    const sentidoRuta = determinarSentidoRuta(ciudadesSeleccionadas);

    let ciudadesOrdenadas;

    if (sentidoRuta === 'este-oeste') {
        ciudadesOrdenadas = ordenarCiudadesEsteOeste(ciudadesSeleccionadas);
    } else {
        ciudadesOrdenadas = ordenarCiudadesOesteEste(ciudadesSeleccionadas);
    }

    return {
        sentido: sentidoRuta,
        ciudades: ciudadesOrdenadas,
    };
}



/* RECOMENDACIÓN DE AEROPUERTOS */

/* Devuelve la puerta internacional más adecuada para una ciudad. */
function obtenerPuertaInternacional(ciudad) {
    if (ciudad.ordenGeografico <= 4) {
        return {
            codigo: 'KIX',
            nombre: 'Aeropuerto Internacional de Kansai',
            ciudadReferencia: 'Osaka',
            zona: 'oeste',
            alternativas: [],
        };
    }

    return {
        codigo: 'HND',
        nombre: 'Aeropuerto de Haneda',
        ciudadReferencia: 'Tokio',
        zona: 'este',
        alternativas: [
            {
                codigo: 'NRT',
                nombre: 'Aeropuerto Internacional de Narita',
            },
        ],
    };
}


/* Recomienda los aeropuertos de entrada y salida de Japón. */
export function recomendarAeropuertos(rutaOrdenada, preferenciasViaje) {
    if (!rutaOrdenada || rutaOrdenada.length === 0) {
        throw new Error('No se pueden recomendar aeropuertos sin una ruta válida.');
    }

    const primeraCiudad = rutaOrdenada[0];

    const ultimaCiudad = rutaOrdenada[rutaOrdenada.length - 1];

    const aeropuertoEntrada = obtenerPuertaInternacional(primeraCiudad);

    const aeropuertoSalida = obtenerPuertaInternacional(ultimaCiudad);

    const mismoAeropuerto = aeropuertoEntrada.codigo === aeropuertoSalida.codigo;

    let motivo;

    if (mismoAeropuerto) {
        motivo = 'La ruta se concentra en una misma zona de Japón, por lo que se recomienda utilizar el mismo aeropuerto de entrada y salida.';
    } else {
        motivo = 'La ruta utiliza aeropuertos diferentes para avanzar por Japón sin regresar al punto inicial.';
    }

    return {
        origenUsuario: preferenciasViaje.aeropuertoSalida,

        entrada: aeropuertoEntrada,

        salida: aeropuertoSalida,

        mismoAeropuerto: mismoAeropuerto,

        motivo: motivo,
    };
}



/* TRANSPORTES INTERNOS */

/* Busca una conexión entre dos ciudades en ambos sentidos. */
export function buscarConexion(origen, destino, conexiones) {
    const conexionEncontrada = conexiones.find(function (conexion) {
            const direccionNormal = conexion.origen === origen && conexion.destino === destino;

            const direccionInversa =
                conexion.origen === destino &&
                conexion.destino === origen &&
                conexion.bidireccional === true;

            return (
                direccionNormal || direccionInversa
            );
        });

    return conexionEncontrada || null;
}


/* Crea una conexión no disponible para evitar bloquear la ruta. */
function crearConexionNoDisponible(ciudadOrigen, ciudadDestino) {
    return {
        id: null,
        origen: ciudadOrigen.id,
        destino: ciudadDestino.id,
        nombreOrigen: ciudadOrigen.nombre,
        nombreDestino: ciudadDestino.nombre,
        estacionOrigen: ciudadOrigen.estacionPrincipal.nombre,
        estacionDestino: ciudadDestino.estacionPrincipal.nombre,
        medio: 'Conexión no registrada',
        duracionMinutos: null,
        precioAproximadoYenes: null,
        transbordos: null,
        disponible: false,
        bidireccional: false,
        conexionEnSentidoInverso: false,
        tipoDato: null,
        fechaVerificacion: null,
        fuentesReferencia: [],
        mensaje: 'No se dispone de información aproximada para este trayecto.',
    };
}


/* Prepara una conexión encontrada para mostrarla en la ruta. */
function prepararConexionEncontrada(conexion, ciudadOrigen, ciudadDestino) {
    const conexionEnSentidoInverso =
        conexion.origen === ciudadDestino.id &&
        conexion.destino === ciudadOrigen.id;

    let estacionOrigen = conexion.estacionOrigen;

    let estacionDestino = conexion.estacionDestino;

    if (conexionEnSentidoInverso) {
        estacionOrigen = conexion.estacionDestino;

        estacionDestino = conexion.estacionOrigen;
    }

    return {
        id: conexion.id,
        origen: ciudadOrigen.id,
        destino: ciudadDestino.id,
        nombreOrigen: ciudadOrigen.nombre,
        nombreDestino: ciudadDestino.nombre,
        estacionOrigen: estacionOrigen,
        estacionDestino: estacionDestino,
        medio: conexion.medio,
        duracionMinutos: conexion.duracionMinutos,
        precioAproximadoYenes: conexion.precioAproximadoYenes,
        transbordos: conexion.transbordos,
        disponible: true,
        bidireccional: conexion.bidireccional,
        conexionEnSentidoInverso: conexionEnSentidoInverso,
        tipoDato: conexion.tipoDato,
        fechaVerificacion: conexion.fechaVerificacion,
        fuentesReferencia: conexion.fuentesReferencia,
    };
}


/* Obtiene los transportes entre las ciudades de la ruta. */
export function obtenerTransportesRuta(rutaOrdenada, conexiones) {
    if (
        !Array.isArray(rutaOrdenada) ||
        rutaOrdenada.length < 2
    ) {
        throw new Error('La ruta debe contener al menos dos ciudades para calcular transportes.');
    }

    if (!Array.isArray(conexiones) || conexiones.length === 0) {
        throw new Error(
            'No hay conexiones disponibles para calcular los transportes.',
        );
    }

    const transportes = [];

    for (let indice = 0; indice < rutaOrdenada.length - 1; indice++) {
        const ciudadOrigen = rutaOrdenada[indice];

        const ciudadDestino = rutaOrdenada[indice + 1];

        const conexion = buscarConexion(
            ciudadOrigen.id,
            ciudadDestino.id,
            conexiones,
        );

        if (!conexion) {
            transportes.push(crearConexionNoDisponible(ciudadOrigen, ciudadDestino));

            continue;
        }

        transportes.push(prepararConexionEncontrada(conexion, ciudadOrigen, ciudadDestino));
    }

    return transportes;
}



/* DISTRIBUCIÓN DE DÍAS */

/* Ordena las ciudades según la prioridad para recibir un día adicional. */
function ordenarPrioridadDias(ciudades, ritmoViaje) {
    return [...ciudades].sort(function (ciudadA, ciudadB) {
        if (ritmoViaje === 'relajado') {
            if (ciudadA.puntuacion !== ciudadB.puntuacion
            ) {
                return (ciudadB.puntuacion - ciudadA.puntuacion);
            }

            return (ciudadA.diasAsignados - ciudadB.diasAsignados);
        }

        if (ritmoViaje === 'intenso') {
            if (ciudadA.diasAsignados !== ciudadB.diasAsignados) {
                return (ciudadA.diasAsignados - ciudadB.diasAsignados);
            }

            return (ciudadB.puntuacion - ciudadA.puntuacion);
        }

        const proporcionA = ciudadA.diasAsignados / ciudadA.diasRecomendados;

        const proporcionB = ciudadB.diasAsignados / ciudadB.diasRecomendados;

        if (proporcionA !== proporcionB) {
            return proporcionA - proporcionB;
        }

        return (ciudadB.puntuacion - ciudadA.puntuacion);
    });
}


/* Selecciona la siguiente ciudad que recibirá un día adicional. */
function seleccionarCiudadParaDiaExtra(ciudades, ritmoViaje, respetarDiasRecomendados) {
    let ciudadesDisponibles = ciudades;

    if (respetarDiasRecomendados) {
        ciudadesDisponibles = ciudades.filter(function (ciudad) {
            return (ciudad.diasAsignados < ciudad.diasRecomendados);
        });
    }

    if (ciudadesDisponibles.length === 0) {
        return null;
    }

    const ciudadesOrdenadas = ordenarPrioridadDias(ciudadesDisponibles, ritmoViaje);

    return ciudadesOrdenadas[0];
}


/* Añade el día inicial y final de cada parada. */
function asignarTramosDias(ciudades) {
    let diaActual = 1;

    return ciudades.map(function (ciudad) {
        const diaInicio = diaActual;

        const diaFin = diaInicio + ciudad.diasAsignados - 1;

        diaActual = diaFin + 1;

        return {
            ...ciudad,
            diaInicio: diaInicio,
            diaFin: diaFin,
        };
    });
}


/* Distribuye la duración total entre las ciudades de la ruta. */
export function distribuirDiasRuta(rutaOrdenada, preferenciasViaje) {
    if (
        !Array.isArray(rutaOrdenada) ||
        rutaOrdenada.length === 0
    ) {
        throw new Error('No se pueden distribuir días sin una ruta válida.');
    }

    const diasMinimosTotales = calcularDiasMinimosTotales(rutaOrdenada);

    if (diasMinimosTotales > preferenciasViaje.duracionDias) {
        throw new Error('La duración del viaje no permite cumplir los días mínimos de la ruta.');
    }

    const ciudadesConDias = rutaOrdenada.map(function (ciudad) {
            return {
                ...ciudad,
                diasAsignados: ciudad.diasMinimos,
            };
        });

    let diasPendientes = preferenciasViaje.duracionDias -diasMinimosTotales;

    while (diasPendientes > 0) {
        const ciudadPrioritaria = seleccionarCiudadParaDiaExtra(
                ciudadesConDias,
                preferenciasViaje.ritmoViaje,
                true,
            );

        if (!ciudadPrioritaria) {
            break;
        }

        ciudadPrioritaria.diasAsignados++;

        diasPendientes--;
    }

    while (diasPendientes > 0) {
        const ciudadPrioritaria = seleccionarCiudadParaDiaExtra(ciudadesConDias, preferenciasViaje.ritmoViaje, false);

        if (!ciudadPrioritaria) {
            throw new Error('No se ha podido completar la distribución de días.');
        }

        ciudadPrioritaria.diasAsignados++;

        diasPendientes--;
    }

    const ciudadesConTramos = asignarTramosDias( ciudadesConDias);

    const totalDiasAsignados = ciudadesConTramos.reduce(function (total, ciudad) {
        return total + ciudad.diasAsignados;
    }, 0);

    if (totalDiasAsignados !== preferenciasViaje.duracionDias) {
        throw new Error('La distribución de días no coincide con la duración del viaje.');
    }

    return ciudadesConTramos;
}



/* RESULTADO COMPLETO DEL VIAJE */

/* Calcula la suma de los días asignados. */
function calcularTotalDiasAsignados(ciudades) {
    return ciudades.reduce(function (total, ciudad) {
        return total + ciudad.diasAsignados;
    }, 0);
}


/* Calcula la duración total de los transportes disponibles. */
function calcularDuracionTransportes(transportes) {
    return transportes.reduce(function (total, transporte) {
        if (transporte.disponible && typeof transporte.duracionMinutos === 'number') {
            return (total + transporte.duracionMinutos);
        }

        return total;
    }, 0);
}


/* Calcula el precio aproximado de los transportes por persona. */
function calcularPrecioTransportes(transportes) {
    return transportes.reduce(function (total, transporte) {
        if (transporte.disponible && typeof transporte.precioAproximadoYenes === 'number'
        ) {
            return (total + transporte.precioAproximadoYenes);
        }

        return total;
    }, 0);
}


/* Genera avisos relacionados con el resultado del viaje. */
function generarAvisosResultado(ciudades, transportes) {
    const avisos = [];

    const transportesNoDisponibles = transportes.filter(function (transporte) {
            return !transporte.disponible;
        });

    if (transportesNoDisponibles.length > 0) {
        avisos.push('Uno o más trayectos no tienen información de transporte registrada.');
    }

    const ciudadesSobreRecomendacion = ciudades.filter(function (ciudad) {
            return (ciudad.diasAsignados > ciudad.diasRecomendados);
        });

    if (ciudadesSobreRecomendacion.length > 0) {
        avisos.push('Algunas ciudades tienen más días asignados que los recomendados inicialmente.');
    }

    avisos.push('Los tiempos y precios de transporte son aproximados.');

    return avisos;
}


/* Comprueba que el resultado contiene datos coherentes. */
function validarResultadoViaje(preferenciasViaje, resultadoRuta, aeropuertosRecomendados, rutaConDias, transportesRuta) {
    if (!preferenciasViaje || typeof preferenciasViaje !== 'object') {
        throw new Error('Las preferencias del viaje no son válidas.');
    }

    if (!resultadoRuta || typeof resultadoRuta.sentido !== 'string') {
        throw new Error(
            'El resultado de la ruta no es válido.',
        );
    }

    if (
        !aeropuertosRecomendados ||
        !aeropuertosRecomendados.entrada ||
        !aeropuertosRecomendados.salida
    ) {
        throw new Error('Los aeropuertos recomendados no son válidos.');
    }

    if (!Array.isArray(rutaConDias) || rutaConDias.length === 0
    ) {
        throw new Error('La ruta con días no es válida.');
    }

    if (!Array.isArray(transportesRuta)) {
        throw new Error('Los transportes de la ruta no son válidos.');
    }

    if (
        transportesRuta.length !== rutaConDias.length - 1
    ) {
        throw new Error('La cantidad de transportes no coincide con la cantidad de destinos.');
    }

    const totalDiasAsignados = calcularTotalDiasAsignados(rutaConDias);

    if (totalDiasAsignados !== preferenciasViaje.duracionDias) {
        throw new Error('Los días asignados no coinciden con la duración del viaje.');
    }

    const primeraCiudad = rutaConDias[0];

    const ultimaCiudad = rutaConDias[rutaConDias.length - 1];

    if (primeraCiudad.diaInicio !== 1) {
        throw new Error('La ruta no comienza en el primer día del viaje.');
    }

    if ( ultimaCiudad.diaFin !== preferenciasViaje.duracionDias) {
        throw new Error('La ruta no termina en el último día del viaje.');
    }

    return true;
}


/* Construye el objeto con el resultado completo del viaje. */
export function crearResultadoViaje(preferenciasViaje, resultadoRuta, aeropuertosRecomendados, rutaConDias, transportesRuta) {
    validarResultadoViaje(
        preferenciasViaje,
        resultadoRuta,
        aeropuertosRecomendados,
        rutaConDias,
        transportesRuta,
    );

    const totalDiasAsignados = calcularTotalDiasAsignados(rutaConDias);

    const duracionTransportesMinutos =calcularDuracionTransportes(transportesRuta);

    const precioTransportesYenesPorPersona = calcularPrecioTransportes(transportesRuta);

    const precioTransportesYenesTotal = precioTransportesYenesPorPersona * preferenciasViaje.numeroViajeros;

    const avisos = generarAvisosResultado(rutaConDias, transportesRuta);

    return {
        id: `ruta-${Date.now()}`,

        fechaGeneracion: new Date().toISOString(),

        preferencias: {
            ...preferenciasViaje,
            intereses: [...preferenciasViaje.intereses],
        },

        resumen: {
            duracionDias: preferenciasViaje.duracionDias,

            diasAsignados: totalDiasAsignados,

            cantidadDestinos: rutaConDias.length,

            cantidadTransportes: transportesRuta.length,

            sentidoRuta: resultadoRuta.sentido,

            duracionTransportesMinutos: duracionTransportesMinutos,

            precioTransportesYenesPorPersona: precioTransportesYenesPorPersona,

            precioTransportesYenesTotal: precioTransportesYenesTotal,
        },

        aeropuertos: {
            ...aeropuertosRecomendados,
        },

        ciudades: rutaConDias.map(function (ciudad) {
            return {
                ...ciudad,
                intereses: [...ciudad.intereses],
                tiposExperiencia: [...ciudad.tiposExperiencia],
                nivelesPresupuesto: [...ciudad.nivelesPresupuesto],
            };
        }),

        transportes: transportesRuta.map(function (transporte) {
                return {
                    ...transporte,
                    fuentesReferencia: [...transporte.fuentesReferencia],
                };
            }),

        avisos: avisos,
    };
}



/* COMPARACIÓN DE VUELOS */

/* Copia una opción y añade su precio total. */
function prepararOpcionVuelo(vuelo, numeroViajeros) {
    return {
        ...vuelo,
        precioTotal: vuelo.precioPorPersona * numeroViajeros,
    };
}


/* Calcula una puntuación para comparar precio, duración y escalas. */
function calcularPuntuacionVuelo(vuelo, prioridadVuelo) {
    if (prioridadVuelo === 'precio') {
        return (
            vuelo.precioPorPersona + vuelo.duracionMinutos * 0.05 + vuelo.escalas * 60
        );
    }

    if (prioridadVuelo === 'rapidez') {
        return (vuelo.duracionMinutos + vuelo.precioPorPersona * 0.2 + vuelo.escalas * 120
        );
    }

    return (
        vuelo.precioPorPersona * 0.6 + vuelo.duracionMinutos * 0.35 + vuelo.escalas * 90
    );
}


/* Devuelve el motivo por el que se recomienda un vuelo. */
function obtenerMotivoVuelo(prioridadVuelo) {
    if (prioridadVuelo === 'precio') {
        return 'Es la opción que mejor prioriza el ahorro.';
    }

    if (prioridadVuelo === 'rapidez') {
        return 'Es la opción que mejor prioriza la duración y las escalas.';
    }

    return 'Ofrece el mejor equilibrio entre precio, duración y escalas.';
}


/* Compara los vuelos compatibles y selecciona las mejores opciones. */
export function compararVuelos(vuelos, preferenciasViaje, aeropuertosRecomendados) {
    if (!Array.isArray(vuelos)) {
        throw new Error(
            'Los datos de vuelos no son válidos.',
        );
    }

    const origen = preferenciasViaje.aeropuertoSalida;

    const destino = aeropuertosRecomendados.entrada.codigo;

    let vuelosCompatibles = vuelos.filter(function (vuelo) {
        return (vuelo.origen === origen && vuelo.destino === destino);
    });

    if (vuelosCompatibles.length === 0 && destino === 'NRT') {

        vuelosCompatibles = vuelos.filter(function (vuelo) {
            return (vuelo.origen === origen && vuelo.destino === 'HND');
        });
    }

    if (vuelosCompatibles.length === 0) {
        throw new Error('No hay vuelos locales compatibles con esta búsqueda.');
    }

    const vuelosPreparados = vuelosCompatibles.map(function (vuelo) {
        return prepararOpcionVuelo(vuelo, preferenciasViaje.numeroViajeros);
    });

    const vuelosPorPrecio = [...vuelosPreparados].sort(function (vueloA, vueloB) {
        return (vueloA.precioPorPersona - vueloB.precioPorPersona
        );
    });

    const vuelosPorDuracion = [...vuelosPreparados].sort(function (vueloA, vueloB) {
        return (vueloA.duracionMinutos -vueloB.duracionMinutos
        );
    });

    const vuelosPorRecomendacion = [...vuelosPreparados].sort(function (vueloA, vueloB) {
        const puntuacionA = calcularPuntuacionVuelo(
            vueloA, preferenciasViaje.prioridadVuelo,
        );

        const puntuacionB = calcularPuntuacionVuelo(
            vueloB, preferenciasViaje.prioridadVuelo
        );

        return puntuacionA - puntuacionB;
    });

    return {
        disponible: true,
        origenDatos: 'local-respaldo',
        esInformacionReal: false,
        moneda: 'EUR',
        origen: origen,
        destino: destino,
        fechaIda: preferenciasViaje.fechaIda,
        fechaVuelta: preferenciasViaje.fechaVuelta,
        numeroViajeros: preferenciasViaje.numeroViajeros,

        opciones: {
            masBarato: vuelosPorPrecio[0],
            masRapido: vuelosPorDuracion[0],

            recomendado: {
                ...vuelosPorRecomendacion[0],
                motivo: obtenerMotivoVuelo(preferenciasViaje.prioridadVuelo),
            },
        },

        aviso: 'Las opciones de vuelo son datos simulados para demostrar el funcionamiento del prototipo. No representan precios ni disponibilidad reales.',
    };
}



/* ESTIMACIÓN DEL PRESUPUESTO */

const ESTIMACIONES_POR_NIVEL = {
    ajustado: {
        alojamientoPorDia: 55,
        comidaPorDia: 30,
        actividadesPorDia: 15,
    },

    medio: {
        alojamientoPorDia: 95,
        comidaPorDia: 45,
        actividadesPorDia: 30,
    },

    alto: {
        alojamientoPorDia: 160,
        comidaPorDia: 75,
        actividadesPorDia: 50,
    },
};


/* Redondea un importe monetario a dos decimales. */
function redondearImporte(importe) {
    return Math.round(importe * 100) / 100;
}


/* Convierte yenes a euros. */
function convertirYenesAEuros(importeYenes, yenesPorEuro) {
    if (
        typeof importeYenes !== 'number' ||
        typeof yenesPorEuro !== 'number' ||
        yenesPorEuro <= 0
    ) {
        return 0;
    }

    return redondearImporte(importeYenes / yenesPorEuro);
}


/* Obtiene el vuelo recomendado si está disponible. */
function obtenerVueloParaPresupuesto(resultadoViaje) {
    if (
        !resultadoViaje.vuelos ||
        !resultadoViaje.vuelos.disponible ||
        !resultadoViaje.vuelos.opciones ||
        !resultadoViaje.vuelos.opciones.recomendado
    ) {
        return null;
    }

    return resultadoViaje.vuelos.opciones.recomendado;
}


/* Determina cómo encaja la estimación con el presupuesto disponible. */
function calcularEstadoPresupuesto(totalPorPersona, presupuestoDisponible, presupuestoCompleto) {
    if (!presupuestoCompleto) {
        return {
            codigo: 'incompleto',
            titulo: 'Estimación incompleta',
            mensaje: 'No se ha podido incluir el coste del vuelo en la estimación.',
        };
    }

    const porcentajeUtilizado = (totalPorPersona / presupuestoDisponible) * 100;

    if (porcentajeUtilizado <= 85) {
        return {
            codigo: 'holgado',
            titulo: 'Presupuesto suficiente',
            mensaje: 'La estimación queda por debajo del presupuesto con un margen razonable.',
        };
    }

    if (porcentajeUtilizado <= 100) {
        return {
            codigo: 'ajustado',
            titulo: 'Presupuesto ajustado',
            mensaje: 'La estimación entra en el presupuesto, pero deja poco margen para gastos imprevistos.',
        };
    }

    return {
        codigo: 'superado',
        titulo: 'Presupuesto superado',
        mensaje: 'La estimación supera el presupuesto indicado por persona.',
    };
}


/* Genera los avisos relacionados con el presupuesto. */
function generarAvisosPresupuesto(resultadoViaje, tipoCambio, vueloRecomendado, estadoPresupuesto) {
    const avisos = [
        'El alojamiento, la comida y las actividades son estimaciones orientativas del prototipo.',
        'Los precios reales pueden variar según fechas, disponibilidad y decisiones del viajero.',
    ];

    if (tipoCambio.esRespaldo) {
        avisos.push(tipoCambio.aviso);
    }

    if (!vueloRecomendado) {
        avisos.push('El total no incluye vuelos porque no existe una opción disponible.');
    }

    if (estadoPresupuesto.codigo === 'superado') {
        avisos.push('Conviene reducir algún gasto o aumentar el presupuesto disponible.');
    }

    const ciudadesSobreRecomendacion = resultadoViaje.ciudades.some(function (ciudad) {
        return (ciudad.diasAsignados > ciudad.diasRecomendados);
    });

    if (ciudadesSobreRecomendacion) {
        avisos.push('Algunas ciudades tienen más días asignados que los recomendados y pueden aumentar los gastos de estancia.');
    }

    return avisos;
}


/* Calcula la estimación económica completa del viaje. */
export function calcularPresupuestoViaje(resultadoViaje, tipoCambio) {
    if (!resultadoViaje || typeof resultadoViaje !== 'object') {
        throw new Error(
            'No se puede calcular el presupuesto sin un resultado de viaje válido.',
        );
    }

    if (
        !tipoCambio ||
        typeof tipoCambio.yenesPorEuro !== 'number' ||
        tipoCambio.yenesPorEuro <= 0
    ) {
        throw new Error('El tipo de cambio utilizado no es válido.');
    }

    const nivelPresupuesto = resultadoViaje.preferencias.nivelPresupuesto;

    const estimaciones = ESTIMACIONES_POR_NIVEL[nivelPresupuesto];

    if (!estimaciones) {
        throw new Error('No existe una estimación para el nivel de presupuesto seleccionado.');
    }

    const duracionDias = resultadoViaje.resumen.duracionDias;

    const numeroViajeros = resultadoViaje.preferencias.numeroViajeros;

    const presupuestoDisponiblePorPersona = resultadoViaje.preferencias.presupuestoPorPersona;

    const vueloRecomendado = obtenerVueloParaPresupuesto(resultadoViaje);

    const vuelosPorPersona = vueloRecomendado
        ? vueloRecomendado.precioPorPersona
        : 0;

    const alojamientoPorPersona = estimaciones.alojamientoPorDia * duracionDias;

    const comidaPorPersona = estimaciones.comidaPorDia * duracionDias;

    const actividadesPorPersona = estimaciones.actividadesPorDia * duracionDias;

    const transporteInternoYenesPorPersona = resultadoViaje.resumen.precioTransportesYenesPorPersona;

    const transporteInternoPorPersona = convertirYenesAEuros(transporteInternoYenesPorPersona, tipoCambio.yenesPorEuro);

    const totalPorPersona =redondearImporte(
        vuelosPorPersona +
        alojamientoPorPersona +
        transporteInternoPorPersona +
        comidaPorPersona +
        actividadesPorPersona,
    );

    const totalGrupo = redondearImporte(totalPorPersona * numeroViajeros);

    const presupuestoDisponibleGrupo = presupuestoDisponiblePorPersona * numeroViajeros;

    const diferenciaPorPersona = redondearImporte(presupuestoDisponiblePorPersona - totalPorPersona);

    const diferenciaGrupo = redondearImporte(presupuestoDisponibleGrupo - totalGrupo);

    const porcentajeUtilizado = redondearImporte(
        (totalPorPersona / presupuestoDisponiblePorPersona) * 100);

    const presupuestoCompleto = Boolean(vueloRecomendado);

    const estado = calcularEstadoPresupuesto(
        totalPorPersona,
        presupuestoDisponiblePorPersona,
        presupuestoCompleto,
    );

    const avisos = generarAvisosPresupuesto(
        resultadoViaje,
        tipoCambio,
        vueloRecomendado,
        estado,
    );

    return {
        disponible: true,
        esEstimacionCompleta: presupuestoCompleto,
        nivelPresupuesto: nivelPresupuesto,
        duracionDias: duracionDias,
        numeroViajeros: numeroViajeros,

        tipoCambio: {
            ...tipoCambio,
        },

        costesPorPersona: {
            vuelos: redondearImporte(vuelosPorPersona,
                ),

            alojamiento: redondearImporte(alojamientoPorPersona),

            transporteInterno: transporteInternoPorPersona,

            comida: redondearImporte(comidaPorPersona),

            actividades: redondearImporte(actividadesPorPersona),
        },

        costesGrupo: {
            vuelos: redondearImporte(vuelosPorPersona * numeroViajeros),

            alojamiento:
                redondearImporte(alojamientoPorPersona * numeroViajeros),

            transporteInterno: redondearImporte(transporteInternoPorPersona * numeroViajeros),

            comida: redondearImporte(comidaPorPersona * numeroViajeros),

            actividades: redondearImporte(actividadesPorPersona * numeroViajeros),
        },

        transporteInterno: {
            yenesPorPersona: transporteInternoYenesPorPersona,

            eurosPorPersona: transporteInternoPorPersona,

            yenesPorEuro: tipoCambio.yenesPorEuro,
        },

        resumen: {
            totalEstimadoPorPersona: totalPorPersona,

            totalEstimadoGrupo: totalGrupo,

            presupuestoDisponiblePorPersona: presupuestoDisponiblePorPersona,

            presupuestoDisponibleGrupo: presupuestoDisponibleGrupo,

            diferenciaPorPersona: diferenciaPorPersona,

            diferenciaGrupo: diferenciaGrupo,

            porcentajeUtilizado: porcentajeUtilizado,
        },

        estado: estado,

        avisos: avisos,
    };
}