"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarWorkHubLogoIcon } from "@/assets/icons/svgIcon";
import "./Sidebar.scss";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  subItems?: { label: string; path: string }[];
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    path: "/dashboard",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: "📅",
    path: "/attendance",
  },
  {
    id: "leave",
    label: "Leave Management",
    icon: "🏖️",
    path: "/leave",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "🚀",
    path: "/projects",
    badge: "EWMS",
  },
  {
    id: "employees",
    label: "Employees",
    icon: "👥",
    path: "/employees",
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: "💰",
    path: "/payroll",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "📈",
    path: "/reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    path: "/settings",
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="app-sidebar__header">
        <Link href="/dashboard" className="app-sidebar__logo">
          <div className="app-sidebar__logo-icon">
            <SidebarWorkHubLogoIcon />
          </div>
          {!isCollapsed && <span className="app-sidebar__logo-text">WorkHub</span>}
        </Link>
        <button
          className="app-sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="app-sidebar__nav">
        <ul className="app-sidebar__menu">
          {navigationItems.map((item) => (
            <li key={item.id} className="app-sidebar__menu-item">
              <Link
                href={item.path}
                className={`app-sidebar__link ${isActive(item.path) ? "active" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="app-sidebar__icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="app-sidebar__label">{item.label}</span>
                    {item.badge && (
                      <span className="app-sidebar__badge">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="app-sidebar__footer">
        {!isCollapsed && (
          <div className="app-sidebar__help">
            <span className="app-sidebar__help-icon">💡</span>
            <div className="app-sidebar__help-content">
              <h4>Need Help?</h4>
              <p>Contact support for assistance</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
