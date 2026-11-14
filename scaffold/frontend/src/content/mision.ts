/**
 * Modo Misión: todos los textos en un solo archivo. Dueña: Javiera (N).
 * Cambiar el orden de los niveles, las preguntas o el glosario = editar este archivo, nada más.
 * Para traducir: copiar este archivo como mision.en.ts y traducir los textos.
 *
 * Objetivo educativo (ODS 4, metas 4.4 y 4.7): que un joven pase de espectador a investigador con
 * datos reales de SPHEREx, usando el mismo visor que pide el desafío.
 *
 * ── Las cuatro decisiones del equipo (PROPUESTA; el equipo confirma) ────────────────────────────
 * 1. Orden: de lo más fácil de ver a lo más sutil. Barnard (el salto más claro) → WISE 0855 (se mueve,
 *    pero es débil) → eps Ind B (nivel de la duda) → RW Aur y R Dra juntas al final: un cambio de
 *    brillo es más sutil que un cambio de lugar, y compararlas juntas enseña la diferencia.
 * 2. Preguntas: se responden mirando el parpadeo o la resta, no leyendo.
 * 3. Nivel que enseña a dudar: eps Ind B («¿todos esos puntos se movieron?»).
 * 4. Notebook de Colab: una tarea con R Draconis (pendiente; si sobra tiempo).
 *
 * `verificado: false` = la respuesta todavía no se comprobó mirando los datos reales de ese campo.
 * Antes del envío, cada nivel debe quedar en `true` con una captura o GIF de evidencia (C, Mauricio).
 *
 * Marcas en el texto: [[id]] o [[id|texto visible]] muestran un término del glosario al pasar el mouse.
 */

export type Opcion = { texto: string; correcta: boolean; explicacion: string };

export type Nivel = {
  id: string; // id del campo en content/campos.ts
  titulo: string;
  banda: string;
  size: number; // grados del recorte
  contexto: string;
  comoMirar: string;
  pregunta: string;
  opciones: Opcion[];
  esDuda?: boolean;
  verificado: boolean;
};

