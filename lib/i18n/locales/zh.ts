import type { LandingTranslations } from "./en";

export const zh: LandingTranslations = {
  nav: {
    howItWorks: "使用方法",
    features: "功能特点",
    languages: "语言",
    signIn: "登录",
    downloadFree: "免费下载",
    dashboard: "控制台",
  },
  hero: {
    headline1: "写作最快的方式",
    headline2: "是不写。",
    subheadline:
      "说话。Bisbi 写下你说的内容 — 任意应用，任意语言。",
    freeBadge: "免费开始。无需信用卡。Mac、Windows 和 Linux。",
  },
  download: {
    mac: "下载 Mac 版",
    windows: "下载 Windows 版",
    linux: "下载 Linux 版",
    starting: "开始下载…",
  },
  howItWorks: {
    badge: "使用方法",
    title: "三步搞定。就这些。",
    stepLabel: "步骤",
    steps: [
      {
        title: "按下快捷键",
        description: "你选择的快捷键。Bisbi 立即开始监听。",
      },
      {
        title: "自然说话",
        description: "说出你需要的。任何语言，任何口音，任何语速。",
      },
      {
        title: "文字出现了",
        description: "Bisbi 准确地在光标位置帮你写出来。",
      },
    ],
    demo: {
      greeting: "早上好",
      statusIdle: "准备就绪",
      statusRecording: "正在录音",
      titleHint: "按下快捷键开始说话。",
      hotkeyLabel: "快捷键",
      idleHint: "按下快捷键开始说话。",
      recordingLabel: "正在录音",
      recordingHint: "自然说话，Bisbi 正在监听。",
      transcribing: "转写中",
      previousTranscript: "我很喜欢用 Bisbi。",
      transcript: "团队你好——简短更新一下，发布按计划周五上线。",
      editorTitle: "会议笔记——笔记",
      editorPlaceholder: "输入消息…",
      pasteHint: "文本会自动粘贴到你正在输入的位置。",
    },
  },
  features: {
    badge: "功能特点",
    title: "一切你需要的。没有多余的。",
    items: [
      {
        title: "适用任何应用",
        description:
          "Slack、Gmail、Notion、Word、终端、浏览器 — 光标在哪，Bisbi 就在哪写。",
      },
      {
        title: "按键即说",
        description:
          "一个快捷键。自然说话。无需打开界面，无需切换窗口。",
      },
      {
        title: "99 种语言",
        description:
          "自动检测。说一种，打另一种。",
      },
      {
        title: "Mac、Windows 和 Linux",
        description:
          "三个平台的原生应用。相同体验，相同快捷键，相同效果。",
      },
    ],
  },
  cta: {
    title: "开始说话,",
    titleHighlight: "就在今天。",
    description:
      "免费下载 Bisbi。适用于 Mac、Windows 和 Linux。无需订阅即可开始。",
    signInHint: "已有账户？",
    signIn: "登录",
  },
  footer: {
    tagline1: "语音输入，100% 本地。",
    tagline2: "说。出现。",
    contact: "联系我们",
    legal: "法律",
    rights: "保留所有权利。",
    createdBy: "由",
  },
  demoApp: {
    nav: { home: "首页", history: "历史", settings: "设置" },
    greetings: {
      lateNight: "晚安",
      morning: "早上好",
      afternoon: "下午好",
      evening: "晚上好",
    },
    statusTitle: "准备聆听",
    titleHint: "按下快捷键开始说话。",
    hotkeyLabel: "快捷键",
    hotkeyHint: "文字会自动粘贴到你正在输入的位置。",
    activitySection: "你的活动",
    statTranscriptions: "条转录",
    statDictated: "已听写",
    statWords: "已转录词数",
    statWpm: "每分钟词数",
    recentSection: "最近的转录",
    seeMore: "在历史中查看全部",
    badgeIdle: "就绪",
    plan: { pro: "专业版" },
    user: { name: "李娜", initial: "李" },
    dateGroups: { today: "今天", yesterday: "昨天" },
    recent: [
      "把设计评审笔记发给 Marta，确认我们周四的安排。",
      "提醒：用新的定价方案更新引导文案。",
      "[音乐] 邮件草稿：再次感谢介绍。我希望下周能安排一个简短的电话。",
    ],
  },
  dashboard: {
    greeting: "你好 {name}!",
    ready: "你的账户已准备好。下载 Bisbi 开始听写。",
    downloadMac: "下载 Mac 版",
    downloadWindows: "下载 Windows 版",
    downloadLinux: "下载 Linux 版",
    starting: "开始下载…",
    hint: "你的订阅和设置在应用内管理。",
    signOut: "退出登录",
    signingOut: "退出中…",
    checkoutSuccessTitle: "欢迎加入 Pro！",
    checkoutSuccessSubtitle: "无限听写已开启。尽情说话吧。",
    checkoutCancelTitle: "没问题",
    checkoutCancelSubtitle: "你仍在免费计划。随时可以在 Bisbi 中升级。",
    planFreeBadge: "免费计划 · 想无限畅说？升级到 Pro",
    planProBadge: "Pro 计划已激活 · 想说多少说多少",
  },
  login: {
    welcome: "欢迎来到 Bisbi",
    accessAccount: "登录你的 {appName} 账户",
    subtitle: "登录以下载 Bisbi",
    continueWithGoogle: "使用 Google 继续",
    connecting: "正在连接…",
    loading: "加载中…",
    successTitle: "登录成功",
    successSubtitle: "我们将带你回到 {appName}",
    openApp: "打开 {appName}",
    openingHint: "正在自动打开，或点击上方按钮",
    backToApp: "返回应用",
  },
};
