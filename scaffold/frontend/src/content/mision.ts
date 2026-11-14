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
 *    pero solo se ve sumando 10 fotos) → eps Ind B (otra dirección) → RW Aur (nivel de la duda).
 *    R Dra queda oculto: con estas fotos no se puede mostrar su cambio de brillo de forma honesta.
 * 2. Preguntas: se responden mirando el parpadeo o la resta, no leyendo.
 * 3. Nivel que enseña a dudar: RW Aur («una mancha en la resta no significa que se movió»).
 * 4. Notebook de Colab: pendiente; si sobra tiempo.
 *
 * Revisión con datos reales (14-nov, docs/pedidos §3 y docs/hallazgos): cada nivel se miró en la vista previa
 * con sus fotos precalculadas (public/precalc/mision/). Desplazamientos medidos (primera → última visita):
 * WISE 0855 D5 ×10: 0,95 px al oeste (esperado 1,33); eps Ind B D5 ×10: 0,79 px al este y 0,74 al sur
 * (esperado 0,93 y 0,57); con 1 exposición ninguno de los dos se ve.
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
  /** Exposiciones sumadas (mediana) por visita: los objetos débiles necesitan más (docs/hallazgos). */
  porVisita: number;
  /** Oculto en el recorrido: lo que muestran los datos no permite una pregunta honesta (docs/pedidos §3). */
  oculto?: boolean;
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
        "En enero de 1930, Clyde Tombaugh, de 23 años, fotografió la misma zona del cielo dos veces, con seis días de diferencia, en el Observatorio Lowell (Arizona). Buscaban un «Planeta X».",
    },
    {
      titulo: "El truco: hacerlas [[parpadeo|parpadear]]",
      texto:
        "Con una máquina iba alternando las dos fotos muy rápido. Las estrellas lejanas quedaban quietas, pero un puntito saltaba de lugar. El 18 de febrero de 1930 lo vio: era Plutón.",
    },
    {
      titulo: "Ahora te toca a ti",
      texto:
        "[[spherex|SPHEREx]], un telescopio de la NASA, fotografía todo el cielo cada seis meses. Vas a usar sus fotos reales para encontrar estrellas que se mueven… y para aprender a no dejarte engañar.",
    },
  ],

  niveles: [
    {
      id: "barnard",
      porVisita: 1,
      titulo: "La estrella con prisa",
      banda: "2",
      size: 0.05,
      contexto:
        "La Estrella de Barnard es la estrella que más rápido cruza nuestro cielo. Es tan brillante que satura la cámara: por eso se ve como un anillo con el centro vacío.",
      comoMirar:
        "Mira el parpadeo y después la [[resta]]: en rojo está donde aparece en la última foto; en azul, donde estaba en la primera. Fíjate en los bordes del anillo.",
      pregunta: "¿Hacia dónde se movió la estrella?",
      opciones: [
        { texto: "Hacia arriba (norte)", correcta: true, explicacion: "¡Exacto! El borde rojo queda arriba y el azul abajo: se movió hacia el norte, casi 2 [[pixel|píxeles]] en un año. Ese es su [[movimiento-propio|movimiento propio]], unos 10 segundos de arco por año." },
        { texto: "Hacia abajo (sur)", correcta: false, explicacion: "Mira otra vez la resta: el azul es dónde estaba antes y el rojo dónde está ahora. ¿Cuál queda arriba?" },
        { texto: "Hacia un costado", correcta: false, explicacion: "Casi: se mueve un poquito de lado, pero sobre todo en otra dirección. Fíjate en los bordes rojo y azul del anillo." },
        { texto: "No se movió", correcta: false, explicacion: "Se mueve poco, pero se mueve: compara la primera foto con la última en el parpadeo." },
      ],
      verificado: true, // 14-nov: resta (render de Bryan) con borde rojo arriba y azul abajo; anillo por saturación
    },
    {
      id: "wise_0855",
      porVisita: 10,
      titulo: "La enana marrón invisible",
      banda: "5",
      size: 0.05,
      contexto:
        "WISE 0855 es una [[enana-marron|enana marrón]] tan fría que casi no se ve en luz visible: solo asoma en el [[infrarrojo]] largo ([[banda]] D5). Es tan débil que en una sola foto no se distingue del ruido, así que sumamos 10 fotos de cada visita.",
      comoMirar: "Busca el puntito débil en el centro, mira el parpadeo y después la resta.",
      pregunta: "¿Qué cambió entre la primera y la última foto: la posición o el brillo?",
      opciones: [
        { texto: "La posición", correcta: true, explicacion: "¡Bien! En la resta hay una pareja: azul a la izquierda (donde estaba) y rojo a la derecha (donde está). Se corrió casi 1 píxel en un año hacia el oeste: poquito, pero real." },
        { texto: "El brillo", correcta: false, explicacion: "Mira la resta: si solo cambiara el brillo verías una mancha de un solo color. Aquí hay una pareja azul-rojo pegada: eso es movimiento." },
        { texto: "Nada", correcta: false, explicacion: "Es débil, así que cuesta. Usa la resta: ¿ves la pareja azul-rojo justo en el centro?" },
      ],
      verificado: true, // 14-nov: D5 ×10, pareja azul E / rojo O; medido 0,95 px O en 1,0 año (esperado 1,33)
    },
    {
      id: "eps_ind_b",
      porVisita: 10,
      titulo: "Dos enanas que viajan juntas",
      banda: "5",
      size: 0.05,
      contexto:
        "Epsilon Indi B son dos enanas marrones que viajan juntas (en SPHEREx se ven como un solo punto). También son débiles, así que sumamos 10 fotos de cada visita.",
      comoMirar: "En la resta, busca la pareja azul-rojo en el centro: el azul es dónde estaba, el rojo dónde está ahora.",
      pregunta: "¿Hacia dónde se movieron?",
      opciones: [
        { texto: "Hacia abajo y a la izquierda (sureste)", correcta: true, explicacion: "¡Exacto! El azul queda arriba a la derecha y el rojo abajo a la izquierda: se movieron hacia el sureste, casi 1 píxel en año y medio. Cada estrella cercana tiene su propio camino." },
        { texto: "Hacia arriba (norte), como Barnard", correcta: false, explicacion: "No todas van hacia el mismo lado. Mira dónde queda el rojo respecto del azul." },
        { texto: "No se movieron", correcta: false, explicacion: "Se mueven poco, pero la pareja azul-rojo en el centro lo delata." },
      ],
      verificado: true, // 14-nov: D5 ×10, azul arriba-derecha / rojo abajo-izquierda; medido 0,79 px E y 0,74 S
    },
    {
      id: "rw_aur",
      porVisita: 1,
      titulo: "¿Todo lo que aparece en la resta se movió?",
      banda: "2",
      size: 0.05,
      contexto:
        "RW Aurigae es una estrella joven rodeada de gas y polvo. Casi no se mueve en el cielo: 500 veces menos que Barnard. Aun así, en la resta aparece una mancha. Un buen investigador desconfía antes de celebrar.",
      comoMirar:
        "Mira la resta: la estrella del centro sale casi toda roja. Compárala con lo que viste en Barnard, WISE 0855 y Epsilon Indi B.",
      pregunta: "La resta muestra una mancha sobre RW Aurigae. ¿Significa que se movió?",
      opciones: [
        { texto: "Sí, se movió hacia la izquierda", correcta: false, explicacion: "¡Cuidado! Su movimiento es tan pequeño que en un año no alcanza ni una centésima de píxel. Una mancha en la resta no basta para decir que algo se movió." },
        { texto: "No: cambió cuánto brilla en la foto, no su lugar", correcta: true, explicacion: "¡Muy bien! Es una [[variable|estrella variable]], y además las dos fotos son en colores un poco distintos: por eso brilla distinto. Una mancha de un solo color es un cambio de brillo; los bordes finos vienen de la saturación de la cámara. Lo que encuentres en una resta es un [[candidato]] hasta que lo compruebes." },
        { texto: "Es el Planeta X", correcta: false, explicacion: "Sería genial, pero no: un planeta lejano se vería como un puntito que cambia de lugar entre muchas fotos, no como una mancha sobre una estrella conocida. Primero se descarta lo más simple." },
      ],
      esDuda: true,
      verificado: true, // 14-nov: D2 ×1, mancha roja con borde azul fino; RW Aur se mueve 0,02″/año
    },
    {
      id: "r_dra",
      porVisita: 1,
      oculto: true, // docs/pedidos §3: centro saturado (agujero) y λ de 1,19 a 1,64 µm entre fotos: sin pregunta honesta
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
      "Encontraste estrellas que se mueven, viste que algunas solo aparecen sumando muchas fotos y aprendiste a desconfiar: no todo lo que aparece en la resta es movimiento. Así trabajan los voluntarios que han descubierto enanas marrones mirando fotos del cielo.",
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
    sumaExposiciones: (n: number) => `${n} fotos sumadas por visita`,
    avisoLambda: (a: number, z: number) =>
      `Las dos fotos son en colores algo distintos (${a.toFixed(2)} y ${z.toFixed(2)} µm): un cambio de brillo puede venir del filtro, no del objeto.`,
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
  banda: { termino: "Banda", definicion: "Uno de los seis detectores de SPHEREx, de D1 (la luz más «azul») a D6 (la más «roja»). Cada banda se divide en 17 canales: 102 colores en total." },
  infrarrojo: { termino: "Infrarrojo", definicion: "Luz que nuestros ojos no ven, más «roja» que el rojo. La emiten sobre todo los objetos tibios y fríos." },
  "movimiento-propio": { termino: "Movimiento propio", definicion: "Cuánto se corre una estrella en el cielo cada año, porque se mueve de verdad por la galaxia." },
  "enana-marron": { termino: "Enana marrón", definicion: "Un objeto más grande que un planeta pero demasiado pequeño para brillar como estrella. Se ve sobre todo en infrarrojo." },
  variable: { termino: "Estrella variable", definicion: "Una estrella cuyo brillo cambia con el tiempo, a veces en días, a veces en meses o años." },
  flags: { termino: "Marcas de calidad", definicion: "Cada foto de SPHEREx indica qué píxeles pueden estar dañados: rayos cósmicos, saturación o reflejos." },
  espectro: { termino: "Espectro", definicion: "Cuánto brilla algo en cada color de luz. Es como su huella digital: delata de qué está hecho y qué tan caliente está." },
  candidato: { termino: "Candidato", definicion: "Algo que parece interesante pero todavía no se confirma. Hay que revisarlo con más fotos y catálogos." },
};
