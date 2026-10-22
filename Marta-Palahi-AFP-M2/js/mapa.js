/* Japan Route AI
   Creación y actualización del mapa con Leaflet */


/*
    1. Validar las coordenadas de las ciudades.
    2. Inicializar el mapa y la capa de la ruta.
    3. Crear los marcadores y sus ventanas emergentes.
    4. Dibujar la línea entre las ciudades.
    5. Ajustar la vista para mostrar la ruta completa.
*/


/* REFERENCIAS Y VARIABLES */

const contenedorMapa = document.querySelector('#mapaRuta');

let mapa = null;

let capaRuta = null;


/* VALIDACIÓN */

/* Comprueba que una ciudad contiene coordenadas válidas. */
function tieneCoordenadasValidas(ciudad) {
    if (
        !ciudad ||
        !ciudad.coordenadas
    ) {
        return false;
    }

    const latitud = ciudad.coordenadas.latitud;

    const longitud = ciudad.coordenadas.longitud;

    return (
        typeof latitud === 'number' &&
        Number.isFinite(latitud) &&
        latitud >= -90 &&
        latitud <= 90 &&
        typeof longitud === 'number' &&
        Number.isFinite(longitud) &&
        longitud >= -180 &&
        longitud <= 180
    );
}


/* PREPARACIÓN DEL MAPA */

/* Comprueba que Leaflet está disponible en el navegador. */
function obtenerLeaflet() {
    if (typeof globalThis.L === 'undefined') {
        throw new Error(
            'Leaflet no se ha cargado correctamente.',
        );
    }

    return globalThis.L;
}


/* Reinicia las referencias si el contenido del mapa fue eliminado. */
function comprobarEstadoMapa() {
    if (
        mapa &&
        !contenedorMapa.querySelector('.leaflet-pane')
    ) {
        mapa.remove();

        mapa = null;

        capaRuta = null;
    }
}


/* Crea el mapa la primera vez que se necesita. */
function inicializarMapa() {
    const leaflet = obtenerLeaflet();

    if (!contenedorMapa) {
        throw new Error(
            'No se ha encontrado el contenedor del mapa.',
        );
    }

    comprobarEstadoMapa();

    if (mapa) {
        return mapa;
    }

    contenedorMapa.classList.remove(
        'mapa-ruta--error',
    );

    contenedorMapa.innerHTML = '';

    mapa = leaflet.map(
        contenedorMapa,
        {
            zoomControl: true,
            scrollWheelZoom: false,
        },
    );

    leaflet.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
    ).addTo(mapa);

    capaRuta =
        leaflet.layerGroup().addTo(mapa);

    return mapa;
}


/* Elimina los marcadores y las líneas de la ruta anterior. */
function limpiarMapa() {
    if (capaRuta) {
        capaRuta.clearLayers();
    }
}


/* MARCADORES */

