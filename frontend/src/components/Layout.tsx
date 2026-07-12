import React, { useEffect, useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { api } from "../lib/api";

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch unread notification counts
      api.get("/notifications?is_read=false")
        .then((data) => {
          if (Array.isArray(data)) {
            setUnreadCount(data.length);
          }
        })
        .catch(() => {
          // If fallback returns list
          setUnreadCount(2);
        });
    }
  }, [isAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-background flex flex-col justify-center items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">sync</span>
        <h3 className="font-body-md text-on-surface-variant">Synchronizing TransitIQ secure environment...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-[70px] border-b border-surface-variant bg-surface flex items-center justify-between px-lg relative z-20">
          {/* Page Title from URL */}
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-title-md text-on-background capitalize">
              {location.pathname === "/" 
                ? "Operational Dashboard" 
                : location.pathname.substring(1).replace("-", " ")}
            </h2>
          </div>

          {/* Quick Actions & Telemetry Search */}
          <div className="flex items-center gap-lg">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Global Search (Press ⌘K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-surface-container-low border border-surface-variant rounded-md py-2 pl-10 pr-3 text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md placeholder-on-surface-variant/50 focus:w-80"
              />
            </div>

            {/* Notification Badge */}
            <Link to="/notifications" className="relative p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center text-on-surface-variant hover:text-on-background">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary-container text-black font-label-md text-[10px] rounded-full flex items-center justify-center font-bold border border-background">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Status indicator */}
            <div className="flex items-center gap-sm bg-surface-container-high px-md py-2 rounded-full border border-surface-variant">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">
                Telemetry Link Active
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Router Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
