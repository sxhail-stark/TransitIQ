import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "../lib/api";

export const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDriverData = async () => {
      setIsLoading(true);
      try {
        const dData = await api.get(`/drivers/${id}`);
        setDriver(dData);
        
        const allTrips = await api.get("/trips");
        setTrips(allTrips.filter((t: any) => t.driver_id === id));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDriverData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-2xl text-center flex flex-col items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
        <span className="text-on-surface-variant font-body-md">Synchronizing driver profile data...</span>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="py-2xl text-center text-error font-body-md">
        Driver profile not found in active registries.
      </div>
    );
  }

  const daysToLicenseExpiry = Math.ceil(
    (new Date(driver.license_expiry).getTime() - Date.now()) / 86400000
  );
  
  const licenseExpired = daysToLicenseExpiry <= 0;
  const licenseWarning = daysToLicenseExpiry > 0 && daysToLicenseExpiry <= 30;

  // Mock safety score trend data over recent months
  const safetyTrendData = [
    { month: "Jan", score: 98 },
    { month: "Feb", score: 95 },
    { month: "Mar", score: 96 },
    { month: "Apr", score: 92 },
    { month: "May", score: 94 },
    { month: "Jun", score: driver.safety_score }
  ];

  return (
    <div className="space-y-lg font-sans">
      {/* Expiry Alert Banners */}
      {licenseExpired && (
        <div className="p-md rounded bg-red-500/10 border border-red-500 text-error text-body-md flex items-center gap-sm shadow-sm animate-pulse">
          <span className="material-symbols-outlined text-[24px]">gavel</span>
          <div>
            <h4 className="font-semibold">Security Alert: Commercial License Expired</h4>
            <p className="text-xs text-on-surface-variant mt-xs">
              Driver cannot be assigned to any dispatches until license is renewed and validated by safety.
            </p>
          </div>
        </div>
      )}
      {licenseWarning && (
        <div className="p-md rounded bg-amber-500/10 border border-amber-500 text-amber-400 text-body-md flex items-center gap-sm shadow-sm">
          <span className="material-symbols-outlined text-[24px]">notification_important</span>
          <div>
            <h4 className="font-semibold">Operations Warning: License Nearing Expiry</h4>
            <p className="text-xs text-on-surface-variant mt-xs">
              License expires in {daysToLicenseExpiry} days. Please schedule renewal processing.
            </p>
          </div>
        </div>
      )}

      {/* 1. Header Banner Card */}
      <div className="bg-surface-container border border-surface-variant rounded-xl p-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="flex gap-md items-start">
          <div className="w-16 h-16 rounded-full bg-surface-variant border border-primary-container/20 flex items-center justify-center text-primary font-bold text-2xl shadow-md">
            {driver.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-sm">
              <h2 className="font-headline-lg text-headline-md text-on-background">{driver.full_name}</h2>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                driver.status === "available"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : driver.status === "on_trip"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {driver.status}
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant mt-xs">
              License #: {driver.license_number} • Phone: {driver.phone} • Experience: {driver.experience_years} Years
            </p>
          </div>
        </div>

        <div className="flex gap-sm self-stretch md:self-auto">
          {driver.status === "suspended" ? (
            <span className="px-lg py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-body-md rounded">
              Driver Suspended
            </span>
          ) : (
            <Link
              to="/trips"
              className="flex-1 px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded text-body-md text-center transition-colors shadow-md"
            >
              Dispatch Driver
            </Link>
          )}
        </div>
      </div>

      {/* 2. Score Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-sm">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Safety Score</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">{driver.safety_score} / 100</h2>
          </div>
          <span className="material-symbols-outlined text-[36px] text-primary">security</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-sm">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Completed Trips</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">{driver.trips_completed}</h2>
          </div>
          <span className="material-symbols-outlined text-[36px] text-secondary">assignment_turned_in</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-sm">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Active Incidents</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm text-error">{driver.incidents_count}</h2>
          </div>
          <span className="material-symbols-outlined text-[36px] text-error">dangerous</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-sm">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Roster Rank</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">Gold Class</h2>
          </div>
          <span className="material-symbols-outlined text-[36px] text-amber-400">workspace_premium</span>
        </div>
      </div>

      {/* 3. Detailed views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left: Trend line chart */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md lg:col-span-1">
          <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md">
            Safety Score Trend
          </h3>
          <div className="h-60 mt-md">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safetyTrendData}>
                <XAxis dataKey="month" stroke="#d8c3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#d8c3af" fontSize={11} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e2024", borderColor: "#333539" }}
                  labelStyle={{ color: "#e2e2e8" }}
                />
                <Line type="monotone" dataKey="score" stroke="#D98A16" strokeWidth={2} dot={{ fill: "#D98A16", r: 4 }} name="Safety Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Driver dispatches table */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md lg:col-span-2">
          <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md">
            Assigned Dispatches Log
          </h3>
          
          <div className="overflow-x-auto">
            {trips.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-variant text-on-surface-variant text-[12px] font-semibold uppercase">
                    <th className="py-2">Trip Number</th>
                    <th className="py-2">Route</th>
                    <th className="py-2">Distance</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/40 text-sm font-body-md">
                  {trips.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/40">
                      <td className="py-3 font-semibold text-primary">{t.trip_number}</td>
                      <td className="py-3">{t.source} ➔ {t.destination}</td>
                      <td className="py-3">{t.estimated_distance} km</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          t.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : t.status === "in_transit"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-on-surface-variant">
                        {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-lg text-center text-on-surface-variant text-body-md">
                No trips logged for this driver record.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
