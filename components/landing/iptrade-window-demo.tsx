"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoAccountsSeed,
  FLASH_DURATION_MS,
  INSTALL_DELAY_MS,
  INSTALLED_DISPLAY_MS,
  platformLabel,
} from "@/lib/trading/demo-data";
import {
  type DemoViewState,
  type SlaveConfig,
  type TradingAccount,
} from "@/lib/trading/types";
import { AddAccountsPickDemo } from "@/components/landing/add-accounts-pick-demo";
import { cn } from "@/lib/utils";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Cog,
  CornerDownRight,
  HelpCircleIcon,
  Home,
  ListOrdered,
  Loader,
  LogOutIcon,
  PartyPopper,
  PencilIcon,
  PieChart,
  Plus,
  ScrollText,
  Settings,
  TrafficCone,
} from "lucide-react";

type ComponentMode = "demo" | "live";
type FlashDirection = "up" | "down" | null;
export type HeaderActiveView =
  | "home"
  | "add"
  | "config"
  | "logs"
  | "terminal"
  | "history-calendar"
  | "history-statistics"
  | "history-orders";

interface DemoAccountMetrics {
  balance: number;
  pnl: number;
  openTrades: number;
  pendingTrades: number;
}

interface GroupOpenTarget {
  openTrades: number;
  pendingTrades: number;
  expiresAt: number;
}

const GROUP_OPEN_UPDATE_MIN_INTERVAL_MS = 3200;

interface IpTradeWindowDemoProps {
  mode?: ComponentMode;
  userEmail?: string;
  accounts?: TradingAccount[];
  initialViewState?: DemoViewState;
  autoMode?: boolean;
  demoPhase?: "start" | "installing" | "connecting" | null;
  initialExpandedGroups?: Record<string, boolean>;
  onUpdateSlaveConfig?: (accountId: string, config: SlaveConfig) => void;
  onDeleteAccount?: (accountId: string) => void;
  onConvertAccount?: (accountId: string, newType: "master" | "slave") => void;
}


