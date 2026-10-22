# Japan Route AI

Aplicación web académica que genera una ruta personalizada por Japón según las fechas, el presupuesto, el aeropuerto de salida, los intereses y el ritmo de viaje de la persona usuaria.

## Autoría

**Marta Palahí**

Proyecto final de JavaScript e Inteligencia Artificial.

## Descripción

Japan Route AI combina datos locales, lógica desarrollada con JavaScript, una API externa de divisas, un mapa interactivo y un modelo de lenguaje local para proponer una ruta por Japón.

La aplicación:

- valida las preferencias introducidas;
- puntúa y selecciona destinos;
- ordena las ciudades geográficamente;
- distribuye los días disponibles;
- recomienda aeropuertos de entrada y salida;
- muestra transportes internos orientativos;
- compara opciones locales simuladas de vuelo;
- consulta el cambio EUR/JPY mediante Frankfurter;
- calcula una estimación económica;
- representa la ruta con Leaflet y OpenStreetMap;
- utiliza Qwen mediante Ollama para explicar la propuesta.

## Funcionalidades principales

- Formulario de dos pasos.
- Validación de fechas, viajeros, presupuesto e intereses.
- Rutas de 7 a 21 días.
- Selección de hasta cinco destinos.
- Algoritmo propio de puntuación y ordenación.
- Distribución automática de días.
- Recomendación de aeropuertos.
- Comparación de vuelos simulados.
- Conversión de yenes a euros con una API externa.
- Estimación de vuelos, alojamiento, transporte, comida y actividades.
- Mapa interactivo con marcadores y línea de ruta.
- Explicación generada localmente con Qwen.
- Estados de carga y mensajes de error.
- Errores locales independientes para mapa, vuelos e IA.
- Diseño responsive y accesible.

## Tecnologías utilizadas

- HTML5 semántico.
- CSS3 propio y mobile first.
- JavaScript.
- Módulos ES6.
- Fetch API.
- JSON.
- Leaflet 1.9.4.
- OpenStreetMap.
- Frankfurter API.
- Ollama.
- Qwen `qwen3:4b-instruct`.

## Estructura del proyecto

```text
japan-route-ai/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── data/
│   ├── ciudades.json
│   ├── conexiones.json
│   └── vuelos.json
├── img/
│   └── hero-japon.png
└── js/
    ├── app.js
    ├── algoritmo.js
    ├── datos.js
    ├── formulario.js
    ├── mapa.js
    ├── render.js
    └── servicios.js
```

## Instrucciones de ejecución

### 1. Abrir el proyecto con un servidor local

No se debe abrir `index.html` directamente mediante `file://`, porque la aplicación carga archivos JSON con `fetch`.

En Visual Studio Code:

1. Abrir la carpeta completa del proyecto.
2. Instalar la extensión **Live Server**, si no está instalada.
3. Pulsar con el botón derecho sobre `index.html`.
4. Seleccionar **Open with Live Server**.

### 2. Preparar Ollama

La aplicación funciona aunque Ollama no esté disponible, pero en ese caso no se mostrará la explicación de IA.

Antes de generar la ruta:

```bash
ollama pull qwen3:4b-instruct
```

Después, comprobar que Ollama está abierto. Si es necesario, iniciar el servicio:

```bash
ollama serve
```

La aplicación consulta:

```text
http://127.0.0.1:11434/api/generate
```

### 3. Generar una ruta

1. Seleccionar el aeropuerto de salida.
2. Introducir fechas para un viaje de 7 a 21 días.
3. Elegir el número de viajeros y el presupuesto por persona.
4. Seleccionar la prioridad de vuelo.
5. Escoger entre uno y tres intereses.
6. Elegir el ritmo y el tipo de experiencia.
7. Pulsar **Generar mi ruta**.

## Origen de los datos

### Datos locales

Los siguientes datos forman parte del prototipo:

- destinos y características: `data/ciudades.json`;
- conexiones y transportes: `data/conexiones.json`;
- vuelos simulados: `data/vuelos.json`.

Los precios, tiempos y vuelos locales son orientativos y no representan disponibilidad real.

### API externa

Frankfurter se utiliza para consultar el tipo de cambio EUR/JPY. Si la consulta falla, la aplicación utiliza un valor local de respaldo y lo indica en la interfaz.

### Mapa

Leaflet representa las ciudades de la ruta sobre mapas de OpenStreetMap. La línea muestra el orden general y no reproduce con exactitud las vías ferroviarias.

### Inteligencia artificial

Qwen no decide la ruta. JavaScript calcula y valida los destinos, el orden, los días, los aeropuertos y los transportes. Después, Qwen recibe un contexto estructurado y genera una explicación breve del resultado.

La respuesta de Qwen:

- debe ser JSON;
- se valida antes de mostrarla;
- no puede modificar la ruta;
- no puede inventar precios, horarios o reservas;
- dispone de control de tiempo máximo y gestión de errores.

## Gestión de errores

La aplicación diferencia entre errores generales y errores locales.

### Errores generales

Impiden construir una ruta válida, por ejemplo:

- archivos principales inexistentes;
- ciudades o conexiones inválidas;
- datos del formulario incorrectos;
- imposibilidad de distribuir los días.

### Errores locales

No bloquean el resto del resultado:

- Ollama cerrado o modelo no instalado;
- Leaflet no disponible;
- archivo local de vuelos no disponible;
- fallo de la API de divisas, que activa un cambio de respaldo.

## Accesibilidad y experiencia de usuario

- HTML semántico.
- Enlace para saltar al contenido principal.
- Etiquetas asociadas a los controles.
- Navegación mediante teclado.
- Foco visible.
- `aria-live` en mensajes, carga y resultados.
- `aria-busy` durante la explicación de IA.
- Mensajes de error comprensibles.
- Botón de envío deshabilitado durante el proceso.
- Compatibilidad con `prefers-reduced-motion`.
- Diseño adaptable desde 320 px.

## Limitaciones

- No realiza reservas ni pagos.
- Los vuelos son simulados.
- Los transportes y sus precios son aproximados.
- La estimación económica no sustituye una planificación real.
- Requiere conexión a Internet para mapas, fuentes y tipo de cambio.
- La explicación de IA requiere Ollama y el modelo instalado.
- El prototipo trabaja con un conjunto limitado de ciudades japonesas.

## Posibles mejoras futuras

- Integrar una API real de vuelos mediante un backend seguro.
- Añadir actividades e itinerarios diarios.
- Consultar meteorología para las ciudades seleccionadas.
- Incorporar más destinos y conexiones.
- Guardar rutas favoritas.
- Exportar el resultado a PDF.
- Añadir cuentas de usuario.
- Mejorar el cálculo de noches y alojamientos.
- Permitir comparar varias rutas alternativas.

## Decisiones técnicas destacadas

- La selección de la ruta es determinista y comprobable.
- La IA se utiliza como explicadora, no como fuente de datos.
- Las credenciales privadas no se guardan en el frontend.
- Los servicios secundarios fallan de manera independiente.
- Los archivos JSON se validan antes de utilizarlos.
- Los datos reales, simulados y de respaldo se identifican en la interfaz.

## Capturas de pantalla

(img/capturas/captura-viaje-menos-dias.png)
(img/capturas/captura-pagina-inicial.png)
(img/capturas/captura-viaje-mas-dias.png)

## Aviso

Japan Route AI es un prototipo académico. La información mostrada es orientativa y debe contrastarse con fuentes oficiales antes de organizar un viaje real.
