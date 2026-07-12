import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/", icon: "grid_view" },
    { name: "Fleet Registry", path: "/fleet", icon: "local_shipping" },
    { name: "Drivers", path: "/drivers", icon: "badge" },
    { name: "Trips (Dispatcher)", path: "/trips", icon: "route" },
    { name: "Maintenance", path: "/maintenance", icon: "build" },
    { name: "Financials", path: "/financials", icon: "payments" },
    { name: "Analytics", path: "/analytics", icon: "analytics" },
    { name: "AI Assistant", path: "/ai-assistant", icon: "smart_toy" },
    { name: "Activity", path: "/activity", icon: "history" },
    { name: "Notifications", path: "/notifications", icon: "notifications" },
    { name: "Settings", path: "/settings", icon: "settings" }
  ];

  const getFilteredNavItems = () => {
    if (!user) return [];
    const role = user.role;
    if (role === "Financial Analyst") {
      return navItems.filter((item) =>
        ["Dashboard", "Financials", "Settings"].includes(item.name)
      );
    }
    if (role === "Driver" || role === "Dispatcher") {
      return navItems.filter((item) =>
        ["Dashboard", "Trips (Dispatcher)"].includes(item.name)
      );
    }
    if (role === "Safety Officer") {
      return navItems.filter((item) =>
        ["Dashboard", "Fleet Registry", "Drivers", "Notifications"].includes(item.name)
      );
    }
    return navItems; // Fleet Manager has full access
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <div className="w-sidebar-width h-screen bg-surface-dim border-r border-surface-variant flex flex-col justify-between select-none">
      {/* Top Section: Branding */}
      <div>
        <div className="flex items-center gap-sm p-lg border-b border-surface-variant">
          <span className="material-symbols-outlined text-primary text-[28px]">route</span>
          <h1 className="font-headline-md text-title-md text-on-background tracking-wide">TransitIQ</h1>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-xs p-md overflow-y-auto max-h-[calc(100vh-180px)]">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-3 rounded-md font-body-md transition-all duration-200 border ${
                  isActive
                    ? "bg-surface-container-high border-surface-variant text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-background hover:bg-surface-container-low"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Profile */}
      <div className="p-lg border-t border-surface-variant bg-surface-container-lowest flex flex-col gap-md">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full bg-surface-variant border border-primary-container/20 flex items-center justify-center text-primary font-bold shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {user?.full_name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-body-md font-semibold text-on-background truncate">{user?.full_name || "Agent Name"}</h4>
            <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] truncate">
              {user?.role || "Fleet Manager"}
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            logout();
            navigate("/signin");
          }}
          className="w-full py-2 bg-surface-container-high hover:bg-surface-variant text-error font-label-md rounded border border-surface-variant flex justify-center items-center gap-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
