/* Japan Route AI
   Carga y validación de los archivos de datos */

/*
    1. Cargar ciudades.json.
    2. Cargar conexiones.json.
    3. Cargar vuelos.json.
    4. Validar los datos recibidos.
    5. Gestionar los errores de carga.
*/


/* RUTAS DE LOS ARCHIVOS */

const RUTA_CIUDADES = './data/ciudades.json';

const RUTA_CONEXIONES = './data/conexiones.json';

const RUTA_VUELOS = './data/vuelos.json';


/* FUNCIONES AUXILIARES DE VALIDACIÓN */

/* Comprueba que un valor es un objeto válido y no es un array. */
function esObjetoValido(valor) {
    return (valor !== null && typeof valor === 'object' && !Array.isArray(valor));
}


/* Comprueba que un valor es un texto que contiene información. */
function esTextoValido(valor) {
    return (typeof valor === 'string' && valor.trim() !== '' );
}


/* Comprueba que un valor es un número finito. */
function esNumeroValido(valor) {
    return (typeof valor === 'number' && Number.isFinite(valor));
}


/* Comprueba que un array contiene al menos un elemento. */
function esArrayConDatos(valor) {
    return (Array.isArray(valor) && valor.length > 0);
}


/* Comprueba que un array contiene únicamente textos válidos. */
function esArrayDeTextosValidos(valor) {
    if (!esArrayConDatos(valor)) {
        return false;
    }

    return valor.every(function (elemento) {
        return esTextoValido(elemento);
    });
}


/* Comprueba que un código de aeropuerto contiene tres letras mayúsculas. */
function esCodigoAeropuertoValido(codigo) {
    return (typeof codigo === 'string' && /^[A-Z]{3}$/.test(codigo));
}


/* VALIDACIÓN DE CIUDADES */

/* Comprueba que las coordenadas de una ciudad son válidas. */
function validarCoordenadas(coordenadas) {
    if (!esObjetoValido(coordenadas)) {
        return false;
    }

    const latitud = coordenadas.latitud;

    const longitud = coordenadas.longitud;

    if (!esNumeroValido(latitud) || latitud < -90 || latitud > 90) {
        return false;
    }

    if (!esNumeroValido(longitud) || longitud < -180 || longitud > 180) {
        return false;
    }

    if (!esTextoValido(coordenadas.tipoPunto)) {
        return false;
    }

    return true;
}


/* Comprueba que la estación principal de una ciudad es válida. */
function validarEstacionPrincipal(estacionPrincipal) {
    if (!esObjetoValido(estacionPrincipal)) {
        return false;
    }

    if (!esTextoValido(estacionPrincipal.id)) {
        return false;
    }

    if (!esTextoValido(estacionPrincipal.nombre)) {
        return false;
    }

    return true;
}


/* Comprueba que los datos geográficos de una ciudad son válidos. */
function validarDatosGeograficos(datosGeograficos) {
    if (!esObjetoValido(datosGeograficos)) {
        return false;
    }

    if (!esTextoValido(datosGeograficos.estadoVerificacion)) {
        return false;
    }

    if (!esTextoValido(datosGeograficos.fechaVerificacion)) {
        return false;
    }

    if (!esArrayDeTextosValidos(datosGeograficos.fuentesReferencia)) {
        return false;
    }

    return true;
}


/* Comprueba que una ciudad contiene todas las propiedades necesarias. */
function validarCiudad(ciudad) {
    if (!esObjetoValido(ciudad)) {
        return false;
    }

    if (!esTextoValido(ciudad.id)) {
        return false;
    }

    if (!esTextoValido(ciudad.nombre)) {
        return false;
    }

    if (!esTextoValido(ciudad.nombreInternacional)) {
        return false;
    }

    if (!esTextoValido(ciudad.nombreJapones)) {
        return false;
    }

    if (!esTextoValido(ciudad.prefectura)) {
        return false;
    }

    if (!esTextoValido(ciudad.zona)) {
        return false;
    }

    if (!esNumeroValido(ciudad.ordenGeografico) || ciudad.ordenGeografico < 0) {
        return false;
    }

    if (!validarCoordenadas(ciudad.coordenadas)) {
        return false;
    }

    if (!validarEstacionPrincipal(ciudad.estacionPrincipal)) {
        return false;
    }

    if (!esArrayDeTextosValidos(ciudad.intereses)) {
        return false;
    }

    if (!esArrayDeTextosValidos(ciudad.tiposExperiencia)) {
        return false;
    }

    if (!esArrayDeTextosValidos(ciudad.nivelesPresupuesto)) {
        return false;
    }

    if (!esNumeroValido(ciudad.diasMinimos) || !Number.isInteger(ciudad.diasMinimos) || ciudad.diasMinimos <= 0) {
        return false;
    }

    if (!esNumeroValido(ciudad.diasRecomendados) || !Number.isInteger(ciudad.diasRecomendados) ||
        ciudad.diasRecomendados < ciudad.diasMinimos) {
        return false;
    }

    if (!esArrayConDatos(ciudad.aeropuertosCercanos)) {
        return false;
    }

    if (typeof ciudad.esDestinoPrincipal !== 'boolean') {
        return false;
    }

    if (!validarDatosGeograficos(ciudad.datosGeograficos)) {
        return false;
    }

    return true;
}


/* Comprueba que la lista completa de ciudades contiene datos válidos. */
function validarCiudades(ciudades) {
    if (!Array.isArray(ciudades)) {
        throw new Error(
            'El archivo de ciudades no contiene un array.',
        );
    }

    if (ciudades.length === 0) {
        throw new Error(
            'El archivo de ciudades está vacío.',
        );
    }

    const ciudadesInvalidas = ciudades.filter(function (ciudad) {
        return !validarCiudad(ciudad);
    });

    if (ciudadesInvalidas.length > 0) {
        throw new Error(
            'Una o más ciudades contienen datos incompletos o incorrectos.',
        );
    }

    return true;
}


