export const en = {
  hero: {
    headline1: "The fastest way to write",
    headline2: "is not to write.",
    subheadline:
      "Speak. Bisbi types what you say — in any app, in any language.",
    freeBadge: "Free, open source. Mac and Windows.",
  },
  download: {
    mac: "Download for Mac",
    windows: "Download for Windows",
    starting: "Starting download…",
  },
  howItWorks: {
    badge: "How it works",
    title: "Three steps. That's it.",
    stepLabel: "Step",
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
      transcribing: "Transcribing",
      previousTranscript: "I love using Bisbi.",
      transcript:
        "Dear Bisbi, I have to confess: you changed my life. I used to type with two fingers and a lot of patience.",
      transcriptLong:
        "Now I just talk and the magic happens — goodbye sore wrists, hello productivity and a little bit of joy in my day.",
      transcriptOwl:
        "Here is a photo of my favorite owl that reminds me of your logo:",
      editorTitle: "Meeting notes — Notes",
      editorPlaceholder: "Type a message…",
      pasteHint: "The text is pasted automatically wherever you are typing.",
      docsTitle: "A love letter to Bisbi",
      docsLabel: "Docs",
      menuFile: "File",
      menuEdit: "Edit",
      menuView: "View",
      menuInsert: "Insert",
      menuFormat: "Format",
      menuTools: "Tools",
      menuExtensions: "Extensions",
      menuHelp: "Help",
      share: "Share",
      normalText: "Normal text",
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
          "Recognizes your voice in any language, automatically.",
      },
    ],
  },
  socialProof: {
    badge: "Voices",
    title: "Made for the way you talk.",
    items: [
      {
        quote:
          "I think faster than I type. Now there's no gap between the idea and the screen.",
        role: "A writer",
      },
      {
        quote: "Long replies, in seconds.",
        role: "A busy inbox",
      },
      {
        quote:
          "I dictate on the walk home. The notes are ready when I sit down.",
        role: "On the go",
      },
      {
        quote: "Two languages, one shortcut. No menus, no switching.",
        role: "A bilingual user",
      },
      {
        quote: "My wrists thank me.",
        role: "A heavy keyboard user",
      },
    ],
  },
  speedComparison: {
    badge: "Speed",
    title: "4× faster than typing.",
    description:
      "Your voice is faster than your fingers. Bisbi turns what you say into text instantly — wherever you're typing.",
    unit: "wpm",
    unitFull: "words per minute",
    keyboardLabel: "Typing",
    keyboardHint: "The average person at a keyboard.",
    keyboardFooter: "Most of the time",
    bisbiLabel: "Talking to Bisbi",
    bisbiHint: "Your voice at the natural pace of thought.",
    bisbiFooter: "5× faster",
    phrases: [
      "Send the signed contract to the client.",
      "function calculateTotal(items) { return ...",
      "Patient presents with acute abdominal pain.",
      "Chapter 4 summary — supply and demand.",
      "Draft this week's newsletter intro.",
      "Dear diary, today was a quiet one.",
      "Meeting minutes — budget approved unanimously.",
      "Recipe: 200g flour, 3 eggs, pinch of salt.",
      "Love you, Mom. Call me when you can.",
      "Tweet: just discovered Bisbi and I'm hooked.",
      "Subtitle for the next video: how to start.",
      "Confirm the appointment for Thursday at 3pm.",
      "TODO: refactor the auth middleware tomorrow.",
      "Reply to Sarah about the proposal feedback.",
    ],
  },
  pricing: {
    title1: "Free for everyone.",
    title2: "Open source.",
    description:
      "Bisbi is 100% free and open source. No accounts, no subscriptions, no limits. Download it and start dictating.",
    free: {
      name: "Free",
      price: "$0",
      period: "forever",
      tagline: "Everything Bisbi can do, no strings attached.",
      features: [
        "Unlimited dictation",
        "Mac and Windows",
        "99 languages",
        "Zero retention — your audio stays private",
        "Open source on GitHub",
      ],
      sourceLink: "View source on GitHub →",
    },
  },
  cta: {
    title: "Start speaking",
    titleHighlight: "today.",
    description:
      "Download Bisbi free for Mac or Windows. No account, no subscription.",
    freeBadge: "Free forever. Open source.",
  },
  footer: {
    source: "Source",
    rights: "All rights reserved.",
    createdBy: "Created by",
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
    statWords: "words",
    statWpm: "wpm",
    recentSection: "Recent transcriptions",
    seeMore: "See all in History",
    badgeIdle: "Ready",
    plan: { pro: "Pro" },
    user: { name: "Joaquin", initial: "J" },
    dateGroups: { today: "Today", yesterday: "Yesterday" },
    recent: [
      "Send the design review notes to Marta and confirm we are still on for Thursday.",
      "Reminder to update the onboarding copy with the new pricing tiers.",
      "[Music] Draft email: thanks again for the introduction. I would love to schedule a quick call next week.",
    ],
  },
};

export type LandingTranslations = typeof en;