const CONNECTED_DEMO_ACCOUNTS: TradingAccount[] = [
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
    config: {
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
    config: {
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
    config: {
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
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
};

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const buildInitialAccountMetrics = (
  account: TradingAccount
): DemoAccountMetrics => {
  const accountHash = stableHash(account.id);
  const groupKey =
    account.type === "slave" && account.config?.masterAccountId
      ? account.config.masterAccountId
      : account.id;
  const groupHash = stableHash(groupKey);
  const baseBalanceByType = account.type === "master" ? 50000 : 12000;
  const balanceVariance = account.type === "master" ? 65000 : 85000;
  const baseBalance =
    baseBalanceByType + (accountHash % balanceVariance) + randomBetween(0, 2500);
  const maxPnlSwing = baseBalance * (account.type === "master" ? 0.04 : 0.06);
  const initialPnl = randomBetween(maxPnlSwing * 0.02, maxPnlSwing * 0.18);

  if (account.connection === "offline" || !account.status) {
    return {
      balance: baseBalance,
      pnl: initialPnl,
      openTrades: 0,
      pendingTrades: 0,
    };
  }

  return {
    balance: baseBalance,
    pnl: initialPnl,
    openTrades: groupHash % 7,
    pendingTrades: groupHash % 3,
  };
};

const sumOpenTotals = (metrics: Record<string, DemoAccountMetrics>) =>
  Object.values(metrics).reduce(
    (acc, item) => {
      acc.open += item.openTrades;
      acc.total += item.openTrades + item.pendingTrades;
      return acc;
    },
    { open: 0, total: 0 }
  );

const getGroupRootId = (account: TradingAccount) =>
  account.type === "slave" && account.config?.masterAccountId
    ? account.config.masterAccountId
    : account.id;

export function IpTradeWindowDemo({
  mode = "demo",
  accounts,
  initialViewState = "empty",
  autoMode = false,
  demoPhase = null,
  initialExpandedGroups,
  onUpdateSlaveConfig,
}: IpTradeWindowDemoProps) {
  const isDemo = mode === "demo";
  const [viewState, setViewStateRaw] = useState<DemoViewState>(
    isDemo ? initialViewState : "accounts"
  );
  const [demoAccounts, setDemoAccounts] = useState<TradingAccount[]>(() =>
    isDemo && initialViewState === "accounts" ? demoAccountsSeed() : []
  );
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    initialExpandedGroups || {}
  );
  const [globalCopierEnabled, setGlobalCopierEnabled] = useState(true);
  const [flashingAccountIds, setFlashingAccountIds] = useState<Set<string>>(
    () => new Set()
  );
  const [accountMetrics, setAccountMetrics] = useState<
    Record<string, DemoAccountMetrics>
  >({});
  const [openTotalsFlash, setOpenTotalsFlash] = useState<FlashDirection>(null);
  const [resourceUsage, setResourceUsage] = useState({ cpu: 24, ram: 42 });
  const accountsScrollContainerRef = useRef<HTMLDivElement>(null);
  const initialExpandedGroupsAppliedRef = useRef(false);
  const installTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const installedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoModeRef = useRef(false);
  const autoModeStepRef = useRef(0);
  const demoPhaseRef = useRef(demoPhase);
  const wasInstallingRef = useRef(false);
  const pendingGroupOpenTargetsRef = useRef<Map<string, GroupOpenTarget>>(
    new Map()
  );
  const lastGroupOpenUpdateAtRef = useRef<Map<string, number>>(new Map());

  const clearAllTimers = useCallback(() => {
    if (installTimerRef.current) {
      clearTimeout(installTimerRef.current);
      installTimerRef.current = null;
    }
    if (installedTimerRef.current) {
      clearTimeout(installedTimerRef.current);
      installedTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    demoPhaseRef.current = demoPhase;
  }, [demoPhase]);

  const setViewState = useCallback(
    (newState: DemoViewState | ((prev: DemoViewState) => DemoViewState)) => {
      if (demoPhaseRef.current === "installing" || wasInstallingRef.current) {
        if (typeof newState === "function") {
          setViewStateRaw((prev) => {
            const result = newState(prev);
            return result === "installing" ? result : prev;
          });
        } else {
          if (newState === "installing") {
            setViewStateRaw(newState);
          }
        }
        return;
      }
      setViewStateRaw(newState);
    },
    []
  );

  useEffect(() => {
    if (isDemo && demoPhase === "installing") {
      wasInstallingRef.current = true;
      clearAllTimers();
      setViewStateRaw("installing");
      setDemoAccounts([]);
      setEditingAccountId(null);
      return;
    }

    if (isDemo && !demoPhase && wasInstallingRef.current) {
      clearAllTimers();
      setViewStateRaw("installing");
      return;
    }

    if (isDemo && demoPhase !== null) {
      wasInstallingRef.current = demoPhase === "installing";
      clearAllTimers();

      if (demoPhase === "start") {
        setViewStateRaw("empty");
        setDemoAccounts([]);
      } else if (demoPhase === "connecting") {
        setDemoAccounts(CONNECTED_DEMO_ACCOUNTS);
        setViewStateRaw("accounts");
      } else {
        setViewStateRaw(initialViewState);
        setDemoAccounts(
          initialViewState === "accounts" ? demoAccountsSeed() : []
        );
      }
      setEditingAccountId(null);
    } else if (isDemo && !demoPhase) {
      if (!wasInstallingRef.current) {
        setViewStateRaw(initialViewState);
        setDemoAccounts(
          initialViewState === "accounts" ? demoAccountsSeed() : []
        );
        setEditingAccountId(null);
      }
    } else if (!isDemo) {
      wasInstallingRef.current = false;
      setViewStateRaw("accounts");
    }

    return () => {
      clearAllTimers();
    };
  }, [isDemo, demoPhase, initialViewState, clearAllTimers]);

  useEffect(() => {
    if (isDemo && (demoPhase === "installing" || wasInstallingRef.current)) {
      const interval = setInterval(() => {
        clearAllTimers();
        setViewStateRaw((currentState) => {
          if (currentState !== "installing") {
            return "installing";
          }
          return currentState;
        });
      }, 50);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isDemo, demoPhase, clearAllTimers]);

  const renderedAccounts = useMemo(
    () => (isDemo ? demoAccounts : (accounts ?? [])),
    [isDemo, demoAccounts, accounts]
  );

  useEffect(() => {
    if (
      editingAccountId &&
      !renderedAccounts.some((account) => account.id === editingAccountId)
    ) {
      setEditingAccountId(null);
    }
  }, [editingAccountId, renderedAccounts]);

  useEffect(() => {
    setExpandedGroups((prev) => {
      const validMasters = new Set(
        renderedAccounts
          .filter((account) => account.type === "master")
          .map((account) => account.id)
      );

      const mastersWithSlaves = new Set<string>();
      renderedAccounts.forEach((account) => {
        if (
          account.type === "slave" &&
          account.config?.masterAccountId &&
          validMasters.has(account.config.masterAccountId)
        ) {
          mastersWithSlaves.add(account.config.masterAccountId);
        }
      });

      let changed = false;
      const next: Record<string, boolean> = {};

      Object.entries(prev).forEach(([key, value]) => {
        if (validMasters.has(key)) {
          next[key] = value;
        } else {
          changed = true;
        }
      });

      validMasters.forEach((masterId) => {
        if (mastersWithSlaves.has(masterId) && !(masterId in next)) {
          if (!initialExpandedGroupsAppliedRef.current && initialExpandedGroups) {
            next[masterId] = initialExpandedGroups[masterId] ?? true;
          } else {
            next[masterId] = true;
          }
          changed = true;
        }
      });

      if (!initialExpandedGroupsAppliedRef.current && renderedAccounts.length > 0) {
        initialExpandedGroupsAppliedRef.current = true;
      }

      return changed ? next : prev;
    });
  }, [renderedAccounts, initialExpandedGroups]);

  const masterAccounts = useMemo(
    () => renderedAccounts.filter((account) => account.type === "master"),
    [renderedAccounts]
  );
  const totalOpenOrders = useMemo(
    () =>
      renderedAccounts.reduce(
        (acc, account) => acc + (accountMetrics[account.id]?.openTrades ?? 0),
        0
      ),
    [renderedAccounts, accountMetrics]
  );
  const totalAllOrders = useMemo(
    () =>
      renderedAccounts.reduce((acc, account) => {
        const metrics = accountMetrics[account.id];
        if (!metrics) return acc;
        return acc + metrics.openTrades + metrics.pendingTrades;
      }, 0),
    [renderedAccounts, accountMetrics]
  );

  useEffect(() => {
    setAccountMetrics((prev) => {
      const next: Record<string, DemoAccountMetrics> = {};
      renderedAccounts.forEach((account) => {
        next[account.id] = prev[account.id] ?? buildInitialAccountMetrics(account);
      });
      return next;
    });
  }, [renderedAccounts]);

  useEffect(() => {
    if (viewState !== "accounts" || renderedAccounts.length === 0) return;

    const interval = setInterval(() => {
      const accountById = new Map(renderedAccounts.map((account) => [account.id, account]));

      setAccountMetrics((prev) => {
        const next = { ...prev };

        Object.entries(next).forEach(([accountId, metrics]) => {
          const account = accountById.get(accountId);
          if (!account) return;

          const drift = randomBetween(-10, 32);
          const noise = randomBetween(-18, 18);
          const nextPnlRaw = metrics.pnl + drift + noise;
          const maxAbsPnl = metrics.balance * (account.type === "master" ? 0.12 : 0.16);
          const boundedPnl = clamp(nextPnlRaw, 0, maxAbsPnl);

          next[accountId] = {
            ...metrics,
            pnl:
              account.connection === "offline" || !account.status
                ? boundedPnl * 0.9
                : boundedPnl,
          };
        });

        return next;
      });
    }, 1450);

    return () => clearInterval(interval);
  }, [viewState, renderedAccounts]);

  useEffect(() => {
    if (openTotalsFlash === null) return;
    const timer = setTimeout(() => setOpenTotalsFlash(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [openTotalsFlash]);

  useEffect(() => {
    if (viewState !== "accounts") return;
    const interval = setInterval(() => {
      setResourceUsage((prev) => {
        const activityRatio =
          renderedAccounts.length > 0
            ? clamp(totalAllOrders / (renderedAccounts.length * 10), 0, 1)
            : 0;

        const cpuTarget =
          12 + activityRatio * 50 + (globalCopierEnabled ? 7 : -3) + randomBetween(-4, 4);
        const ramTarget =
          24 + activityRatio * 48 + renderedAccounts.length * 1.25 + randomBetween(-2, 2);

        return {
          cpu: Math.round(clamp(prev.cpu + (cpuTarget - prev.cpu) * 0.34, 3, 95)),
          ram: Math.round(clamp(prev.ram + (ramTarget - prev.ram) * 0.22, 8, 92)),
        };
      });
    }, 1700);

    return () => clearInterval(interval);
  }, [viewState, renderedAccounts.length, totalAllOrders, globalCopierEnabled]);

  const simulateOpenOrdersUpdate = useCallback(
    (targetAccountIds: string[]) => {
      if (targetAccountIds.length === 0) return;

      const accountById = new Map(renderedAccounts.map((account) => [account.id, account]));

      setAccountMetrics((prev) => {
        const previousTotals = sumOpenTotals(prev);
        const next = { ...prev };
        const now = Date.now();

        targetAccountIds.forEach((accountId) => {
          const account = accountById.get(accountId);
          const current = next[accountId];
          if (!account || !current) return;

          if (account.connection === "offline" || !account.status) {
            next[accountId] = { ...current, openTrades: 0, pendingTrades: 0 };
            return;
          }

          const groupRootId = getGroupRootId(account);
          let target = pendingGroupOpenTargetsRef.current.get(groupRootId);
          const lastGroupUpdateAt =
            lastGroupOpenUpdateAtRef.current.get(groupRootId) ?? 0;
          const canGenerateNewTarget =
            now - lastGroupUpdateAt >= GROUP_OPEN_UPDATE_MIN_INTERVAL_MS;

          if ((!target || target.expiresAt < now) && canGenerateNewTarget) {
            const openDelta = Math.random() > 0.52 ? 1 : -1;
            const pendingDelta =
              Math.random() > 0.67 ? 1 : Math.random() > 0.55 ? -1 : 0;
            target = {
              openTrades: clamp(current.openTrades + openDelta, 0, 12),
              pendingTrades: clamp(current.pendingTrades + pendingDelta, 0, 8),
              expiresAt: now + 1800,
            };
            pendingGroupOpenTargetsRef.current.set(groupRootId, target);
            lastGroupOpenUpdateAtRef.current.set(groupRootId, now);
          }

          if (!target || target.expiresAt < now) {
            return;
          }

          next[accountId] = {
            ...current,
            openTrades: target.openTrades,
            pendingTrades: target.pendingTrades,
          };
        });

        pendingGroupOpenTargetsRef.current.forEach((value, key) => {
          if (value.expiresAt < now) {
            pendingGroupOpenTargetsRef.current.delete(key);
          }
        });

        const nextTotals = sumOpenTotals(next);
        if (nextTotals.open !== previousTotals.open) {
          setOpenTotalsFlash(nextTotals.open > previousTotals.open ? "up" : "down");
        }
        return next;
      });
    },
    [renderedAccounts]
  );

  useEffect(() => {
    if (
      !isDemo ||
      viewState !== "accounts" ||
      renderedAccounts.length === 0 ||
      demoPhase !== null
    )
      return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const MIN_DELAY_MS = 800;
    const MAX_DELAY_MS = 3500;
    const MASTER_TO_SLAVES_DELAY_MS = 250;
    const SLAVE_SEQUENCE_FLASH_MS = 250;

    const masters = renderedAccounts.filter(
      (a) => a.type === "master" && a.connection !== "offline"
    );
    const connectedSlavesByMaster = new Map<string, string[]>();
    renderedAccounts.forEach((a) => {
      if (
        a.type === "slave" &&
        a.config?.masterAccountId &&
        a.connection !== "offline"
      ) {
        const mid = a.config.masterAccountId;
        if (!connectedSlavesByMaster.has(mid)) {
          connectedSlavesByMaster.set(mid, []);
        }
        connectedSlavesByMaster.get(mid)!.push(a.id);
      }
    });

    const onlineMasterIds = new Set(masters.map((m) => m.id));
    const disconnectedNotOffline = renderedAccounts.filter(
      (a) =>
        a.connection !== "offline" &&
        (a.type === "pending" ||
          (a.type === "slave" &&
            (!a.config?.masterAccountId ||
              !onlineMasterIds.has(a.config.masterAccountId))))
    );

    const scheduleGroupFlash = (masterId: string, slaveIds: string[]) => {
      const delay =
        MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      const timer = setTimeout(() => {
        setFlashingAccountIds((prev) => new Set(prev).add(masterId));
        simulateOpenOrdersUpdate([masterId]);
        const startSlavesTimer = setTimeout(() => {
          setFlashingAccountIds((prev) => {
            const next = new Set(prev);
            next.delete(masterId);
            return next;
          });

          const flashSlaveAtIndex = (index: number) => {
            if (index >= slaveIds.length) {
              scheduleGroupFlash(masterId, slaveIds);
              return;
            }
            setFlashingAccountIds((prev) => {
              const next = new Set(prev);
              next.add(slaveIds[index]);
              return next;
            });
            simulateOpenOrdersUpdate([slaveIds[index]]);
            const removeSlaveTimer = setTimeout(() => {
              setFlashingAccountIds((prev) => {
                const next = new Set(prev);
                next.delete(slaveIds[index]);
                return next;
              });
              flashSlaveAtIndex(index + 1);
            }, SLAVE_SEQUENCE_FLASH_MS);
            timers.push(removeSlaveTimer);
          };

          flashSlaveAtIndex(0);
        }, MASTER_TO_SLAVES_DELAY_MS);
        timers.push(startSlavesTimer);
      }, delay);
      timers.push(timer);
    };

    const scheduleSoloFlash = (accountId: string) => {
      const delay =
        MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      const timer = setTimeout(() => {
        setFlashingAccountIds((prev) => new Set(prev).add(accountId));
        simulateOpenOrdersUpdate([accountId]);
        const removeTimer = setTimeout(() => {
          setFlashingAccountIds((prev) => {
            const next = new Set(prev);
            next.delete(accountId);
            return next;
          });
          scheduleSoloFlash(accountId);
        }, FLASH_DURATION_MS);
        timers.push(removeTimer);
      }, delay);
      timers.push(timer);
    };

    masters.forEach((m) => {
      const slaveIds = connectedSlavesByMaster.get(m.id) ?? [];
      if (slaveIds.length > 0) {
        scheduleGroupFlash(m.id, slaveIds);
      } else {
        scheduleSoloFlash(m.id);
      }
    });

    disconnectedNotOffline.forEach((a) => scheduleSoloFlash(a.id));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [
    isDemo,
    viewState,
    renderedAccounts,
    demoPhase,
    simulateOpenOrdersUpdate,
  ]);

  useEffect(() => {
    if (autoMode && isDemo && initialViewState === "empty" && !demoPhase) {
      setDemoAccounts([]);
      setViewState("empty");
      autoModeRef.current = false;
      autoModeStepRef.current = 0;
    }
  }, [autoMode, isDemo, initialViewState, demoPhase]);

  useEffect(() => {
    if (
      !autoMode ||
      !isDemo ||
      demoPhase !== null ||
      autoModeRef.current ||
      viewState !== "empty"
    )
      return;

    const initialDelay = setTimeout(() => {
      handleInstallBots();
      autoModeRef.current = true;
    }, 2000);

    return () => {
      clearTimeout(initialDelay);
    };
  }, [autoMode, isDemo, viewState, demoPhase]);

  const handleInstallBots = () => {
    if (demoPhase !== null) {
      clearAllTimers();
      if (demoPhase === "installing") {
        setViewState("installing");
      }
      return;
    }

    if (!isDemo || viewState === "installing" || viewState === "installed") {
      return;
    }

    setViewState("installing");
    clearAllTimers();

    installTimerRef.current = setTimeout(() => {
      if (demoPhase !== null) {
        return;
      }
      setViewState("installed");

      installedTimerRef.current = setTimeout(() => {
        if (demoPhase !== null) {
          return;
        }
        setDemoAccounts(demoAccountsSeed(autoMode));
        setViewState("accounts");
      }, INSTALLED_DISPLAY_MS);
    }, INSTALL_DELAY_MS);
  };

  const handleSaveConfig = (accountId: string, config: SlaveConfig) => {
    if (isDemo) {
      setDemoAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId
            ? {
                ...account,
                config: {
                  ...config,
                  fixedLot:
                    config.mode === "fixedLot"
                      ? (config.fixedLot ?? 0.01)
                      : undefined,
                  multiplier:
                    config.mode === "multiplier"
                      ? (config.multiplier ?? 1)
                      : undefined,
                },
              }
            : account
        )
      );
    } else {
      onUpdateSlaveConfig?.(accountId, config);
    }
    setEditingAccountId(null);
  };

  const handleToggleGroup = (accountId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  useEffect(() => {
    if (!autoMode || !isDemo || demoPhase !== null || viewState !== "accounts")
      return;

    const disconnectedSlaves = renderedAccounts.filter(
      (account) =>
        account.type === "slave" &&
        (!account.config?.masterAccountId ||
          account.config.masterAccountId === null)
    );

    const pendingAccounts = renderedAccounts.filter(
      (account) => account.type === "pending"
    );

    const accountsToConfigure = [
      ...disconnectedSlaves,
      ...pendingAccounts.slice(0, Math.max(0, pendingAccounts.length - 1)),
    ];

    if (accountsToConfigure.length === 0 || editingAccountId !== null) return;

    const currentStep = autoModeStepRef.current;
    const accountToConfigure = accountsToConfigure[currentStep];

    if (!accountToConfigure) return;

    const masterId = masterAccounts[0]?.id;
    if (!masterId) return;

    const delay = currentStep === 0 ? 2000 : 2500;

    const configureDelay = setTimeout(() => {
      setEditingAccountId(accountToConfigure.id);

      setTimeout(() => {
        if (accountToConfigure.type === "pending") {
          setDemoAccounts((prev) =>
            prev.map((account) =>
              account.id === accountToConfigure.id
                ? {
                    ...account,
                    type: "slave",
                    config: {
                      masterAccountId: null,
                      mode: "multiplier",
                      multiplier: 1,
                      prefix: "",
                      suffix: "",
                      symbolTranslate: false,
                      reverseTrading: false,
                    },
                  }
                : account
            )
          );

          setTimeout(() => {
            const config: SlaveConfig = {
              masterAccountId: masterId,
              mode: currentStep === 0 ? "multiplier" : "multiplier",
              multiplier: currentStep === 0 ? 1.0 : 0.5,
              fixedLot: undefined,
              prefix: "",
              suffix: "",
              symbolTranslate: undefined,
              reverseTrading: false,
            };
            handleSaveConfig(accountToConfigure.id, config);
            autoModeStepRef.current += 1;
          }, 600);
        } else {
          const config: SlaveConfig = {
            masterAccountId: masterId,
            mode: currentStep === 0 ? "multiplier" : "multiplier",
            multiplier: currentStep === 0 ? 1.0 : 0.5,
            fixedLot: undefined,
            prefix: "",
            suffix: "",
            symbolTranslate: undefined,
            reverseTrading: false,
          };
          handleSaveConfig(accountToConfigure.id, config);
          autoModeStepRef.current += 1;
        }
      }, 800);
    }, delay);

    return () => {
      clearTimeout(configureDelay);
    };
  }, [
    autoMode,
    isDemo,
    viewState,
    renderedAccounts,
    masterAccounts,
    editingAccountId,
    handleSaveConfig,
  ]);

  const isInstalling = viewState === "installing";
  const isInstalled = viewState === "installed";

  const renderContent = () => {
    if (viewState === "add-accounts") {
      return (
        <div className="w-full px-3 py-4">
          <AddAccountsPickDemo isWindows />
        </div>
      );
    }

    if (renderedAccounts.length > 0) {
      return (
        <div className="flex flex-col h-full min-h-0 w-full">
          <div
            ref={accountsScrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          >
            <MotorBanner
              enabled={globalCopierEnabled}
              onToggle={async (checked) => {
                setGlobalCopierEnabled(checked);
                return true;
              }}
              loading={false}
            />
            <AccountsTable
              accounts={renderedAccounts}
              accountMetrics={accountMetrics}
              masterAccounts={masterAccounts}
              flashingAccountIds={flashingAccountIds}
              expandedGroups={expandedGroups}
              onToggleGroup={handleToggleGroup}
            />
          </div>
        </div>
      );
    }

    if (viewState === "empty") {
      return (
        <EmptyState
          onInstallClick={handleInstallBots}
          disabled={!isDemo}
          isInstalling={isInstalling}
          isInstalled={isInstalled}
        />
      );
    }

    if (viewState === "installing" || viewState === "installed") {
      return <InstallingState isInstalled={isInstalled} />;
    }

    return null;
  };

  const isStepActive = demoPhase !== null;

  return (
    <div
      className={cn("w-full relative overflow-x-hidden", isStepActive && "pointer-events-none")}
    >
      <DemoWindowChrome
        totalOpenOrders={totalOpenOrders}
        totalOrders={totalAllOrders}
        openFlash={openTotalsFlash}
        cpuUsagePercent={resourceUsage.cpu}
        ramUsagePercent={resourceUsage.ram}
        activeView={viewState === "add-accounts" ? "add" : "home"}
        hideStatusOnMobile
      />
      <div className="flex justify-center items-center flex-col h-full w-full overflow-x-hidden">
        {renderContent()}
      </div>
      {isStepActive && (
        <div
          className="absolute inset-0 z-50"
          style={{ pointerEvents: "all" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}



const navButtonClass = (isActive: boolean) =>
  cn(
    "cursor-pointer rounded p-1",
    isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-900"
  );

export function DemoWindowChrome({
  totalOpenOrders,
  totalOrders,
  openFlash,
  cpuUsagePercent,
  ramUsagePercent,
  activeView = "home",
  hideStatusOnMobile = false,
}: {
  totalOpenOrders: number;
  totalOrders: number;
  openFlash: FlashDirection;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  activeView?: HeaderActiveView;
  hideStatusOnMobile?: boolean;
}) {
  const openStatusClass = cn(
    "text-sm transition-colors",
    openFlash === "up" && "text-emerald-600",
    openFlash !== "up" && "text-gray-400"
  );

  const statusVisibilityClass = hideStatusOnMobile
    ? "hidden sm:flex"
    : "flex";

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-900">IPTRADE</span>
        </div>
        <div className={cn("items-center gap-4", statusVisibilityClass)}>
          <span className="text-sm text-gray-400">
            CPU {cpuUsagePercent}% RAM {ramUsagePercent}%
          </span>
          <span className={openStatusClass}>
            OPEN {totalOpenOrders}/{totalOrders}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={navButtonClass(activeView === "add")}
            aria-label="Add accounts"
            tabIndex={-1}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "home")}
            aria-label="Inicio"
            tabIndex={-1}
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "terminal")}
            aria-label="Terminal"
            tabIndex={-1}
          >
            <Activity className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "history-calendar")}
            aria-label="Calendar"
            tabIndex={-1}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "history-statistics")}
            aria-label="Statistics"
            tabIndex={-1}
          >
            <PieChart className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "history-orders")}
            aria-label="Orders history"
            tabIndex={-1}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "config")}
            aria-label="Settings"
            tabIndex={-1}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButtonClass(activeView === "logs")}
            aria-label="Live logs"
            tabIndex={-1}
          >
            <ScrollText className="h-4 w-4" />
          </button>
          <span className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer" aria-hidden>
            <HelpCircleIcon className="h-4 w-4" />
          </span>
          <span className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer" aria-hidden>
            <LogOutIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onInstallClick: () => void;
  disabled?: boolean;
  isInstalling: boolean;
  isInstalled: boolean;
}