/* VALIDACIÓN DE CONEXIONES */

/* Comprueba que una conexión contiene todas las propiedades necesarias. */
function validarConexion(conexion) {
    if (!esObjetoValido(conexion)) {
        return false;
    }

    if (!esTextoValido(conexion.id)) {
        return false;
    }

    if (!esTextoValido(conexion.origen)) {
        return false;
    }

    if (!esTextoValido(conexion.destino)) {
        return false;
    }

    if (conexion.origen === conexion.destino) {
        return false;
    }

    if (!esTextoValido(conexion.estacionOrigen)) {
        return false;
    }

    if (!esTextoValido(conexion.estacionDestino)) {
        return false;
    }

    if (!esTextoValido(conexion.medio)) {
        return false;
    }

    if (!esNumeroValido(conexion.duracionMinutos) || conexion.duracionMinutos <= 0) {
        return false;
    }

    if (!esNumeroValido(conexion.precioAproximadoYenes) || conexion.precioAproximadoYenes < 0) {
        return false;
    }

    if (!Number.isInteger(conexion.transbordos) || conexion.transbordos < 0) {
        return false;
    }

    if (typeof conexion.bidireccional !== 'boolean') {
        return false;
    }

    if (!esTextoValido(conexion.tipoDato)) {
        return false;
    }

    if (!esTextoValido(conexion.fechaVerificacion)) {
        return false;
    }

    if (!esArrayDeTextosValidos(conexion.fuentesReferencia)) {
        return false;
    }

    return true;
}


/* Comprueba que la lista completa de conexiones contiene datos válidos. */
function validarConexiones(conexiones) {
    if (!Array.isArray(conexiones)) {
        throw new Error(
            'El archivo de conexiones no contiene un array.',
        );
    }

    if (conexiones.length === 0) {
        throw new Error(
            'El archivo de conexiones está vacío.',
        );
    }

    const conexionesInvalidas = conexiones.filter(function (conexion) {
        return !validarConexion(conexion);
    });

    if (conexionesInvalidas.length > 0) {
        throw new Error(
            'Una o más conexiones contienen datos incompletos o incorrectos.',
        );
    }

    return true;
}


/* VALIDACIÓN DE VUELOS */

/* Comprueba que una opción de vuelo contiene los datos necesarios. */
function validarVuelo(vuelo) {
    if (!esObjetoValido(vuelo)) {
        return false;
    }

    if (!esTextoValido(vuelo.id)) {
        return false;
    }

    if (!esCodigoAeropuertoValido(vuelo.origen)) {
        return false;
    }

    if (!esCodigoAeropuertoValido(vuelo.destino)) {
        return false;
    }

    if (vuelo.origen === vuelo.destino) {
        return false;
    }

    if (!esTextoValido(vuelo.aerolinea)) {
        return false;
    }

    if (!esNumeroValido(vuelo.precioPorPersona) || vuelo.precioPorPersona <= 0) {
        return false;
    }

    if (!esNumeroValido(vuelo.duracionMinutos) || vuelo.duracionMinutos <= 0) {
        return false;
    }

    if (!Number.isInteger(vuelo.escalas) || vuelo.escalas < 0) {
        return false;
    }

    if (vuelo.tipoDato !== 'simulado') {
        return false;
    }

    return true;
}


/* Comprueba que la lista completa de vuelos contiene datos válidos. */
function validarVuelos(vuelos) {
    if (!Array.isArray(vuelos)) {
        throw new Error(
            'El archivo de vuelos no contiene un array.',
        );
    }

    if (vuelos.length === 0) {
        throw new Error(
            'No se han encontrado datos locales de vuelos.',
        );
    }

    const vuelosInvalidos = vuelos.filter(function (vuelo) {
        return !validarVuelo(vuelo);
    });

    if (vuelosInvalidos.length > 0) {
        throw new Error(
            'Uno o más vuelos contienen datos incompletos o incorrectos.',
        );
    }

    return true;
}


/* CARGA DE DATOS */

/* Carga y valida el archivo JSON que contiene las ciudades. */
export async function cargarCiudades() {
    try {
        const respuesta = await fetch(RUTA_CIUDADES);

        if (!respuesta.ok) {
            throw new Error(
                `No se ha podido cargar ciudades.json. Código: ${respuesta.status} .`
            );
        }

        const ciudades = await respuesta.json();

        validarCiudades(ciudades);

        return ciudades;

    } catch (error) {

        console.error( 'Error al cargar las ciudades:', error);

        throw error;
    }
}


/* Carga y valida el archivo JSON que contiene las conexiones. */
export async function cargarConexiones() {
    try {
        const respuesta = await fetch(RUTA_CONEXIONES);

        if (!respuesta.ok) {
            throw new Error(`No se ha podido cargar conexiones.json. Código: ${respuesta.status}`);
        }

        const conexiones = await respuesta.json();

        validarConexiones(conexiones);

        return conexiones;

    } catch (error) {
        console.error('Error al cargar las conexiones:', error);

        throw error;
    }
}


/* Carga y valida el archivo JSON que contiene los vuelos simulados. */
export async function cargarVuelosLocales() {

    try {
        const respuesta = await fetch(RUTA_VUELOS);

        if (!respuesta.ok) {
            throw new Error(`No se han podido cargar los vuelos locales. Código: ${respuesta.status}`);
        }

        const vuelos = await respuesta.json();

        validarVuelos(vuelos);

        return vuelos;

    } catch (error) {

        console.error( 'Error al cargar los vuelos locales:', error);

        throw error;
    }
}