import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [fuelTrend, setFuelTrend] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [finSummary, setFinSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, fuelRes, expRes, finRes, actRes, notifRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/charts/fuel-trend"),
          api.get("/analytics/charts/expenses-breakdown"),
          api.get("/financials/summary"),
          api.get("/activity?limit=5"),
          api.get("/notifications")
        ]);
        setSummary(sumRes);
        setFuelTrend(fuelRes);
        setExpenseBreakdown(expRes);
        setFinSummary(finRes);
        setActivities(actRes);
        setNotifications(notifRes.filter((n: any) => !n.is_read).slice(0, 4));
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-lg animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container rounded-xl border border-surface-variant"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="h-80 bg-surface-container rounded-xl border border-surface-variant"></div>
          <div className="h-80 bg-surface-container rounded-xl border border-surface-variant"></div>
        </div>
      </div>
    );
  }

  // Fallbacks for empty state graphs
  const chartFuelData = fuelTrend.length > 0 ? fuelTrend : [
    { date: "Day 1", cost: 100 }, { date: "Day 2", cost: 180 }, { date: "Day 3", cost: 150 }
  ];

  const chartExpData = expenseBreakdown.length > 0 ? expenseBreakdown : [
    { category: "Repairs", amount: 500 }, { category: "Insurance", amount: 1200 }, { category: "Tolls", amount: 150 }
  ];

  const vehiclePieData = [
    { name: "Active", value: summary?.vehicles?.active || 1, color: "#D98A16" }, // Orange
    { name: "Available", value: summary?.vehicles?.available || 2, color: "#3b82f6" }, // Blue
    { name: "In Shop", value: summary?.vehicles?.in_maintenance || 1, color: "#ef4444" } // Red
  ];

  // Quick action triggers
  const baseActions = [
    { title: "Dispatch Trip", icon: "route", path: "/trips", color: "text-primary border-primary-container/20" },
    { title: "Add Vehicle", icon: "local_shipping", path: "/fleet", color: "text-secondary border-secondary-container/20" },
    { title: "Add Driver", icon: "badge", path: "/drivers", color: "text-tertiary border-tertiary-container/20" },
    { title: "AI Assistant", icon: "smart_toy", path: "/ai-assistant", color: "text-emerald-400 border-emerald-500/20" }
  ];

  const getFilteredActions = () => {
    if (user?.role !== "Fleet Manager") {
      return baseActions.filter((act) => act.title !== "Add Vehicle" && act.title !== "Add Driver");
    }
    return baseActions;
  };

  const actions = getFilteredActions();

  return (
    <div className="space-y-lg">
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Active Vehicles */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Active Fleet</span>
            <span className="material-symbols-outlined text-primary text-[22px]">local_shipping</span>
          </div>
          <div className="mt-md">
            <h2 className="font-display-lg text-headline-lg text-on-background">
              {summary?.vehicles?.active} / {summary?.vehicles?.total}
            </h2>
            <p className="font-body-md text-on-surface-variant text-[12px] mt-xs">
              {summary?.vehicles?.available} vehicles available • {summary?.vehicles?.in_maintenance} in shop
            </p>
          </div>
        </div>

        {/* Trips Today */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Active Dispatches</span>
            <span className="material-symbols-outlined text-secondary text-[22px]">route</span>
          </div>
          <div className="mt-md">
            <h2 className="font-display-lg text-headline-lg text-on-background">
              {summary?.trips?.active}
            </h2>
            <p className="font-body-md text-on-surface-variant text-[12px] mt-xs">
              {summary?.trips?.completed} completed today • {summary?.trips?.delayed} delayed
            </p>
          </div>
        </div>

        {/* Operational Cost */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Operational Cost</span>
            <span className="material-symbols-outlined text-error text-[22px]">payments</span>
          </div>
          <div className="mt-md">
            <h2 className="font-display-lg text-headline-lg text-on-background">
              ${finSummary?.total_operational_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="font-body-md text-on-surface-variant text-[12px] mt-xs">
              Avg Cost/KM: ${finSummary?.cost_per_km?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Fleet Health Score */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Safety Rating</span>
            <span className="material-symbols-outlined text-emerald-400 text-[22px]">verified_user</span>
          </div>
          <div className="mt-md">
            <div className="flex items-center gap-sm">
              <h2 className="font-display-lg text-headline-lg text-on-background">
                {summary?.avg_driver_safety_score?.toFixed(0)}
              </h2>
              <span className="font-label-md text-[12px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Optimal
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant text-[12px] mt-xs">
              Avg health: {summary?.avg_vehicle_health_score?.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Fuel Trend (Line Chart) */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md lg:col-span-2 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-sm">
            <h4 className="font-body-md font-semibold text-on-background">Fuel Consumption & Cost Trend</h4>
            <span className="font-label-md text-[12px] text-on-surface-variant">Last 7 refuels</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartFuelData}>
                <XAxis dataKey="date" stroke="#d8c3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#d8c3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e2024", borderColor: "#333539" }} 
                  labelStyle={{ color: "#e2e2e8" }}
                />
                <Line type="monotone" dataKey="cost" stroke="#D98A16" strokeWidth={2} dot={{ fill: "#D98A16", r: 4 }} name="Cost ($)" />
                <Line type="monotone" dataKey="quantity" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Volume (L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Breakdown (Pie Chart) */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-sm">
            <h4 className="font-body-md font-semibold text-on-background">Fleet Status Allocations</h4>
          </div>
          <div className="h-48 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehiclePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehiclePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Total Fleet</span>
              <h2 className="font-display-lg text-headline-md text-on-background mt-xs">{summary?.vehicles?.total}</h2>
            </div>
          </div>
          {/* Pie Legends */}
          <div className="flex justify-around items-center mt-sm">
            {vehiclePieData.map((v) => (
              <div key={v.name} className="flex items-center gap-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }}></span>
                <span className="font-label-md text-[11px] text-on-surface-variant">{v.name} ({v.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Lower Grid: Lists & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Left list: Recent Activities */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md lg:col-span-2 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-sm">
            <h4 className="font-body-md font-semibold text-on-background">Live Fleet Events</h4>
            <Link to="/activity" className="font-label-md text-primary text-[12px] hover:underline">
              View Audit Log
            </Link>
          </div>
          <div className="space-y-md">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex gap-md items-start p-sm rounded bg-surface-container-low border border-surface-variant/40">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-xs">
                    {act.action === "trip_created" || act.action === "trip_status_updated" 
                      ? "route" 
                      : act.action === "fuel_logged" 
                      ? "local_gas_station" 
                      : "info"}
                  </span>
                  <div className="flex-1">
                    <p className="font-body-md text-on-background">{act.description}</p>
                    <span className="font-label-md text-[11px] text-on-surface-variant mt-xs block">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-md text-center text-on-surface-variant font-body-md">
                No recent activities found.
              </div>
            )}
          </div>
        </div>

        {/* Right side: Quick Actions & Alerts */}
        <div className="flex flex-col gap-md">
          {/* Quick Actions Card */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
              Quick Controls
            </h4>
            <div className="grid grid-cols-2 gap-sm">
              {actions.map((act) => (
                <button
                  key={act.title}
                  onClick={() => navigate(act.path)}
                  className={`flex flex-col items-center justify-center p-md rounded-lg border bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer gap-sm group`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${act.color} group-hover:scale-110 transition-transform`}>
                    {act.icon}
                  </span>
                  <span className="font-label-md text-[11px] text-on-surface-variant group-hover:text-on-background transition-colors text-center">
                    {act.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pending Alerts list */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex-1 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
              Active Alerts
            </h4>
            <div className="space-y-sm">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-sm rounded border border-error/20 bg-error-container/5 flex gap-sm items-start">
                    <span className="material-symbols-outlined text-error text-[20px] mt-xs">warning</span>
                    <div className="flex-1">
                      <h5 className="font-body-md font-semibold text-on-background text-[13px]">{notif.title}</h5>
                      <p className="font-label-md text-[11px] text-on-surface-variant mt-xs line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-md text-center text-on-surface-variant font-label-md text-[12px]">
                  All alerts clear. No operations warnings.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