export const mision = {
  nombre: "Modo Misión",
  subtitulo: "Haz lo que hizo Clyde Tombaugh, con fotos reales de SPHEREx",
  botonLanding: "Modo Misión: conviértete en cazador de planetas",

  intro: [
    {
      titulo: "1930: un joven compara dos fotos",
      texto:
        "En enero de 1930, Clyde Tombaugh, de 24 años, fotografió la misma zona del cielo dos veces, con seis días de diferencia, en el Observatorio Lowell (Arizona). Buscaban un «Planeta X».",
    },
    {
      titulo: "El truco: hacerlas [[parpadeo|parpadear]]",
      texto:
        "Con una máquina iba alternando las dos fotos muy rápido. Las estrellas lejanas quedaban quietas, pero un puntito saltaba de lugar. El 18 de febrero de 1930 lo vio: era Plutón.",
    },
    {
      titulo: "Ahora te toca a ti",
      texto:
        "[[spherex|SPHEREx]], un telescopio de la NASA, fotografía todo el cielo cada seis meses. Vas a usar sus fotos reales para encontrar cinco objetos y descubrir qué cambió en cada uno.",
    },
  ],

  niveles: [
    {
      id: "barnard",
      titulo: "La estrella con prisa",
      banda: "2",
      size: 0.05,
      contexto:
        "La Estrella de Barnard es la estrella que más rápido cruza nuestro cielo. Aun así, entre la primera y la última foto avanza apenas un par de [[pixel|píxeles]].",
      comoMirar:
        "Mira el parpadeo y después la [[resta]]: en rojo está donde aparece en la última foto; en azul, donde estaba en la primera.",
      pregunta: "¿Hacia dónde se movió la estrella?",
      opciones: [
        { texto: "Hacia arriba (norte)", correcta: true, explicacion: "¡Exacto! El rojo queda arriba del azul: se movió hacia el norte. Ese es su [[movimiento-propio|movimiento propio]], unos 10 segundos de arco por año." },
        { texto: "Hacia abajo (sur)", correcta: false, explicacion: "Mira otra vez la resta: el azul es dónde estaba antes y el rojo dónde está ahora. ¿Cuál queda arriba?" },
        { texto: "Hacia un costado", correcta: false, explicacion: "Casi: se mueve un poquito de lado, pero sobre todo en otra dirección. Fíjate en la pareja rojo-azul de la resta." },
        { texto: "No se movió", correcta: false, explicacion: "Se mueve poco, pero se mueve: compara la primera foto con la última en el parpadeo." },
      ],
      verificado: true, // Bryan midió 1,44–1,50 px al norte (PR #9); resta vista en el navegador el 14-nov
    },
    {
      id: "wise_0855",
      titulo: "La enana marrón invisible",
      banda: "5",
      size: 0.05,
      contexto:
        "WISE 0855 es una [[enana-marron|enana marrón]] tan fría que casi no se ve en luz visible. Solo asoma en el [[infrarrojo]] largo, por eso miramos la [[banda]] D5.",
      comoMirar: "Busca el puntito débil cerca del centro y compara las fotos. Ten paciencia: es tenue.",
      pregunta: "¿Qué cambió entre la primera y la última foto: la posición o el brillo?",
      opciones: [
        { texto: "La posición", correcta: true, explicacion: "¡Bien! Se corrió de lado. Está tan cerca del Sol que su movimiento se nota en pocos meses de fotos." },
        { texto: "El brillo", correcta: false, explicacion: "Mira la resta: si solo cambiara el brillo verías una mancha de un solo color. Aquí hay una pareja rojo-azul: eso es movimiento." },
        { texto: "Nada", correcta: false, explicacion: "Es débil, así que cuesta. Usa la resta: ¿ves una pareja rojo-azul cerca del centro?" },
      ],
      verificado: true, // Bryan midió 1,30–1,32 px al oeste (PR #9)
    },
    {
      id: "eps_ind_b",
      titulo: "¿Todo lo que se mueve es un descubrimiento?",
      banda: "5",
      size: 0.05,
      contexto:
        "Epsilon Indi B son dos enanas marrones que viajan juntas. En la resta vas a ver muchos puntitos de colores. Un buen investigador desconfía antes de celebrar.",
      comoMirar:
        "En la resta, busca dos tipos de cosas: parejas rojo-azul pegadas, y puntitos sueltos de un solo color repartidos por la imagen.",
      pregunta: "Los puntitos sueltos de colores repartidos por la imagen, ¿son objetos que se movieron?",
      opciones: [
        { texto: "Sí, todos son descubrimientos", correcta: false, explicacion: "¡Cuidado! Si fuera así, el cielo estaría lleno de planetas nuevos. Un objeto que se mueve deja una pareja rojo-azul pegada, no un punto suelto." },
        { texto: "No: la mayoría son defectos o ruido de la cámara", correcta: true, explicacion: "¡Muy bien! Rayos cósmicos, píxeles saturados o reflejos dejan manchas sueltas. Por eso cada foto trae [[flags|marcas de calidad]]. Lo que encuentres es un [[candidato]] hasta que se revise." },
        { texto: "Es el Planeta X", correcta: false, explicacion: "Sería genial, pero no: un planeta lejano se movería como pareja rojo-azul, y habría que confirmarlo en muchas fotos. Primero se descarta lo más simple." },
      ],
      esDuda: true,
      verificado: false,
    },
    {
      id: "rw_aur",
      titulo: "La estrella que cambia sola",
      banda: "2",
      size: 0.05,
      contexto:
        "RW Aurigae es una estrella joven, todavía rodeada de gas y polvo. Es una [[variable|estrella variable]]: no se mueve casi nada, pero su brillo cambia.",
      comoMirar: "Compara la estrella del centro con sus vecinas en el parpadeo. ¿Cambia ella más que las demás?",
      pregunta: "¿Qué cambió en RW Aurigae: la posición o el brillo?",
      opciones: [
        { texto: "La posición", correcta: false, explicacion: "En la resta no hay una pareja rojo-azul: no se corrió de lugar. Su movimiento es diminuto." },
        { texto: "El brillo", correcta: true, explicacion: "¡Eso es! Es variable: su luz sube y baja. Ojo: las fotos son en colores un poco distintos, así que parte del cambio puede venir del filtro. Por eso se comparan muchas fotos." },
      ],
      verificado: false,
    },
    {
      id: "r_dra",
      titulo: "El latido de R Draconis",
      banda: "2",
      size: 0.05,
      contexto:
        "R Draconis es una estrella vieja que se infla y se desinfla: su brillo sube y baja en un ciclo de varios meses.",
      comoMirar: "Mira la estrella del centro en la resta: ¿es una pareja rojo-azul o una mancha de un solo color?",
      pregunta: "En la resta, R Draconis es una mancha de un solo color y no una pareja. ¿Qué significa?",
      opciones: [
        { texto: "Que se movió", correcta: false, explicacion: "Si se moviera verías una pareja: rojo de un lado y azul del otro. Una mancha pareja es otra cosa." },
        { texto: "Que cambió su brillo", correcta: true, explicacion: "¡Exacto! Pareja rojo-azul = se movió. Mancha de un solo color = cambió de brillo. Ya sabes distinguir las dos cosas, como un astrónomo." },
        { texto: "Que es un defecto", correcta: false, explicacion: "Los defectos son puntitos pequeños y sueltos. Esta mancha está justo sobre la estrella y es grande." },
      ],
      verificado: false,
    },
  ] as Nivel[],

  final: {
    insignia: "Cazador de planetas",
    titulo: "¡Lo lograste!",
    texto:
      "Encontraste estrellas que se mueven, aprendiste a desconfiar de lo que parece un descubrimiento y a distinguir un cambio de lugar de un cambio de brillo. Así trabajan los voluntarios que han descubierto enanas marrones mirando fotos del cielo.",
    siguiente: "Sigue explorando el cielo con el visor, o comparte un nivel con tu curso.",
    colabTexto: "¿Y si lo haces con código?",
    // Se activa cuando exista el notebook (el repo tiene que ser público para abrirlo desde Colab).
    colabUrl: null as string | null,
  },

  ui: {
    empezar: "Empezar la misión",
    siguiente: "Siguiente",
    anterior: "Anterior",
    nivel: (n: number, total: number) => `Nivel ${n} de ${total}`,
    comoMirar: "Cómo mirar",
    cargando: "Pidiendo las fotos reales de SPHEREx a IRSA… (unos segundos)",
    errorFotos: "No pudimos traer las fotos ahora. Prueba otra vez en un momento.",
    reintentar: "Reintentar",
    parpadeo: "Parpadeo",
    resta: "Resta",
    pausa: "Pausa",
    leyendaResta: "Rojo: aparece en la última foto · Azul: estaba en la primera",
    compartir: "Copiar enlace de este nivel",
    copiado: "¡Enlace copiado!",
    nivelDuda: "Nivel de la duda",
    salir: "Salir de la misión",
    volverEmpezar: "Volver a empezar",
  },
};

