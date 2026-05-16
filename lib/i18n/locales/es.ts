import type { LandingTranslations } from "./en";

export const es: LandingTranslations = {
  hero: {
    headline1: "La forma más rápida de escribir",
    headline2: "es no escribir.",
    subheadline:
      "Hablá. Bisbi escribe lo que decís — en cualquier app, en cualquier idioma.",
    freeBadge: "Gratis y open source. Mac y Windows.",
  },
  download: {
    mac: "Descargar para Mac",
    windows: "Descargar para Windows",
    linux: "Descargar para Linux",
    starting: "Iniciando descarga…",
  },
  howItWorks: {
    badge: "Cómo funciona",
    title: "Tres pasos. Nada más.",
    stepLabel: "Paso",
    steps: [
      {
        title: "Apretá tu shortcut",
        description:
          "El atajo que vos elijas. Bisbi empieza a escuchar al instante.",
      },
      {
        title: "Hablá natural",
        description:
          "Decí lo que necesites. Cualquier idioma, cualquier acento, cualquier velocidad.",
      },
      {
        title: "Aparece el texto",
        description:
          "Bisbi lo escribe exactamente donde tengas el cursor.",
      },
    ],
    demo: {
      greeting: "Buenos días",
      statusIdle: "Listo para escuchar",
      statusRecording: "Grabando ahora",
      titleHint: "Apretá el atajo y hablá.",
      hotkeyLabel: "Atajo",
      idleHint: "Apretá el atajo y hablá.",
      recordingLabel: "Grabando ahora",
      recordingHint: "Hablá natural. Bisbi te está escuchando.",
      transcribing: "Transcribiendo",
      previousTranscript: "Bisbi me encanta.",
      transcript:
        "Querido Bisbi, tengo que confesártelo: me cambiaste la vida. Antes escribía con dos dedos y mucha paciencia.",
      transcriptLong:
        "Ahora simplemente hablo y la magia ocurre — adiós muñecas doloridas, hola productividad y un poco de magia en mi día.",
      transcriptOwl:
        "Aquí te dejo una foto de mi búho favorito que me hace acordar a tu logo:",
      editorTitle: "Notas de reunión — Notas",
      editorPlaceholder: "Escribí un mensaje…",
      pasteHint: "El texto se pega automáticamente donde estés escribiendo.",
      docsTitle: "Carta a Bisbi que me encanta esta app",
      docsLabel: "Docs",
      menuFile: "Archivo",
      menuEdit: "Editar",
      menuView: "Ver",
      menuInsert: "Insertar",
      menuFormat: "Formato",
      menuTools: "Herramientas",
      menuExtensions: "Extensiones",
      menuHelp: "Ayuda",
      share: "Compartir",
      normalText: "Texto normal",
    },
  },
  features: {
    badge: "Características",
    title: "Todo lo que necesitás. Nada que no.",
    items: [
      {
        title: "Funciona en cualquier app",
        description:
          "Slack, Gmail, Notion, Word, terminal, navegador — donde sea que esté tu cursor, Bisbi escribe.",
      },
      {
        title: "Apretá y hablá",
        description:
          "Un solo atajo. Hablá natural. Sin abrir nada, sin cambiar de ventana.",
      },
      {
        title: "99 idiomas",
        description:
          "Reconoce tu voz en cualquier idioma, automáticamente.",
      },
    ],
  },
  socialProof: {
    badge: "Voces",
    title: "Hecho para tu forma de hablar.",
    items: [
      {
        quote:
          "Pienso más rápido de lo que tipeo. Ya no hay distancia entre la idea y la pantalla.",
        role: "Alguien que escribe",
      },
      {
        quote: "Respuestas largas, en segundos.",
        role: "Una bandeja de entrada ocupada",
      },
      {
        quote:
          "Dicto mientras camino. Las notas me esperan cuando me siento.",
        role: "Alguien en movimiento",
      },
      {
        quote: "Cambio de idioma a mitad de oración. Bisbi me sigue.",
        role: "Alguien bilingüe",
      },
      {
        quote: "Mis muñecas dejaron de doler.",
        role: "Alguien que tipea mucho",
      },
    ],
  },
  speedComparison: {
    badge: "Velocidad",
    title: "4× más rápido que tipear.",
    description:
      "Tu voz va más rápido que tus dedos. Bisbi convierte lo que decís en texto al instante — donde sea que estés escribiendo.",
    unit: "ppm",
    unitFull: "palabras por minuto",
    keyboardLabel: "Tipeando",
    keyboardHint: "El promedio de cualquier persona en un teclado.",
    keyboardFooter: "La mayoría del tiempo",
    bisbiLabel: "Hablando con Bisbi",
    bisbiHint: "Tu voz al ritmo natural de pensamiento.",
    bisbiFooter: "5× más rápido",
    phrases: [
      "Mandale el contrato firmado al cliente.",
      "function calculateTotal(items) { return ...",
      "El paciente presenta dolor abdominal agudo.",
      "Resumen capítulo 4 — oferta y demanda.",
      "Borrador del newsletter de la semana.",
      "Querido diario, hoy fue un día tranquilo.",
      "Acta de reunión — presupuesto aprobado.",
      "Receta: 200g de harina, 3 huevos, sal.",
      "Te quiero, mamá. Llamame cuando puedas.",
      "Tweet: acabo de descubrir Bisbi y la rompe.",
      "Subtítulo del próximo video: cómo empezar.",
      "Confirmá el turno del jueves a las 3pm.",
      "TODO: refactorizar el middleware mañana.",
      "Respondele a Sara sobre el feedback de la propuesta.",
    ],
  },
  pricing: {
    title1: "Gratis para todos.",
    title2: "Open source.",
    description:
      "Bisbi es 100% gratis y open source. Sin cuentas, sin suscripciones, sin límites. Descargalo y empezá a dictar.",
    free: {
      name: "Gratis",
      price: "$0",
      period: "para siempre",
      tagline: "Todo lo que Bisbi puede hacer, sin letra chica.",
      features: [
        "Dictado ilimitado",
        "Mac y Windows",
        "99 idiomas",
        "Cero retención — tu audio queda privado",
        "Open source en GitHub",
      ],
      sourceLink: "Ver el código en GitHub →",
    },
  },
  cta: {
    title: "Empezá a hablar.",
    titleHighlight: "Tu teclado te lo agradece.",
    description:
      "Descargá Bisbi gratis para Mac o Windows. Sin cuenta, sin suscripción.",
    freeBadge: "Gratis para siempre. Open source.",
  },
  footer: {
    source: "Código",
    rights: "Todos los derechos reservados.",
    createdBy: "Creado por",
  },
  demoApp: {
    nav: { home: "Inicio", history: "Historial", settings: "Ajustes" },
    greetings: {
      lateNight: "Buenas noches",
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
    },
    statusTitle: "Listo para escuchar",
    titleHint: "Presioná el atajo y hablá.",
    hotkeyLabel: "Atajo",
    hotkeyHint: "El texto se pega automáticamente donde estés escribiendo.",
    activitySection: "Tu actividad",
    statTranscriptions: "transcripciones",
    statDictated: "dictado",
    statWords: "palabras",
    statWpm: "ppm",
    recentSection: "Transcripciones recientes",
    seeMore: "Ver todo en Historial",
    badgeIdle: "Listo",
    plan: { pro: "Pro" },
    user: { name: "Joaquin", initial: "J" },
    dateGroups: { today: "Hoy", yesterday: "Ayer" },
    recent: [
      "Mandale las notas de la revisión de diseño a Marta y confirmá que seguimos para el jueves.",
      "Recordatorio para actualizar el copy del onboarding con los nuevos planes.",
      "[Música] Borrador de email: gracias de nuevo por la presentación. Me encantaría agendar una llamada la próxima semana.",
    ],
  },
};
