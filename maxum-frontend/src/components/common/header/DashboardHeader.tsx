"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  HeaderChevronDownIcon,
  HeaderHelpIcon,
  HeaderLogoutIcon,
  HeaderNotificationIcon,
  HeaderSearchIcon,
  HeaderSettingsIcon,
  HeaderUserIcon,
} from "@/assets/icons/svgIcon";
import "./DashboardHeader.scss";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Refs for dropdown containers
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications dropdown if clicked outside
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      // Close profile dropdown if clicked outside
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    // Add event listener when either dropdown is open
    if (showNotifications || showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: "Leave request approved", time: "5 mins ago", unread: true },
    { id: 2, title: "New project assigned", time: "1 hour ago", unread: true },
    { id: 3, title: "Payroll processed", time: "2 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__left">
        <button className="dashboard-header__search-btn">
          <HeaderSearchIcon />
          <span>Search for anything...</span>
        </button>
      </div>

      <div className="dashboard-header__right">
        {/* Notifications */}
        <div className="dashboard-header__dropdown" ref={notificationsRef}>
          <button
            className="dashboard-header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <HeaderNotificationIcon />
            {unreadCount > 0 && (
              <span className="dashboard-header__badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dashboard-header__menu">
              <div className="dashboard-header__menu-header">
                <h4>Notifications</h4>
                <button className="dashboard-header__menu-action">Mark all read</button>
              </div>
              <div className="dashboard-header__menu-content">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`dashboard-header__notification ${notif.unread ? "unread" : ""}`}
                  >
                    <div className="dashboard-header__notification-content">
                      <p>{notif.title}</p>
                      <span>{notif.time}</span>
                    </div>
                    {notif.unread && <span className="dashboard-header__notification-dot"></span>}
                  </div>
                ))}
              </div>
              <div className="dashboard-header__menu-footer">
                <button>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="dashboard-header__dropdown" ref={profileRef}>
          <button
            className="dashboard-header__profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="dashboard-header__avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="dashboard-header__profile-info">
              <span className="dashboard-header__profile-name">{user?.name || "User"}</span>
              <span className="dashboard-header__profile-role">{user?.role || "Employee"}</span>
            </div>
            <HeaderChevronDownIcon />
          </button>

          {showProfileMenu && (
            <div className="dashboard-header__menu dashboard-header__menu--profile">
              <div className="dashboard-header__menu-user">
                <div className="dashboard-header__avatar dashboard-header__avatar--large">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h4>{user?.name || "User"}</h4>
                  <p>{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <div className="dashboard-header__menu-divider"></div>
              <div className="dashboard-header__menu-content">
                <button className="dashboard-header__menu-item">
                  <HeaderUserIcon />
                  <span>My Profile</span>
                </button>
                <button className="dashboard-header__menu-item">
                  <HeaderSettingsIcon />
                  <span>Settings</span>
                </button>
                <button className="dashboard-header__menu-item">
                  <HeaderHelpIcon />
                  <span>Help & Support</span>
                </button>
              </div>
              <div className="dashboard-header__menu-divider"></div>
              <div className="dashboard-header__menu-content">
                <button
                  className="dashboard-header__menu-item dashboard-header__menu-item--danger"
                  onClick={handleLogout}
                >
                  <HeaderLogoutIcon />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
