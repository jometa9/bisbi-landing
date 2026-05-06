export type TradingPlatform = "mt4" | "mt5" | "ctr" | "nt";

export type AccountType = "master" | "slave" | "pending";

export type ConnectionStatus = "online" | "offline" | "pending";

export type SlaveConfigMode = "fixedLot" | "multiplier";

export interface SymbolTranslation {
  from: string;
  to: string;
}

export interface PrefixSuffixConfig {
  enabled: boolean;
  value: string;
  action: "add" | "remove";
}

export interface SlaveConfig {
  masterAccountId: string | null;
  mode: SlaveConfigMode;
  fixedLot?: number;
  multiplier?: number;
  prefix?: PrefixSuffixConfig | string;
  suffix?: PrefixSuffixConfig | string;
  symbolTranslate?: SymbolTranslation[] | boolean;
  reverseTrading?: boolean;
}

export interface TradingAccount {
  id: string;
  accountId: string;
  nickname?: string;
  platform: TradingPlatform;
  type: AccountType;
  connection: ConnectionStatus;
  status: boolean;
  config?: SlaveConfig;
}

export type DemoViewState =
  | "empty"
  | "installing"
  | "installed"
  | "connecting"
  | "accounts"
  | "add-accounts";
