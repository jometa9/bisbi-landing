import Link from "next/link";

export function AuthHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-4">
        <Link href="/" className="flex items-center cursor-pointer">
          <span
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "#7BA89C" }}
          >
            Bisbi
          </span>
        </Link>
      </div>
    </header>
  );
}