/** Glosario: término → explicación en lenguaje simple (se muestra al pasar el mouse o con el teclado). */
export const glosario: Record<string, { termino: string; definicion: string }> = {
  parpadeo: { termino: "Parpadeo", definicion: "Pasar dos o más fotos del mismo lugar del cielo, una tras otra, para que lo que cambió salte a la vista." },
  resta: { termino: "Resta", definicion: "Restar la primera foto a la última. Lo que no cambió desaparece; lo que cambió queda en rojo o azul." },
  pixel: { termino: "Píxel", definicion: "Cada cuadradito de una foto digital. En SPHEREx, un píxel abarca 6,15 segundos de arco del cielo." },
  spherex: { termino: "SPHEREx", definicion: "Telescopio espacial de la NASA que, desde 2025, fotografía todo el cielo cada seis meses en 102 colores de luz infrarroja." },
  banda: { termino: "Banda", definicion: "Un «color» de luz. SPHEREx tiene 102, agrupadas en seis detectores: D1 (la más azul) a D6 (la más roja)." },
  infrarrojo: { termino: "Infrarrojo", definicion: "Luz que nuestros ojos no ven, más «roja» que el rojo. La emiten sobre todo los objetos tibios y fríos." },
  "movimiento-propio": { termino: "Movimiento propio", definicion: "Cuánto se corre una estrella en el cielo cada año, porque se mueve de verdad por la galaxia." },
  "enana-marron": { termino: "Enana marrón", definicion: "Un objeto más grande que un planeta pero demasiado pequeño para brillar como estrella. Se ve sobre todo en infrarrojo." },
  variable: { termino: "Estrella variable", definicion: "Una estrella cuyo brillo cambia con el tiempo, a veces en días, a veces en meses o años." },
  flags: { termino: "Marcas de calidad", definicion: "Cada foto de SPHEREx indica qué píxeles pueden estar dañados: rayos cósmicos, saturación o reflejos." },
  candidato: { termino: "Candidato", definicion: "Algo que parece interesante pero todavía no se confirma. Hay que revisarlo con más fotos y catálogos." },
};
