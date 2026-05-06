import Image from "next/image";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F0EDE6" }}
    >
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "#E6EFED" }}>
        <Image src="/owl_head.svg" alt="Bisbi" width={48} height={48} />
      </div>

      <h1
        className="text-3xl font-semibold mb-3"
        style={{ color: "#1A1A18" }}
      >
        No problem
      </h1>

      <p className="text-base mb-8 max-w-sm" style={{ color: "#5C5C57" }}>
        Your free plan is still active. You can upgrade any time from Bisbi.
      </p>

      <Link
        href="/"
        className="text-sm underline underline-offset-2 cursor-pointer"
        style={{ color: "#7BA89C" }}
      >
        Back to bisbi.app
      </Link>
    </main>
  );
}
