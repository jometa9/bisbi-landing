import Image from "next/image";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#F0EDE6" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/owl_head.svg" alt="Bisbi" width={22} height={22} />
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "#1A1A18" }}
          >
            bisbi
          </span>
        </Link>
      </div>
    </header>
  );
}
