"use client";

import AuthGuard from "@/guard/AuthGuard";
import Header from "@/components/common/header/Header";
import "./layout.scss";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="pageWrapper">
        <Header />
        <main className="mainContent">{children}</main>
      </div>
    </AuthGuard>
  );
}
