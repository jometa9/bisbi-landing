"use client";

import { User } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

interface ProductSubscription {
  active: boolean;
  tier: string;
  originalTier?: string;
  status: string;
  expiresAt: string | null;
  limits?: {
    accountLimit: number | null;
    fixedLotSize: number | null;
  };
  billingPeriod?: "monthly" | "annual" | null;
  accountLimit?: number | null;
}

interface Downloads {
  multi: {
    windows: {
      version: string;
      downloadUrl: string | null;
    };
    mac: {
      version: string;
      downloadUrl: string | null;
    };
  };
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  entitlements: {
    multi: ProductSubscription | null;
  };
  downloads: Downloads;
}

interface UserDataContextType {
  data: UserData | null;
  user: User;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
  user: User;
  initialData?: UserData | null;
}

export function UserDataProvider({ children, user, initialData }: UserDataProviderProps) {
  const router = useRouter();
  const hasSyncedRef = useRef(false);
  const [data, setData] = useState<UserData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData?.userId || hasSyncedRef.current) return;

    hasSyncedRef.current = true;
    fetch("/api/sync-subscription", { method: "POST" })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        if (json?.synced) {
          router.refresh();
        }
      })
      .catch(() => {});
  }, [initialData?.userId, router]);

  const refetch = useCallback(async () => {
    if (!initialData) return;
    setIsRefetching(true);
    router.refresh();
    setIsRefetching(false);
  }, [initialData, router]);

  return (
    <UserDataContext.Provider
      value={{
        data,
        user,
        isLoading,
        error,
        refetch,
        isRefetching,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}

export function useUserDataOptional() {
  const context = useContext(UserDataContext);
  return context;
}

