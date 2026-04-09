"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/common/sidebar/Sidebar";
import DashboardHeader from "@/components/common/header/DashboardHeader";
import "./DashboardLayout.scss";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout__main">
        <DashboardHeader />
        <main className="dashboard-layout__content">{children}</main>
      </div>
    </div>
  );
}
