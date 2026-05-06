"use client";

import { useMailtoCopy } from "@/hooks/use-mailto-copy";

const SUPPORT_EMAIL = "support@iptradecopier.com";

export function MailtoLink({
  email = SUPPORT_EMAIL,
  className,
  label = "Mail",
  copiedLabel = "Copied",
}: {
  email?: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}) {
  const { copied, handleClick } = useMailtoCopy(email);

  return (
    <a
      href={`mailto:${email}`}
      onClick={handleClick}
      aria-label={
        copied
          ? copiedLabel
          : `Open mail client for ${email}. Copies to clipboard on click.`
      }
      className={className}
    >
      {copied ? copiedLabel : label}
    </a>
  );
}
