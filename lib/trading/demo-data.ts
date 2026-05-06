import type { TradingAccount } from "./types";
import { ninjatraderEnabled } from "@/lib/payments/feature-flag";

export const INSTALL_DELAY_MS = 5000;
export const INSTALLED_DISPLAY_MS = 3000;
export const FLASH_DURATION_MS = 600;

export const platformLabel: Record<TradingAccount["platform"], string> = {
  mt4: "MetaTrader 4",
  mt5: "MetaTrader 5",
  ctr: "cTrader",
  nt: "NT8",
};

export const demoAccountsSeed = (disconnected = false): TradingAccount[] => {
  const all: TradingAccount[] = [
  {
    id: "master-1",
    accountId: "2847193",
    nickname: "FTMO 50K",
    platform: "mt4",
    type: "master",
    connection: "online",
    status: true,
  },
  {
    id: "slave-1",
    accountId: "4912837",
    nickname: "FTMO Funded",
    platform: "mt5",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-1",
          mode: "multiplier",
          multiplier: 1.0,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-2",
    accountId: "7382914",
    nickname: "FundedNext 100K",
    platform: "ctr",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-1",
          mode: "multiplier",
          multiplier: 2.0,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-3",
    accountId: "2847561",
    nickname: "Tradeify 50K",
    platform: "nt",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-1",
          mode: "multiplier",
          multiplier: 0.5,
          prefix: "",
          suffix: "",
          symbolTranslate: [
            { from: "US100", to: "NQ" },
            { from: "US30", to: "YM" },
          ],
          reverseTrading: false,
        },
  },
  {
    id: "master-2",
    accountId: "8924561",
    nickname: "ICMarkets Raw",
    platform: "ctr",
    type: "master",
    connection: "online",
    status: true,
  },
  {
    id: "slave-4",
    accountId: "5628471",
    nickname: "The5ers 100K",
    platform: "mt4",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "fixedLot",
          fixedLot: 0.01,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-2",
          mode: "fixedLot",
          fixedLot: 0.1,
          prefix: "",
          suffix: { enabled: true, value: ".pro", action: "add" as const },
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-5",
    accountId: "8291746",
    nickname: "FundingPips 5K",
    platform: "mt5",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-2",
          mode: "multiplier",
          multiplier: 0.5,
          prefix: "",
          suffix: "",
          symbolTranslate: [{ from: "XAUUSD", to: "GOLD" }],
          reverseTrading: true,
        },
  },
  {
    id: "slave-6",
    accountId: "6473829",
    nickname: "Blue Guardian 100K",
    platform: "nt",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-2",
          mode: "multiplier",
          multiplier: 1.25,
          prefix: "",
          suffix: "",
          symbolTranslate: [
            { from: "US100", to: "NQ" },
            { from: "US30", to: "YM" },
          ],
          reverseTrading: false,
        },
  },
  {
    id: "master-3",
    accountId: "1847362",
    nickname: "Topstep 150K",
    platform: "nt",
    type: "master",
    connection: "online",
    status: false,
  },
  {
    id: "slave-7",
    accountId: "9182734",
    nickname: "Darwinex MT4",
    platform: "mt4",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-3",
          mode: "multiplier",
          multiplier: 1.0,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-8",
    accountId: "4729183",
    nickname: "Pepperstone Razor",
    platform: "mt5",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-3",
          mode: "multiplier",
          multiplier: 1.5,
          prefix: { enabled: true, value: "m.", action: "add" as const },
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-9",
    accountId: "5638291",
    nickname: "Pepperstone",
    platform: "ctr",
    type: "slave",
    connection: "online",
    status: true,
    config: disconnected
      ? {
          masterAccountId: null,
          mode: "multiplier",
          multiplier: 1,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        }
      : {
          masterAccountId: "master-3",
          mode: "fixedLot",
          fixedLot: 0.05,
          prefix: "",
          suffix: "",
          symbolTranslate: false,
          reverseTrading: false,
        },
  },
  {
    id: "slave-disconnected-1",
    accountId: "9374628",
    nickname: "Apex Funded 50K",
    platform: "nt",
    type: "slave",
    connection: "online",
    status: true,
    config: {
      masterAccountId: null,
      mode: "multiplier",
      multiplier: 1,
      prefix: "",
      suffix: "",
      symbolTranslate: false,
      reverseTrading: false,
    },
  },
  {
    id: "slave-disconnected-2",
    accountId: "2849102",
    nickname: "E8 Markets 50K",
    platform: "mt5",
    type: "slave",
    connection: "online",
    status: true,
    config: {
      masterAccountId: null,
      mode: "multiplier",
      multiplier: 1,
      prefix: "",
      suffix: "",
      symbolTranslate: false,
      reverseTrading: false,
    },
  },
  {
    id: "slave-disconnected-3",
    accountId: "7391824",
    nickname: "SF",
    platform: "ctr",
    type: "slave",
    connection: "online",
    status: true,
    config: {
      masterAccountId: null,
      mode: "multiplier",
      multiplier: 1,
      prefix: "",
      suffix: "",
      symbolTranslate: false,
      reverseTrading: false,
    },
  },
  {
    id: "slave-offline",
    accountId: "3948271",
    nickname: "Alpha Capital 50K",
    platform: "mt4",
    type: "slave",
    connection: "offline",
    status: false,
    config: {
      masterAccountId: null,
      mode: "multiplier",
      multiplier: 1,
      prefix: "",
      suffix: "",
      symbolTranslate: false,
      reverseTrading: false,
    },
  },
  {
    id: "pending-1",
    accountId: "9283746",
    nickname: "MFF 100K",
    platform: "nt",
    type: "pending",
    connection: "pending",
    status: false,
  },
  {
    id: "pending-2",
    accountId: "7362849",
    nickname: "TrueForex 10K",
    platform: "mt5",
    type: "pending",
    connection: "pending",
    status: false,
  },
];

  return ninjatraderEnabled
    ? all
    : all.filter((account) => account.platform !== "nt");
};

export function obfuscateIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length !== 4) return ip;

  const lastOctet = parseInt(parts[3], 10);
  if (isNaN(lastOctet)) return ip;

  const obfuscatedOctet = lastOctet + 777;
  parts[3] = obfuscatedOctet.toString();

  return parts.join(".");
}