function EmptyState({
  onInstallClick,
  disabled,
  isInstalling,
  isInstalled,
}: EmptyStateProps) {
  return (
    <div className="flex h-[500px] flex-col items-center justify-center text-center text-gray-600">
      <TrafficCone className="h-6 w-6 text-gray-600 m-2" />
      <p className="text-xl text-gray-600 font-semibold">No accounts</p>
      <p className="mt-2 text-xs text-gray-400">
        Link your trading accounts to start copying:
        <br />
        1. Execute "Connect accounts" process
        <br />
        2. Wait for the accounts to appear
        <br />
        3. Connect and start copying
      </p>
      <div
        type="button"
        className={cn(
          "mt-4 rounded-full text-white text-xl px-3 py-1",
          isInstalling || isInstalled || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-600 cursor-pointer"
        )}
        onClick={onInstallClick}
        disabled={disabled || isInstalling || isInstalled}
      >
        {isInstalled ? "Connected" : isInstalling ? "Connecting..." : "Connect"}
      </div>
      <a
        href="https://www.iptradecopier.com/dashboard/documentation"
        target="_blank"
        className="text-xs text-gray-400 mt-3 italic hover:text-gray-900 transition-colors"
      >
        Need help? View guide
      </a>
    </div>
  );
}

interface InstallingStateProps {
  isInstalled: boolean;
}

