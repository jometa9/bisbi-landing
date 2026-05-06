"use client";

import { useState, useCallback } from "react";

export function useMailtoCopy(email: string) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [email]);

  return { copied, handleClick };
}
