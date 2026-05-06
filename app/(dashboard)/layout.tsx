import React from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="flex flex-col">{children}</section>;
}
