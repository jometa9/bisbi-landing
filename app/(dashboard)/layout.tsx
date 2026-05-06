"use client";
import { SidebarProvider } from "@/contexts/sidebar-context";
import React from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <section className="flex flex-col">{children}</section>
    </SidebarProvider>
  );
}