/* Crea un marcador numerado personalizado. */
function crearIconoMarcador(numero) {
    const leaflet = obtenerLeaflet();

    return leaflet.divIcon({
        className: 'marcador-ruta',
        html: `<span>${numero}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });
}


/* Devuelve el periodo asignado a una ciudad. */
function formatearPeriodoCiudad(ciudad) {
    if (ciudad.diaInicio === ciudad.diaFin) {
        return `Día ${ciudad.diaInicio}`;
    }

    return `Días ${ciudad.diaInicio}-${ciudad.diaFin}`;
}


/* Devuelve la duración asignada a una ciudad. */
function formatearDiasAsignados(diasAsignados) {
    if (diasAsignados === 1) {
        return '1 día asignado';
    }

    return `${diasAsignados} días asignados`;
}


/* Crea el contenido de la ventana emergente de una ciudad. */
function crearContenidoPopup(ciudad, numeroParada) {
    const contenedor = document.createElement('div');

    contenedor.className = 'popup-ciudad';

    const etiqueta = document.createElement('small');

    etiqueta.textContent = `Parada ${numeroParada}`;

    const titulo = document.createElement('strong');

    titulo.textContent =
        `${ciudad.nombre} · ${ciudad.nombreJapones}`;

    const periodo = document.createElement('span');

    periodo.textContent =
        formatearPeriodoCiudad(ciudad);

    const duracion = document.createElement('span');

    duracion.textContent =
        formatearDiasAsignados(
            ciudad.diasAsignados,
        );

    contenedor.append(
        etiqueta,
        titulo,
        periodo,
        duracion,
    );

    return contenedor;
}


/* Añade al mapa los marcadores de todas las ciudades. */
function añadirMarcadores(ciudades) {
    const leaflet = obtenerLeaflet();

    ciudades.forEach(function (ciudad, indice) {
        const coordenadas = [
            ciudad.coordenadas.latitud,
            ciudad.coordenadas.longitud,
        ];

        const marcador = leaflet.marker(
            coordenadas,
            {
                icon:
                    crearIconoMarcador(
                        indice + 1,
                    ),

                title:
                    `${indice + 1}. ${ciudad.nombre}`,
            },
        );

        marcador.bindPopup(
            crearContenidoPopup(
                ciudad,
                indice + 1,
            ),
        );

        marcador.addTo(
            capaRuta,
        );
    });
}


/* LÍNEA DE LA RUTA */

/* Obtiene el color principal definido en el archivo CSS. */
function obtenerColorRuta() {
    const estilosDocumento =
        getComputedStyle(
            document.documentElement,
        );

    const colorRojo =
        estilosDocumento
            .getPropertyValue('--color-rojo')
            .trim();

    return colorRojo || '#c90032';
}


/* Dibuja una línea entre las ciudades según el orden de la ruta. */
function dibujarLineaRuta(ciudades) {
    const leaflet = obtenerLeaflet();

    const coordenadasRuta =
        ciudades.map(function (ciudad) {
            return [
                ciudad.coordenadas.latitud,
                ciudad.coordenadas.longitud,
            ];
        });

    const lineaRuta = leaflet.polyline(
        coordenadasRuta,
        {
            color: obtenerColorRuta(),
            weight: 4,
            opacity: 0.8,
            dashArray: '8 8',
            lineCap: 'round',
            lineJoin: 'round',
        },
    );

    lineaRuta.addTo(
        capaRuta,
    );

    return lineaRuta;
}


/* AJUSTE DE LA VISTA */

/* Ajusta el tamaño y el encuadre para mostrar toda la ruta. */
function ajustarVistaMapa(mapaRuta, lineaRuta) {
    requestAnimationFrame(function () {
        mapaRuta.invalidateSize({
            pan: false,
        });

        mapaRuta.fitBounds(
            lineaRuta.getBounds(),
            {
                padding: [45, 45],
                maxZoom: 8,
            },
        );
    });
}


/* RENDERIZADO PRINCIPAL */

/* Representa las ciudades y el recorrido completo en el mapa. */
export function renderizarMapaRuta(ciudades) {
    if (
        !Array.isArray(ciudades) ||
        ciudades.length === 0
    ) {
        throw new Error(
            'No se puede mostrar un mapa sin ciudades.',
        );
    }

    const ciudadesValidas =
        ciudades.filter(
            tieneCoordenadasValidas,
        );

    if (
        ciudadesValidas.length !==
        ciudades.length
    ) {
        throw new Error(
            'Una o más ciudades no tienen coordenadas válidas.',
        );
    }

    if (ciudadesValidas.length < 2) {
        throw new Error(
            'Se necesitan al menos dos ciudades para dibujar la ruta.',
        );
    }

    const mapaRuta =
        inicializarMapa();

    limpiarMapa();

    añadirMarcadores(
        ciudadesValidas,
    );

    const lineaRuta =
        dibujarLineaRuta(
            ciudadesValidas,
        );

    ajustarVistaMapa(
        mapaRuta,
        lineaRuta,
    );
}