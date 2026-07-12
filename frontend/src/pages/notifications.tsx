import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all", {});
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "license_expiry":
        return "gavel";
      case "maintenance_due":
        return "build";
      case "trip_delayed":
        return "schedule";
      case "vehicle_retired":
        return "cancel";
      case "driver_suspended":
        return "block";
      case "fuel_anomaly":
        return "local_gas_station";
      default:
        return "notifications";
    }
  };

  return (
    <div className="bg-surface-container border border-surface-variant rounded-xl p-lg shadow-md font-sans space-y-lg">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md border-b border-surface-variant pb-md">
        {/* Navigation Filter Tabs */}
        <div className="flex bg-surface-container-high rounded-lg p-1 border border-surface-variant">
          <button
            onClick={() => setFilter("all")}
            className={`px-lg py-1.5 font-label-md text-label-md rounded-md cursor-pointer transition-all ${
              filter === "all" ? "bg-surface-variant text-on-background shadow" : "text-on-surface-variant hover:text-on-background"
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-lg py-1.5 font-label-md text-label-md rounded-md cursor-pointer transition-all ${
              filter === "unread" ? "bg-surface-variant text-on-background shadow" : "text-on-surface-variant hover:text-on-background"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-lg py-1.5 font-label-md text-label-md rounded-md cursor-pointer transition-all ${
              filter === "read" ? "bg-surface-variant text-on-background shadow" : "text-on-surface-variant hover:text-on-background"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Clear trigger */}
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold text-body-md rounded cursor-pointer transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-xl text-center text-on-surface-variant font-label-md text-xs">
          Loading alerts inbox...
        </div>
      ) : filteredNotifs.length > 0 ? (
        <div className="divide-y divide-surface-variant">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`py-md flex items-start gap-md transition-colors ${
                !n.is_read ? "bg-primary/5 -mx-lg px-lg border-l-4 border-primary" : ""
              }`}
            >
              {/* Type icon */}
              <span className={`material-symbols-outlined text-[24px] mt-xs ${
                n.priority === "high" ? "text-error" : n.priority === "medium" ? "text-primary" : "text-sky-400"
              }`}>
                {getNotifIcon(n.type)}
              </span>

              {/* Text */}
              <div className="flex-1">
                <div className="flex justify-between items-start gap-sm">
                  <h4 className="font-semibold text-on-background">{n.title}</h4>
                  <span className="font-label-md text-[11px] text-on-surface-variant">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-xs leading-relaxed">{n.message}</p>
              </div>

              {/* Actions */}
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 bg-surface-container-high hover:bg-surface-variant border border-surface-variant rounded text-[11px] text-on-background font-label-md cursor-pointer transition-colors"
                >
                  Archive
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-2xl text-center text-on-surface-variant font-body-md">
          Notifications inbox is empty. All alerts clear!
        </div>
      )}
    </div>
  );
};
