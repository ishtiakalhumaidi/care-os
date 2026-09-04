import React from "react";
import { Nav } from "@/components/common/nav";
import Footer from "@/components/common/Footer";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}