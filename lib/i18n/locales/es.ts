import type { LandingTranslations } from "./en";

export const es: LandingTranslations = {
  nav: {
    howItWorks: "Cómo funciona",
    features: "Características",
    languages: "Idiomas",
    signIn: "Iniciar sesión",
    downloadFree: "Descargar gratis",
    dashboard: "Dashboard",
  },
  hero: {
    headline1: "La forma más rápida de escribir",
    headline2: "es no escribir.",
    subheadline:
      "Hablá. Bisbi escribe lo que decís — en cualquier app, en cualquier idioma.",
    freeBadge: "Gratis para empezar. Sin tarjeta de crédito. Mac y Windows.",
  },
  download: {
    mac: "Descargar para Mac",
    windows: "Descargar para Windows",
    starting: "Iniciando descarga…",
  },
  howItWorks: {
    badge: "Cómo funciona",
    title: "Tres pasos. Nada más.",
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
      previousTranscript: "Bisbi me encanta.",
      transcript:
        "Hola equipo — un update rápido. El lanzamiento sale el viernes.",
      editorTitle: "Sin título — Notas",
      editorPlaceholder: "Escribí un mensaje…",
      pasteHint: "El texto se pega automáticamente donde estés escribiendo.",
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
          "Detección automática. Hablá en uno, escribí en otro.",
      },
      {
        title: "Mac y Windows",
        description:
          "Apps nativas para las dos plataformas. Misma experiencia, mismo atajo, mismo resultado.",
      },
    ],
  },
  cta: {
    title: "Empezá a hablar hoy.",
    description:
      "Descargá Bisbi gratis. Funciona en Mac y Windows. Sin suscripción para empezar.",
    signInHint: "¿Ya tenés cuenta?",
    signIn: "Iniciar sesión",
  },
  footer: {
    tagline1: "Dictado por voz, 100% local.",
    tagline2: "Hablá. Aparece.",
    contact: "Contacto",
    legal: "Legal",
    rights: "Todos los derechos reservados.",
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
    statWords: "palabras transcritas",
    statWpm: "palabras por minuto",
    recentSection: "Transcripciones recientes",
    seeMore: "Ver todo en Historial",
    badgeIdle: "Listo",
    plan: { pro: "Pro" },
    user: { name: "Lucía García", initial: "L" },
    dateGroups: { today: "Hoy", yesterday: "Ayer" },
    recent: [
      "Mandale las notas de la revisión de diseño a Marta y confirmá que seguimos para el jueves.",
      "Recordatorio para actualizar el copy del onboarding con los nuevos planes.",
      "[Música] Borrador de email: gracias de nuevo por la presentación. Me encantaría agendar una llamada la próxima semana.",
    ],
  },
  dashboard: {
    greeting: "Hola {name} 👋",
    ready: "Tu cuenta está lista. Descargá Bisbi y empezá a dictar.",
    downloadMac: "Descargar para Mac",
    downloadWindows: "Descargar para Windows",
    starting: "Iniciando descarga…",
    hint: "Tu suscripción y ajustes se gestionan dentro de la app.",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión…",
  },
};
