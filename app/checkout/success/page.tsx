import Image from "next/image";

export default function CheckoutSuccessPage() {
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
        You&apos;re on Pro!
      </h1>

      <p className="text-base mb-8 max-w-sm" style={{ color: "#5C5C57" }}>
        Your subscription is active. Open Bisbi and enjoy unlimited dictation.
      </p>

      <p className="text-sm" style={{ color: "#A8A8A2" }}>
        You can close this window and return to the app.
      </p>
    </main>
  );
}
