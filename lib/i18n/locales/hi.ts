import type { LandingTranslations } from "./en";

export const hi: LandingTranslations = {
  nav: {
    howItWorks: "यह कैसे काम करता है",
    features: "विशेषताएं",
    languages: "भाषाएं",
    signIn: "साइन इन",
    downloadFree: "मुफ्त डाउनलोड",
    dashboard: "डैशबोर्ड",
  },
  hero: {
    headline1: "लिखने का सबसे तेज़ तरीका",
    headline2: "है न लिखना।",
    subheadline:
      "बोलें। Bisbi वही लिखता है जो आप कहते हैं — किसी भी ऐप में, किसी भी भाषा में।",
    freeBadge: "मुफ्त शुरू करें। क्रेडिट कार्ड नहीं चाहिए। Mac, Windows और Linux।",
  },
  download: {
    mac: "Mac के लिए डाउनलोड",
    windows: "Windows के लिए डाउनलोड",
    linux: "Linux के लिए डाउनलोड",
    starting: "डाउनलोड शुरू हो रहा है…",
  },
  howItWorks: {
    badge: "यह कैसे काम करता है",
    title: "तीन चरण। बस इतना।",
    stepLabel: "चरण",
    steps: [
      {
        title: "अपना शॉर्टकट दबाएं",
        description:
          "आपका चुना हुआ शॉर्टकट। Bisbi तुरंत सुनना शुरू करता है।",
      },
      {
        title: "स्वाभाविक रूप से बोलें",
        description:
          "जो चाहिए कहें। कोई भी भाषा, कोई भी लहजा, कोई भी गति।",
      },
      {
        title: "टेक्स्ट दिखता है",
        description: "Bisbi ठीक वहाँ लिखता है जहाँ आपका कर्सर है।",
      },
    ],
    demo: {
      greeting: "सुप्रभात",
      statusIdle: "सुनने के लिए तैयार",
      statusRecording: "अभी रिकॉर्डिंग हो रही है",
      titleHint: "हॉटकी दबाएँ और बोलें।",
      hotkeyLabel: "हॉटकी",
      idleHint: "हॉटकी दबाएँ और बोलें।",
      recordingLabel: "अभी रिकॉर्डिंग हो रही है",
      recordingHint: "स्वाभाविक रूप से बोलें। Bisbi सुन रहा है।",
      transcribing: "ट्रांसक्राइब हो रहा है",
      previousTranscript: "मुझे Bisbi बहुत पसंद है।",
      transcript:
        "टीम — एक छोटा अपडेट। लॉन्च शुक्रवार को तय समय पर है।",
      editorTitle: "मीटिंग नोट्स — नोट्स",
      editorPlaceholder: "एक संदेश लिखें…",
      pasteHint: "जहाँ आप टाइप कर रहे हैं, वहाँ टेक्स्ट अपने आप पेस्ट हो जाता है।",
    },
  },
  features: {
    badge: "विशेषताएं",
    title: "जो चाहिए वो सब। जो नहीं चाहिए वो कुछ नहीं।",
    items: [
      {
        title: "किसी भी ऐप में काम करता है",
        description:
          "Slack, Gmail, Notion, Word, टर्मिनल, ब्राउज़र — कर्सर जहाँ हो, Bisbi वहाँ लिखता है।",
      },
      {
        title: "दबाएं और बोलें",
        description:
          "एक शॉर्टकट। स्वाभाविक रूप से बोलें। कुछ खोलने या बदलने की ज़रूरत नहीं।",
      },
      {
        title: "99 भाषाएं",
        description:
          "स्वतः पहचान। एक में बोलें, दूसरे में लिखें।",
      },
      {
        title: "Mac, Windows और Linux",
        description:
          "तीनों प्लेटफॉर्म के लिए नेटिव ऐप। एक ही अनुभव, एक ही शॉर्टकट, एक ही नतीजा।",
      },
    ],
  },
  cta: {
    title: "बोलना शुरू करें",
    titleHighlight: "आज।",
    description:
      "Bisbi मुफ्त डाउनलोड करें। Mac, Windows और Linux पर काम करता है। शुरू करने के लिए कोई सदस्यता नहीं।",
    signInHint: "पहले से खाता है?",
    signIn: "साइन इन",
  },
  footer: {
    tagline1: "वॉयस डिक्टेशन, 100% लोकल।",
    tagline2: "बोलें। दिखता है।",
    contact: "संपर्क",
    legal: "कानूनी",
    rights: "सर्वाधिकार सुरक्षित।",
    createdBy: "द्वारा बनाया गया",
  },
  demoApp: {
    nav: { home: "होम", history: "इतिहास", settings: "सेटिंग्स" },
    greetings: {
      lateNight: "शुभ रात्रि",
      morning: "सुप्रभात",
      afternoon: "नमस्ते",
      evening: "शुभ संध्या",
    },
    statusTitle: "सुनने के लिए तैयार",
    titleHint: "हॉटकी दबाएं और बोलें।",
    hotkeyLabel: "हॉटकी",
    hotkeyHint: "जहां आप टाइप कर रहे हैं, वहीं टेक्स्ट अपने आप पेस्ट हो जाता है।",
    activitySection: "आपकी गतिविधि",
    statTranscriptions: "ट्रांसक्रिप्शन",
    statDictated: "बोले गए",
    statWords: "शब्द ट्रांसक्राइब",
    statWpm: "शब्द प्रति मिनट",
    recentSection: "हालिया ट्रांसक्रिप्शन",
    seeMore: "इतिहास में सब देखें",
    badgeIdle: "तैयार",
    plan: { pro: "प्रो" },
    user: { name: "प्रिया शर्मा", initial: "प्र" },
    dateGroups: { today: "आज", yesterday: "कल" },
    recent: [
      "मार्ता को डिज़ाइन रिव्यू नोट्स भेजें और गुरुवार की पुष्टि करें।",
      "नई प्राइसिंग के साथ ऑनबोर्डिंग कॉपी अपडेट करने का रिमाइंडर।",
      "[संगीत] ईमेल ड्राफ़्ट: परिचय के लिए एक बार फिर धन्यवाद। अगले हफ्ते एक छोटी कॉल शेड्यूल करना चाहूंगा।",
    ],
  },
  dashboard: {
    greeting: "नमस्ते {name}!",
    ready:
      "आपका खाता तैयार है। Bisbi डाउनलोड करें और डिक्टेट करना शुरू करें।",
    downloadMac: "Mac के लिए डाउनलोड",
    downloadWindows: "Windows के लिए डाउनलोड",
    downloadLinux: "Linux के लिए डाउनलोड",
    starting: "डाउनलोड शुरू हो रहा है…",
    hint: "आपकी सदस्यता और सेटिंग्स ऐप के अंदर मैनेज की जाती हैं।",
    signOut: "साइन आउट",
    signingOut: "साइन आउट हो रहा है…",
    checkoutSuccessTitle: "Pro में आपका स्वागत है!",
    checkoutSuccessSubtitle: "असीमित डिक्टेशन चालू है। जितना चाहें बात करें।",
    checkoutCancelTitle: "कोई बात नहीं",
    checkoutCancelSubtitle: "आप अभी भी फ्री प्लान पर हैं। आप कभी भी Bisbi से अपग्रेड कर सकते हैं।",
    planFreeBadge: "फ्री प्लान · बिना सीमा बात करने के लिए तैयार? Pro बनें",
    planProBadge: "Pro प्लान सक्रिय · जितना चाहें बात करें",
  },
  login: {
    welcome: "Bisbi में आपका स्वागत है",
    accessAccount: "अपने {appName} खाते में प्रवेश करें",
    subtitle: "Bisbi डाउनलोड करने के लिए साइन इन करें",
    continueWithGoogle: "Google के साथ जारी रखें",
    connecting: "कनेक्ट हो रहा है…",
    loading: "लोड हो रहा है…",
    successTitle: "लॉगिन सफल",
    successSubtitle: "हम आपको {appName} पर वापस ले जाएंगे",
    openApp: "{appName} खोलें",
    openingHint: "अपने आप खुल रहा है, या ऊपर बटन पर क्लिक करें",
    backToApp: "एप्लिकेशन पर वापस जाएं",
  },
};
