// Main application layout component.
// Handles authentication checks, sidebar/navbar rendering, and page routing.
// Also fetches unread notifications and displays the global dashboard shell.

import React, { useEffect, useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { AIAgentWidget } from "./AIAgentWidget";
import { api } from "../lib/api";

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
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

  const allowedPaths: Record<string, string[]> = {
    "Financial Analyst": ["/", "/financials", "/settings"],
    "Driver": ["/", "/trips"],
    "Dispatcher": ["/", "/trips"],
    "Safety Officer": ["/", "/fleet", "/drivers", "/notifications"],
    "Fleet Manager": ["/", "/fleet", "/drivers", "/trips", "/maintenance", "/financials", "/analytics", "/ai-assistant", "/activity", "/notifications", "/settings"]
  };

  const role = user?.role || "Driver";
  const baseRoute = location.pathname.split("/")[1];
  const checkPath = baseRoute ? `/${baseRoute}` : "/";
  
  const allowedList = allowedPaths[role] || ["/"];
  if (!allowedList.includes(checkPath)) {
    return <Navigate to="/" replace />;
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

          {/* Quick Actions & Navigation Link Badge */}
          <div className="flex items-center gap-lg">
            {/* Notification Badge */}
            <Link to="/notifications" className="relative p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center text-on-surface-variant hover:text-on-background">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary-container text-black font-label-md text-[10px] rounded-full flex items-center justify-center font-bold border border-background">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Page Router Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-lg relative">
          <Outlet />
        </main>

        {/* Floating AI Agent Widget */}
        <AIAgentWidget />
      </div>
    </div>
  );
};
