import { en, type LandingTranslations } from "./en";

export const ar: LandingTranslations = {
  nav: {
    howItWorks: "كيف يعمل",
    features: "المميزات",
    languages: "اللغات",
    signIn: "تسجيل الدخول",
    downloadFree: "تنزيل مجاني",
    dashboard: "لوحة التحكم",
  },
  hero: {
    headline1: "أسرع طريقة للكتابة",
    headline2: "هي عدم الكتابة.",
    subheadline:
      "تكلّم. يكتب Bisbi ما تقوله — في أي تطبيق، بأي لغة.",
    freeBadge: "مجاني للبدء. بدون بطاقة ائتمان. Mac و Windows و Linux.",
  },
  download: {
    mac: "تنزيل لـ Mac",
    windows: "تنزيل لـ Windows",
    linux: "تنزيل لـ Linux",
    starting: "جارٍ بدء التنزيل…",
  },
  howItWorks: {
    badge: "كيف يعمل",
    title: "ثلاث خطوات. هذا كل شيء.",
    stepLabel: "خطوة",
    steps: [
      {
        title: "اضغط اختصارك",
        description: "الاختصار الذي تختاره. يبدأ Bisbi بالاستماع فوراً.",
      },
      {
        title: "تكلم بشكل طبيعي",
        description: "قل ما تحتاجه. أي لغة، أي لهجة، أي سرعة.",
      },
      {
        title: "يظهر النص",
        description: "يكتب Bisbi تماماً حيث يوجد مؤشرك.",
      },
    ],
    demo: {
      greeting: "صباح الخير",
      statusIdle: "جاهز للاستماع",
      statusRecording: "يسجّل الآن",
      titleHint: "اضغط الاختصار وتحدّث.",
      hotkeyLabel: "الاختصار",
      idleHint: "اضغط الاختصار وتحدّث.",
      recordingLabel: "يسجّل الآن",
      recordingHint: "تحدّث بشكل طبيعي. Bisbi يستمع.",
      transcribing: "يكتب",
      previousTranscript: "أحبّ استخدام Bisbi.",
      transcript:
        "مرحبًا بالفريق — تحديث سريع: الإطلاق في موعده يوم الجمعة.",
      editorTitle: "ملاحظات الاجتماع — ملاحظات",
      editorPlaceholder: "اكتب رسالة…",
      pasteHint: "يتم لصق النص تلقائيًا حيث تكتب.",
    },
  },
  features: {
    badge: "المميزات",
    title: "كل ما تحتاجه. لا أكثر.",
    items: [
      {
        title: "يعمل في أي تطبيق",
        description:
          "Slack، Gmail، Notion، Word، الطرفية، المتصفح — حيثما كان مؤشرك، يكتب Bisbi.",
      },
      {
        title: "اضغط وتكلم",
        description:
          "اختصار واحد. تكلم بشكل طبيعي. دون فتح أي شيء أو تبديل نافذة.",
      },
      {
        title: "99 لغة",
        description:
          "كشف تلقائي. تكلّم بواحدة، اكتب بأخرى.",
      },
      {
        title: "Mac و Windows و Linux",
        description:
          "تطبيقات أصلية للمنصات الثلاث. نفس التجربة، نفس الاختصار، نفس النتيجة.",
      },
    ],
  },
  cta: {
    title: "ابدأ التكلم",
    titleHighlight: "اليوم.",
    description:
      "حمّل Bisbi مجاناً. يعمل على Mac و Windows و Linux. لا تحتاج اشتراكاً للبدء.",
    signInHint: "لديك حساب؟",
    signIn: "تسجيل الدخول",
  },
  footer: {
    tagline1: "إملاء صوتي، 100% محلي.",
    tagline2: "تكلم. يظهر.",
    contact: "تواصل",
    legal: "قانوني",
    rights: "جميع الحقوق محفوظة.",
    createdBy: "صُنع بواسطة",
  },
  demoApp: {
    nav: { home: "الرئيسية", history: "السجل", settings: "الإعدادات" },
    greetings: {
      lateNight: "تصبح على خير",
      morning: "صباح الخير",
      afternoon: "مساء الخير",
      evening: "مساء الخير",
    },
    statusTitle: "جاهز للاستماع",
    titleHint: "اضغط الاختصار وتحدّث.",
    hotkeyLabel: "اختصار",
    hotkeyHint: "يُلصق النص تلقائياً أينما كنت تكتب.",
    activitySection: "نشاطك",
    statTranscriptions: "نسخة",
    statDictated: "أُمليت",
    statWords: "كلمة منسوخة",
    statWpm: "كلمة في الدقيقة",
    recentSection: "النسخ الأخيرة",
    seeMore: "اعرض الكل في السجل",
    badgeIdle: "جاهز",
    plan: { pro: "احترافي" },
    user: { name: "ليلى أحمد", initial: "ل" },
    dateGroups: { today: "اليوم", yesterday: "أمس" },
    recent: [
      "أرسل ملاحظات مراجعة التصميم إلى مارتا وأكّد موعدنا يوم الخميس.",
      "تذكير بتحديث نص الإعداد الأولي بأسعار الخطط الجديدة.",
      "[موسيقى] مسودة بريد: شكراً مرة أخرى على التعريف. أودّ تحديد موعد لمكالمة قصيرة الأسبوع المقبل.",
    ],
  },
  dashboard: {
    greeting: "مرحباً {name}!",
    fallbackName: "صديقي",
    ready: "حسابك جاهز. نزّل Bisbi وابدأ الإملاء.",
    downloadMac: "تنزيل لـ Mac",
    downloadWindows: "تنزيل لـ Windows",
    downloadLinux: "تنزيل لـ Linux",
    starting: "جارٍ بدء التنزيل…",
    hint: "اشتراكك وإعداداتك تُدار داخل التطبيق.",
    signOut: "تسجيل الخروج",
    signingOut: "جارٍ الخروج…",
    checkoutSuccessTitle: "مرحباً بك في Pro!",
    checkoutSuccessSubtitle: "تم تفعيل الإملاء بلا حدود. تكلّم كما تشاء.",
    checkoutCancelTitle: "لا مشكلة",
    checkoutCancelSubtitle: "لا تزال على الخطة المجانية. يمكنك الترقية في أي وقت من Bisbi.",
    planFreeBadge: "الخطة المجانية · جاهز للحديث بلا حدود؟ ترقَّ إلى Pro",
    planProBadge: "خطة Pro فعّالة · تكلّم كما تشاء",
    inboxButton: "البريد الوارد",
    settingsButton: "الإعدادات",
  },
  login: {
    welcome: "مرحباً بك في Bisbi",
    accessAccount: "ادخل إلى حساب {appName} الخاص بك",
    subtitle: "سجّل الدخول لتنزيل Bisbi",
    continueWithGoogle: "المتابعة باستخدام Google",
    connecting: "جارٍ الاتصال…",
    loading: "جارٍ التحميل…",
    successTitle: "تم تسجيل الدخول",
    successSubtitle: "سنعيدك إلى {appName}",
    openApp: "فتح {appName}",
    openingHint: "سيُفتح تلقائياً، أو اضغط الزر أعلاه",
    backToApp: "العودة إلى التطبيق",
  },
  admin: en.admin,
};