function InstallingState({ isInstalled }: InstallingStateProps) {
  return (
    <div className="flex h-[400px] md:h-[500px] items-center justify-center flex-col text-center mb-10">
      {isInstalled ? (
        <PartyPopper className="h-6 w-6 text-gray-600 m-2" />
      ) : (
        <Loader className="h-6 w-6 text-gray-600 m-2 animate-spin" />
      )}
      <p className="text-center text-lg text-gray-600 font-semibold">
        {isInstalled
          ? "IPTRADE accounts connected successfully"
          : "Connecting accounts"}
      </p>
      <p className="mt-2 text-xs text-gray-400">
        After the connection is complete, do the following:
        <br />
        1. Wait for the accounts to appear
        <br />
        2. Connect and start copying
      </p>
      <a
        href="https://www.iptradecopier.com/dashboard/documentation"
        target="_blank"
        className="text-xs text-gray-400 mt-2 italic hover:text-gray-900 transition-colors"
      >
        Need help? View guide
      </a>
    </div>
  );
}

function MotorBanner({
  enabled,
  onToggle,
  loading,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<boolean>;
  loading: boolean;
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading_ = loading || internalLoading;
  const isOn = enabled;

  const handleChange = useCallback(
    async (checked: boolean) => {
      setInternalLoading(true);
      try {
        await onToggle(checked);
      } finally {
        setInternalLoading(false);
      }
    },
    [onToggle]
  );

  const bgClasses = isOn
    ? "bg-green-100 border-t border-green-200 text-gray-600"
    : "bg-red-100 border-t border-red-200 text-gray-600";

  return (
    <div
      className={cn(
        "px-3 py-2.5 text-sm flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5",
        bgClasses
      )}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-gray-600">
        <Cog
          className={cn("h-4 w-4 shrink-0", isOn && "animate-spin")}
          aria-hidden
        />
        <span className="font-medium">
          Trading engine is {isOn ? "running healthy" : "stopped"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {loading_ && (
          <Loader className="h-4 w-4 shrink-0 animate-spin text-gray-500" />
        )}
        <Switch
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={loading_}
        />
      </div>
    </div>
  );
}

interface AccountsTableProps {
  accounts: TradingAccount[];
  accountMetrics: Record<string, DemoAccountMetrics>;
  masterAccounts: TradingAccount[];
  flashingAccountIds?: Set<string>;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (accountId: string) => void;
}

const showNicknamePref = true;

function AccountsTable({
  accounts,
  accountMetrics,
  masterAccounts,
  flashingAccountIds = new Set(),
  expandedGroups,
  onToggleGroup,
}: AccountsTableProps) {
  const groupedSlaves = useMemo(() => {
    const masters = new Set(
      accounts.filter((account) => account.type === "master").map((a) => a.id)
    );
    const groups: Record<string, TradingAccount[]> = {};
    accounts.forEach((account) => {
      if (
        account.type === "slave" &&
        account.config?.masterAccountId &&
        masters.has(account.config.masterAccountId)
      ) {
        const masterId = account.config.masterAccountId;
        if (!groups[masterId]) {
          groups[masterId] = [];
        }
        groups[masterId].push(account);
      }
    });
    return groups;
  }, [accounts]);

  const groupedSlaveIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(groupedSlaves).forEach((list) =>
      list.forEach((slave) => ids.add(slave.id))
    );
    return ids;
  }, [groupedSlaves]);

  const topLevelAccounts = useMemo(
    () => accounts.filter((account) => !groupedSlaveIds.has(account.id)),
    [accounts, groupedSlaveIds]
  );

  const masterSlaveCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(groupedSlaves).forEach(([masterId, slaves]) => {
      counts[masterId] = slaves.length;
    });
    return counts;
  }, [groupedSlaves]);

  const renderConfigSummary = (account: TradingAccount) => {
    if (account.type === "master") {
      const count = masterSlaveCounts[account.id] ?? 0;
      if (count === 0) return "No slaves";
      return `${count} ${count === 1 ? "slave" : "slaves"} connected`;
    }

    if (account.type === "pending") {
      return "Edit to connect";
    }

    if (account.type !== "slave") return "—";

    const config = account.config;
    const masterLabel = config?.masterAccountId
      ? (masterAccounts.find((master) => master.id === config.masterAccountId)
          ?.accountId ?? config.masterAccountId)
      : "Disconnected";

    if (!config) {
      return masterLabel === "Disconnected"
        ? "Disconnected"
        : `Listening ${masterLabel}`;
    }

    if (masterLabel === "Disconnected") {
      return "Disconnected";
    }
    return `Listening ${masterLabel}`;
  };

  const rowToneClasses = (account: TradingAccount) => {
    if (account.connection === "offline") return "bg-red-50 hover:bg-red-50";
    if (account.type === "pending") return "bg-orange-100 hover:bg-orange-100";
    if (account.type === "master") {
      const c = masterSlaveCounts[account.id] ?? 0;
      return c > 0 ? "bg-blue-100 hover:bg-blue-100" : "bg-gray-100 hover:bg-gray-100";
    }
    if (account.type === "slave") {
      const hasMaster = !!(account.config?.masterAccountId != null);
      return hasMaster ? "bg-white hover:bg-white" : "bg-yellow-50 hover:bg-yellow-50";
    }
    return "hover:bg-white";
  };

  const renderAccountCells = (account: TradingAccount) => (
    <>
      <TableCell className="font-medium whitespace-nowrap">
        {account.accountId}
      </TableCell>
      {showNicknamePref && (
        <TableCell className="whitespace-nowrap">
          {account.nickname ?? "—"}
        </TableCell>
      )}
      <TableCell className="whitespace-nowrap">
        {platformLabel[account.platform]}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div
          className={cn(
            "capitalize",
            account.connection === "offline"
              ? "text-red-600"
              : "text-green-600"
          )}
        >
          {account.connection === "offline" ? "Offline" : "Online"}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="capitalize">
          {account.type === "pending"
            ? "Pending"
            : account.type === "master"
              ? "Master"
              : account.type === "slave"
                ? "Slave"
                : "Unknown"}
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        {(() => {
          const metrics = accountMetrics[account.id];
          if (!metrics) return "—";
          return formatCurrency(metrics.balance);
        })()}
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        {(() => {
          const metrics = accountMetrics[account.id];
          if (!metrics) return "—";
          const pnl = Math.abs(metrics.pnl) < 1e-10 ? 0 : metrics.pnl;
          return (
            <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(pnl)}
            </span>
          );
        })()}
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        {(() => {
          const metrics = accountMetrics[account.id];
          if (!metrics) return "—";
          const open = metrics.openTrades;
          const total = metrics.openTrades + metrics.pendingTrades;
          return `${open}/${total}`;
        })()}
      </TableCell>
      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
        {renderConfigSummary(account)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label="Edit"
            className="cursor-pointer p-1 rounded text-gray-800 hover:text-gray-400"
            tabIndex={-1}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </>
  );

  return (
    <div className="w-full relative border-t overflow-x-hidden">
      <Table
        wrapperClassName="overflow-x-hidden overflow-y-visible"
        className="text-sm border-separate border-spacing-0 w-full overflow-x-hidden"
      >
        <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-gray-50 [&_th]:border-b [&_th]:border-gray-200">
          <TableRow className="align-middle bg-gray-50 hover:bg-gray-50">
            <TableHead className="whitespace-nowrap" />
            <TableHead className="whitespace-nowrap">Account</TableHead>
            {showNicknamePref && (
              <TableHead className="whitespace-nowrap">Nickname</TableHead>
            )}
            <TableHead className="whitespace-nowrap">Platform</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
            <TableHead className="text-right whitespace-nowrap">PnL</TableHead>
            <TableHead
              className="text-right whitespace-nowrap"
              title="Open positions / total (open + pending)"
            >
              Open
            </TableHead>
            <TableHead className="whitespace-nowrap"></TableHead>
            <TableHead className="whitespace-nowrap" />
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-x-hidden">
          {topLevelAccounts.map((account) => {
            const childSlaves =
              account.type === "master"
                ? (groupedSlaves[account.id] ?? [])
                : [];
            const canExpand =
              account.type === "master" && childSlaves.length > 0;
            const isExpanded = expandedGroups[account.id] !== false;
            return (
              <Fragment key={account.id}>
                <TableRow
                  className={cn(
                    "align-middle",
                    rowToneClasses(account),
                    "[&_td]:border-b [&_td]:border-gray-200",
                    flashingAccountIds.has(account.id) && "bg-emerald-50/50"
                  )}
                  style={{
                    transition: "background-color 300ms ease-in-out",
                  }}
                >
                  <TableCell className="w-8 whitespace-nowrap">
                    <button
                      type="button"
                      aria-label={
                        canExpand ? "Toggle connected accounts" : undefined
                      }
                      onClick={() => canExpand && onToggleGroup(account.id)}
                      disabled={!canExpand}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded border border-transparent text-gray-800 cursor-pointer",
                        canExpand && "hover:text-gray-400"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "rotate-90" : "",
                          !canExpand && "invisible"
                        )}
                      />
                    </button>
                  </TableCell>
                  {renderAccountCells(account)}
                </TableRow>
                {account.type === "master" &&
                  isExpanded &&
                  childSlaves.map((slave) => {
                    return (
                      <Fragment key={slave.id}>
                        <TableRow
                          className={cn(
                            "align-middle",
                            rowToneClasses(slave),
                            "[&_td]:border-b [&_td]:border-gray-200",
                            flashingAccountIds.has(slave.id) && "bg-emerald-50/50"
                          )}
                          style={{
                            transition: "background-color 300ms ease-in-out",
                          }}
                        >
                          <TableCell className="w-8 whitespace-nowrap">
                            <span className="flex h-6 w-6 items-center justify-center rounded border border-transparent text-gray-800">
                              <CornerDownRight className="h-4 w-4 text-gray-800" />
                            </span>
                          </TableCell>
                          {renderAccountCells(slave)}
                        </TableRow>
                      </Fragment>
                    );
                  })}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

