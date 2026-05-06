import Link from "next/link";
import { MailtoLink } from "@/components/mailto-link";

export function Footer() {
  return (
    <footer className="w-full p-3 max-w-7xl mx-auto py-16" role="contentinfo">
      <p className="text-sm text-gray-400 pt-2">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-black">IPTRADE</span>
        </Link>
      </p>
      <p className="text-sm text-gray-400 pt-1">
        Professional trading solutions
      </p>

      <div className="flex space-x-2 text-sm pt-2">
        <Link
          href="https://www.instagram.com/iptradecopier"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-gray-600"
        >
          Instagram
        </Link>
        <Link
          href="https://www.linkedin.com/company/iptrade"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-gray-600"
        >
          LinkedIn
        </Link>
        <MailtoLink label="Mail" className="text-gray-600" />
        <Link href="/legal" aria-label="Legal" className="text-gray-600">
          Legal
        </Link>
        <Link
          href="https://www.trustpilot.com/review/iptradecopier.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Trustpilot"
          className="text-gray-600"
        >
          Trustpilot
        </Link>
        <Link
          href="https://www.linkedin.com/in/joaquinmetayer"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Creator"
          className="text-gray-600"
        >
          Creator
        </Link>
      </div>
      <p className="text-sm text-gray-400 pt-2">
        &copy; {new Date().getFullYear()} IPTRADE COPIER LLC. All rights
        reserved.
      </p>
      <p className="text-sm text-gray-400 pt-2">
        Business Address: 131 Continental Dr, Suite 305, Newark, DE 19713,
        United States.
      </p>
      <p className="text-sm text-gray-400 pt-2">
        Support Email: <MailtoLink label="support@iptradecopier.com" copiedLabel="Copied to clipboard" />
      </p>
    </footer>
  );
}
