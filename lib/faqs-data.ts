export interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

export const faqsData: FAQItem[] = [
  {
    id: "what-is-multi",
    question: "What is IPTRADE Multi?",
    answer: `IPTRADE Multi is a local trade copier that runs on your computer. You set one account as Master and the rest as Slaves; trades are copied in real time with zero latency. Everything runs locally—no cloud, no external servers—so your data stays private and you keep a single IP for prop firm rules.`,
  },
  {
    id: "windows-mac",
    question: "Does it work on Windows and Mac?",
    answer: `Yes. On Windows we support MetaTrader 4, MetaTrader 5 (direct or Expert Advisor), and cTrader. On Mac we support cTrader and MetaTrader 5 via direct connection (no terminal). MetaTrader 4 and the MetaTrader bot method require Windows. The app is native for each OS.`,
  },
  {
    id: "prop-firm-safe",
    question: "Is it safe to use with prop firms?",
    answer: `IPTRADE Multi runs entirely on your machine, all copied accounts use the same IP, and no trade data is sent to external servers—so we're designed to help you meet typical IP restrictions. Other prop firm rules vary by firm; you must verify each firm's terms and do your own research. See our Terms of Use.`,
  },
  {
    id: "different-brokers",
    question: "Can I copy between different brokers or platforms?",
    answer: `Yes. You can copy between MT4, MT5, and cTrader. We handle symbol mapping, prefix/suffix, and lot size so you can match different broker naming and contract sizes.`,
  },
  {
    id: "latency-slippage",
    question: "What about latency and slippage?",
    answer: `Copying is local and in real time, so latency is zero. Slippage depends on your broker and market conditions; the copier sends the order as soon as the master trade is detected.`,
  },

  {
    id: "how-many-accounts",
    question: "How many accounts can I connect?",
    answer: `Free plan: up to 3 accounts with 0.01 fixed lot. Pro plan: up to 10 accounts with full configuration ($19/month, or $182/year). Unlimited plan: unlimited accounts with full configuration ($50/month, or $480/year). Both paid plans save 20% with annual billing.`,
  },
  {
    id: "system-requirements",
    question: "What are the system requirements?",
    answer: `Windows: Windows 10/11, 8GB RAM, 2GB free disk. Mac: macOS Apple Silicon ARM64, 8GB RAM, 2GB free disk (cTrader and MT5 direct). The app is lightweight and runs locally.`,
  },
  {
    id: "vps-needed",
    question: "Do I need a VPS?",
    answer: `No. You can run IPTRADE Multi on your own PC or Mac. If you want 24/7 copying without keeping your computer on, you can install it on a Windows VPS (Mac VPS is also possible with cTrader).`,
  },
  {
    id: "data-privacy",
    question: "Is my trading data sent somewhere?",
    answer: `No. All copying happens on your computer. We don’t store or transmit your trades, logins, or account data to any server.`,
  },
  {
    id: "mt5-no-install",
    question: "Do I need MetaTrader installed to copy MT5 accounts?",
    answer: `No. IPTRADE includes a direct connection for MetaTrader 5 that doesn't require the terminal installed or open. Just enter your account login, server name (provided by your broker or prop firm), and password—the app connects directly on Windows and Mac. If you prefer the Expert Advisor method with the terminal open, that option is available on Windows.`,
  },
  {
    id: "mt5-server-name",
    question: "Where do I find my MT5 server name?",
    answer: `Your broker or prop firm includes the server name when they create your account, usually in the welcome email or account confirmation. It's required for the MT5 direct connection and typically looks like "BrokerName-Server" or "BrokerName-Live".`,
  },
  {
    id: "mac-only-ctrader",
    question: "What platforms are supported on Mac?",
    answer: `On Mac, IPTRADE supports cTrader and MetaTrader 5 via direct connection (no MetaTrader terminal). MetaTrader 4 and MetaTrader 5 via Expert Advisor (bot) use the Windows terminal integration, so those require Windows.`,
  },
];
