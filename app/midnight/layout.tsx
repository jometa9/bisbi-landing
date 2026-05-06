export default function MidnightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-full min-w-0 h-screen overflow-x-hidden overflow-y-auto scrollbar-hide select-none">
      {children}
    </div>
  );
}
