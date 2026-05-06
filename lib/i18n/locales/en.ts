export const en = {
  nav: {
    howItWorks: "How it works",
    features: "Features",
    languages: "Languages",
    signIn: "Sign in",
    downloadFree: "Download free",
    dashboard: "Dashboard",
  },
  hero: {
    headline1: "The fastest way to write",
    headline2: "is not to write.",
    subheadline:
      "Speak. Bisbi types what you say — in any app, in any language.",
    freeBadge: "Free to start. No credit card. Mac & Windows.",
  },
  download: {
    mac: "Download for Mac",
    windows: "Download for Windows",
    starting: "Starting download…",
  },
  howItWorks: {
    badge: "How it works",
    title: "Three steps. That's it.",
    steps: [
      {
        title: "Press your shortcut",
        description:
          "The shortcut you choose. Bisbi starts listening instantly.",
      },
      {
        title: "Speak naturally",
        description:
          "Say what you need. Any language, any accent, any speed.",
      },
      {
        title: "Text appears",
        description: "Bisbi types it exactly where your cursor is.",
      },
    ],
    demo: {
      greeting: "Good morning",
      statusIdle: "Ready to listen",
      statusRecording: "Recording now",
      titleHint: "Press the hotkey and speak.",
      hotkeyLabel: "Hotkey",
      idleHint: "Press the hotkey and speak.",
      recordingLabel: "Recording now",
      recordingHint: "Speak naturally. Bisbi is listening.",
      previousTranscript: "I love using Bisbi.",
      transcript:
        "Hey team — quick heads up. The launch is on track for Friday.",
      editorTitle: "Untitled — Notes",
      editorPlaceholder: "Type a message…",
      pasteHint: "The text is pasted automatically wherever you are typing.",
    },
  },
  features: {
    badge: "Features",
    title: "Everything you need. Nothing you don't.",
    items: [
      {
        title: "Works in any app",
        description:
          "Slack, Gmail, Notion, Word, terminal, browser — wherever your cursor is, Bisbi types.",
      },
      {
        title: "Press and speak",
        description:
          "One shortcut. Speak naturally. No window to open, no app to switch.",
      },
      {
        title: "99 languages",
        description:
          "Automatic detection. Speak in one, type in another.",
      },
      {
        title: "Mac & Windows",
        description:
          "Native apps for both platforms. Same experience, same shortcut, same result.",
      },
    ],
  },
  cta: {
    title: "Start speaking today.",
    description:
      "Download Bisbi free. Works on Mac and Windows. No subscription to get started.",
    signInHint: "Already have an account?",
    signIn: "Sign in",
  },
  footer: {
    tagline1: "Voice dictation, 100% local.",
    tagline2: "Speak. It appears.",
    contact: "Contact",
    legal: "Legal",
    rights: "All rights reserved.",
  },
  demoApp: {
    nav: { home: "Home", history: "History", settings: "Settings" },
    greetings: {
      lateNight: "Good night",
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    statusTitle: "Ready to listen",
    titleHint: "Press the hotkey and speak.",
    hotkeyLabel: "Hotkey",
    hotkeyHint: "The text is pasted automatically wherever you are typing.",
    activitySection: "Your activity",
    statTranscriptions: "transcriptions",
    statDictated: "dictated",
    statWords: "words transcribed",
    statWpm: "words per minute",
    recentSection: "Recent transcriptions",
    seeMore: "See all in History",
    badgeIdle: "Ready",
    plan: { pro: "Pro" },
    user: { name: "Jane Doe", initial: "J" },
    dateGroups: { today: "Today", yesterday: "Yesterday" },
    recent: [
      "Send the design review notes to Marta and confirm we are still on for Thursday.",
      "Reminder to update the onboarding copy with the new pricing tiers.",
      "[Music] Draft email: thanks again for the introduction. I would love to schedule a quick call next week.",
    ],
  },
  dashboard: {
    greeting: "Hey {name} 👋",
    ready: "Your account is ready. Download Bisbi and start dictating.",
    downloadMac: "Download for Mac",
    downloadWindows: "Download for Windows",
    starting: "Starting download…",
    hint: "Your subscription and settings are managed inside the app.",
    signOut: "Sign out",
    signingOut: "Signing out…",
  },
};

export type LandingTranslations = typeof en;
