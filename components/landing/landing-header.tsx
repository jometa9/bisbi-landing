"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type MouseEvent } from "react";

const navigationLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#prices", label: "Pricing" },
  { href: "/documentation", label: "Docs" },
  { href: "/assistant", label: "Chat" },
];

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNavClick = useCallback(
    async (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.includes("#")) {
        return;
      }

      event.preventDefault();
      const targetId = href.split("#")[1];

      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState({}, "", `${pathname}#${targetId}`);
        return;
      }

      if (pathname !== "/") {
        await router.push("/");
        setTimeout(() => {
          const checkAndScroll = (checkAttempts = 0) => {
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.history.replaceState({}, "", `/#${targetId}`);
              setTimeout(() => {
                const attemptScroll = (attempts = 0) => {
                  if (window.location.pathname !== "/") return;
                  const element = document.getElementById(targetId);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  } else if (attempts < 15) {
                    setTimeout(() => attemptScroll(attempts + 1), 200);
                  }
                };
                attemptScroll();
              }, 400);
            } else if (checkAttempts < 10) {
              setTimeout(() => checkAndScroll(checkAttempts + 1), 200);
            }
          };
          checkAndScroll();
        }, 500);
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          IPTRADE
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium  md:flex">
          {navigationLinks.map((link) => {
            if (link.href.includes("#")) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className="transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-transparent bg-gray-900 px-2 py-0.5 text-sm text-white shadow-none hover:bg-gray-600 cursor-pointer md:border md:border-gray-300 md:bg-white md:text-gray-900 md:hover:bg-gray-100">
            <Link href="/sign-up" target="_blank" rel="noopener noreferrer">
              Sign up
            </Link>
          </div>

          <div className="relative hidden md:block">
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-transparent bg-gray-900 px-2 py-0.5 text-sm cursor-pointer text-white shadow-none hover:bg-gray-600 block"
            >
              Get started
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
