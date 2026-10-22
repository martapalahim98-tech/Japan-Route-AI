/* Japan Route AI
   Integración con Ollama y el servicio de cambio de divisas */


/*
    1. Preparar los datos enviados a la IA.
    2. Construir el prompt de explicación.
    3. Consultar Ollama y validar su respuesta.
    4. Consultar el tipo de cambio EUR / JPY.
    5. Aplicar un cambio local de respaldo si la API falla.
*/


/* CONFIGURACIÓN DE OLLAMA */

const URL_OLLAMA = 'http://127.0.0.1:11434/api/generate';

const MODELO_OLLAMA = 'qwen3:4b-instruct';

const TIEMPO_MAXIMO_OLLAMA = 60000;


/* CONFIGURACIÓN DEL TIPO DE CAMBIO */

const URL_TIPO_CAMBIO =
    'https://api.frankfurter.dev/v2/rate/EUR/JPY';

const TIPO_CAMBIO_RESPALDO = 185;


/* FUNCIONES AUXILIARES */

/* Comprueba que un valor es un objeto válido y no es un array. */
function esObjetoValido(valor) {
    return (
        valor !== null &&
        typeof valor === 'object' &&
        !Array.isArray(valor)
    );
}


/* Comprueba que un valor es un texto que contiene información. */
function esTextoValido(valor) {
    return (
        typeof valor === 'string' &&
        valor.trim() !== ''
    );
}


/* PREPARACIÓN DE DATOS PARA LA IA */

/* Devuelve únicamente los datos necesarios para explicar la ruta. */
function prepararContextoIA(resultadoViaje) {
    return {
        duracionDias:
            resultadoViaje.resumen.duracionDias,

        numeroViajeros:
            resultadoViaje.preferencias.numeroViajeros,

        presupuestoPorPersona:
            resultadoViaje.preferencias.presupuestoPorPersona,

        nivelPresupuesto:
            resultadoViaje.preferencias.nivelPresupuesto,

        intereses: [
            ...resultadoViaje.preferencias.intereses,
        ],

        ritmoViaje:
            resultadoViaje.preferencias.ritmoViaje,

        tipoExperiencia:
            resultadoViaje.preferencias.tipoExperiencia,

        prioridadVuelo:
            resultadoViaje.preferencias.prioridadVuelo,

        sentidoRuta:
            resultadoViaje.resumen.sentidoRuta,

        aeropuertoEntrada: {
            codigo:
                resultadoViaje.aeropuertos.entrada.codigo,

            ciudadReferencia:
                resultadoViaje.aeropuertos.entrada.ciudadReferencia,
        },

        aeropuertoSalida: {
            codigo:
                resultadoViaje.aeropuertos.salida.codigo,

            ciudadReferencia:
                resultadoViaje.aeropuertos.salida.ciudadReferencia,
        },

        motivoAeropuertos:
            resultadoViaje.aeropuertos.motivo,

        ciudades:
            resultadoViaje.ciudades.map(function (ciudad) {
                return {
                    nombre:
                        ciudad.nombre,

                    diasAsignados:
                        ciudad.diasAsignados,

                    diaInicio:
                        ciudad.diaInicio,

                    diaFin:
                        ciudad.diaFin,

                    puntuacion:
                        ciudad.puntuacion,

                    motivosPuntuacion: [
                        ...ciudad.motivosPuntuacion,
                    ],
                };
            }),

        transportes:
            resultadoViaje.transportes.map(function (transporte) {
                return {
                    origen:
                        transporte.nombreOrigen,

                    destino:
                        transporte.nombreDestino,

                    medio:
                        transporte.medio,

                    duracionMinutos:
                        transporte.duracionMinutos,

                    transbordos:
                        transporte.transbordos,

                    disponible:
                        transporte.disponible,
                };
            }),

        avisos: [
            ...resultadoViaje.avisos,
        ],
    };
}


/* CONSTRUCCIÓN DEL PROMPT */

