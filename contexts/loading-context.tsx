"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestsRef = useRef(0);

  useEffect(() => {
    setIsLoading(true);

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      if (activeRequestsRef.current === 0) {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequestsRef.current++;
      setIsLoading(true);

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequestsRef.current--;
        if (activeRequestsRef.current === 0) {
          setTimeout(() => {
            if (activeRequestsRef.current === 0) {
              setIsLoading(false);
            }
          }, 100);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    window.addEventListener("beforeunload", handleStart);

    const handleVisibilityChange = () => {
      if (!document.hidden && activeRequestsRef.current === 0) {
        setTimeout(() => setIsLoading(false), 200);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