/* Construye el prompt utilizando los datos calculados por JavaScript. */
function construirPromptExplicacion(contextoIA) {
    const lineasPrompt = [
        'Actúa como un asistente especializado en planificación de viajes por Japón.',
        '',
        'Tu tarea es explicar una ruta que ya ha sido calculada y validada por una aplicación JavaScript.',
        '',
        'REGLAS OBLIGATORIAS:',
        '',
        '- Responde en castellano.',
        '- Escribe con ortografía española correcta, incluyendo todas las tildes necesarias.',
        '- Evita frases promocionales o genéricas.',
        '- No cambies ninguna ciudad.',
        '- No cambies el orden de la ruta.',
        '- No cambies los días asignados.',
        '- No inventes precios, horarios, vuelos, actividades ni transportes.',
        '- No contradigas los datos recibidos.',
        '- No afirmes que se han realizado reservas.',
        '- No utilices Markdown.',
        '- No incluyas títulos dentro de los textos.',
        '- No menciones que eres un modelo de lenguaje.',
        '- Utiliza un tono claro, cercano y profesional.',
        '- Explica de forma breve y concreta.',
        '- Devuelve únicamente un objeto JSON válido.',
        '',
        'El JSON debe contener exactamente:',
        '',
        '{',
        '    "titulo": "Una frase breve de máximo 8 palabras",',
        '    "resumen": "Un párrafo breve de máximo 45 palabras",',
        '    "motivos": [',
        '        "Primer motivo de máximo 30 palabras",',
        '        "Segundo motivo de máximo 30 palabras",',
        '        "Tercer motivo de máximo 30 palabras"',
        '    ],',
        '    "consejo": "Un consejo práctico de máximo 35 palabras"',
        '}',
        '',
        'DATOS VALIDADOS DEL VIAJE:',
        '',
        JSON.stringify(
            contextoIA,
            null,
            2,
        ),
    ];

    return lineasPrompt.join('\n');
}


/* VALIDACIÓN DE LA RESPUESTA DE IA */

/* Comprueba que los motivos son tres textos válidos. */
function validarMotivosExplicacion(motivos) {
    if (
        !Array.isArray(motivos) ||
        motivos.length !== 3
    ) {
        return false;
    }

    return motivos.every(function (motivo) {
        return esTextoValido(motivo);
    });
}


/* Comprueba que Ollama ha devuelto la estructura solicitada. */
function validarExplicacionIA(explicacion) {
    if (!esObjetoValido(explicacion)) {
        return false;
    }

    if (!esTextoValido(explicacion.titulo)) {
        return false;
    }

    if (!esTextoValido(explicacion.resumen)) {
        return false;
    }

    if (!validarMotivosExplicacion(explicacion.motivos)) {
        return false;
    }

    if (!esTextoValido(explicacion.consejo)) {
        return false;
    }

    return true;
}


/* ERRORES DE OLLAMA */

/* Devuelve un mensaje comprensible según el error recibido. */
function crearErrorOllama(respuesta, datosError) {
    if (respuesta.status === 404) {
        return new Error(
            `No se ha encontrado el modelo ${MODELO_OLLAMA} en Ollama.`,
        );
    }

    if (
        esObjetoValido(datosError) &&
        esTextoValido(datosError.error)
    ) {
        return new Error(
            datosError.error,
        );
    }

    return new Error(
        `Ollama ha respondido con el estado ${respuesta.status}.`,
    );
}


/* Intenta obtener el contenido del error devuelto por Ollama. */
async function obtenerDatosErrorOllama(respuesta) {
    try {
        return await respuesta.json();
    } catch {
        return null;
    }
}


/* Convierte el texto generado por Ollama en un objeto JavaScript. */
function convertirRespuestaIA(textoRespuesta) {
    try {
        return JSON.parse(textoRespuesta);
    } catch {
        throw new Error(
            'Qwen no ha devuelto un JSON válido.',
        );
    }
}


/* GENERACIÓN DE LA EXPLICACIÓN CON OLLAMA */

/* Solicita a Qwen una explicación estructurada del resultado. */
export async function generarExplicacionIA(resultadoViaje) {
    if (
        !esObjetoValido(resultadoViaje) ||
        !Array.isArray(resultadoViaje.ciudades) ||
        resultadoViaje.ciudades.length === 0
    ) {
        throw new Error(
            'No se puede generar una explicación sin un viaje válido.',
        );
    }

    const controlador = new AbortController();

    const temporizador = setTimeout(function () {
        controlador.abort();
    }, TIEMPO_MAXIMO_OLLAMA);

    try {
        const contextoIA =
            prepararContextoIA(
                resultadoViaje,
            );

        const prompt =
            construirPromptExplicacion(
                contextoIA,
            );

        const respuesta = await fetch(
            URL_OLLAMA,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    model:
                        MODELO_OLLAMA,

                    prompt:
                        prompt,

                    stream:
                        false,

                    format: {
                        type: 'object',

                        properties: {
                            titulo: {
                                type: 'string',
                            },

                            resumen: {
                                type: 'string',
                            },

                            motivos: {
                                type: 'array',

                                items: {
                                    type: 'string',
                                },

                                minItems: 3,
                                maxItems: 3,
                            },

                            consejo: {
                                type: 'string',
                            },
                        },

                        required: [
                            'titulo',
                            'resumen',
                            'motivos',
                            'consejo',
                        ],
                    },

                    options: {
                        temperature: 0.3,
                        num_predict: 350,
                    },

                    keep_alive: '5m',
                }),

                signal:
                    controlador.signal,
            },
        );

        if (!respuesta.ok) {
            const datosError =
                await obtenerDatosErrorOllama(
                    respuesta,
                );

            throw crearErrorOllama(
                respuesta,
                datosError,
            );
        }

        const datosRespuesta =
            await respuesta.json();

        if (
            !esObjetoValido(datosRespuesta) ||
            !esTextoValido(datosRespuesta.response)
        ) {
            throw new Error(
                'Qwen ha devuelto una respuesta vacía.',
            );
        }

        const explicacion =
            convertirRespuestaIA(
                datosRespuesta.response,
            );

        if (!validarExplicacionIA(explicacion)) {
            throw new Error(
                'La explicación generada no contiene la estructura esperada.',
            );
        }

        return {
            disponible: true,
            modelo: MODELO_OLLAMA,
            origen: 'ollama-local',
            titulo: explicacion.titulo.trim(),
            resumen: explicacion.resumen.trim(),

            motivos:
                explicacion.motivos.map(function (motivo) {
                    return motivo.trim();
                }),

            consejo:
                explicacion.consejo.trim(),
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(
                'Qwen ha tardado demasiado en responder.',
            );
        }

        if (error instanceof TypeError) {
            throw new Error(
                'No se ha podido conectar con Ollama. Comprueba que esté abierto.',
            );
        }

        throw error;
    } finally {
        clearTimeout(
            temporizador,
        );
    }
}


/* TIPO DE CAMBIO EUR / JPY */

/* Comprueba que la respuesta contiene una tasa de cambio válida. */
function validarTipoCambio(datosCambio) {
    return (
        esObjetoValido(datosCambio) &&
        datosCambio.base === 'EUR' &&
        datosCambio.quote === 'JPY' &&
        typeof datosCambio.rate === 'number' &&
        Number.isFinite(datosCambio.rate) &&
        datosCambio.rate > 0
    );
}


/* Devuelve un cambio local para que el presupuesto pueda calcularse. */
function crearTipoCambioRespaldo(error) {
    console.warn(
        'Se utilizará el tipo de cambio local de respaldo:',
        error,
    );

    return {
        disponible: true,
        origenDatos: 'local-respaldo',
        esRespaldo: true,
        base: 'EUR',
        destino: 'JPY',
        yenesPorEuro: TIPO_CAMBIO_RESPALDO,
        fecha: null,
        aviso:
            'No se ha podido consultar el cambio actual. ' +
            'Se utiliza una conversión local orientativa.',
    };
}


/* Consulta el cambio EUR / JPY y aplica respaldo si la API falla. */
export async function obtenerTipoCambioEURJPY() {
    try {
        const respuesta =
            await fetch(
                URL_TIPO_CAMBIO,
            );

        if (!respuesta.ok) {
            throw new Error(
                `La API de divisas ha respondido con el estado ${respuesta.status}.`,
            );
        }

        const datosCambio =
            await respuesta.json();

        if (!validarTipoCambio(datosCambio)) {
            throw new Error(
                'La API de divisas ha devuelto datos incorrectos.',
            );
        }

        return {
            disponible: true,
            origenDatos: 'frankfurter',
            esRespaldo: false,
            base: datosCambio.base,
            destino: datosCambio.quote,
            yenesPorEuro: datosCambio.rate,
            fecha: datosCambio.date,
            aviso:
                'Conversión calculada con el tipo de cambio ' +
                'consultado mediante Frankfurter.',
        };
    } catch (error) {
        return crearTipoCambioRespaldo(
            error,
        );
    }
}