import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import { api } from "../lib/api";

export const Analytics: React.FC = () => {
  const [fuelTrend, setFuelTrend] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [driverRankings, setDriverRankings] = useState<any[]>([]);
  const [vehicleRankings, setVehicleRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [dateRange, setDateRange] = useState("30");
  const [regionFilter, setRegionFilter] = useState("all");

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [fData, eData, dRank, vRank] = await Promise.all([
        api.get("/analytics/charts/fuel-trend"),
        api.get("/analytics/charts/expenses-breakdown"),
        api.get("/analytics/rankings/drivers"),
        api.get("/analytics/rankings/vehicles")
      ]);
      setFuelTrend(fData);
      setExpenses(eData);
      setDriverRankings(dRank);
      setVehicleRankings(vRank);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, regionFilter]);

  const handleDownloadReport = (format: string) => {
    alert(`Downloading operations summary report in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="space-y-lg font-sans">
      {/* Filters and Exports Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-surface-variant pb-md">
        <div className="flex flex-wrap items-center gap-sm">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-body-md cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
          
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-body-md cursor-pointer"
          >
            <option value="all">All Regions</option>
            <option value="north">North Branch</option>
            <option value="south">South Branch</option>
            <option value="midwest">Midwest Logistics</option>
          </select>
        </div>

        <div className="flex gap-sm">
          <button
            onClick={() => handleDownloadReport("csv")}
            className="px-md py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold text-body-md rounded cursor-pointer transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => handleDownloadReport("pdf")}
            className="px-md py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold text-body-md rounded cursor-pointer transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>PDF Summary</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Assembling operations intelligence...</span>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Fuel Consumption Trend (Area Chart) */}
            <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
              <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
                Fuel Refill Cost Trend
              </h4>
              <div className="h-64 mt-md">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fuelTrend}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D98A16" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D98A16" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333539" vertical={false} />
                    <XAxis dataKey="date" stroke="#d8c3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#d8c3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e2024", borderColor: "#333539" }} />
                    <Area type="monotone" dataKey="cost" stroke="#D98A16" fillOpacity={1} fill="url(#colorCost)" name="Refill Cost ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses breakdown (Bar Chart) */}
            <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
              <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
                Operations Expenses Breakdown
              </h4>
              <div className="h-64 mt-md">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333539" vertical={false} />
                    <XAxis dataKey="category" stroke="#d8c3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#d8c3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e2024", borderColor: "#333539" }} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Spend ($)">
                      {expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#D98A16" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Rankings Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Top Drivers Leaderboard */}
            <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
              <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
                Safety Leaderboard (Crew Rankings)
              </h4>
              <div className="divide-y divide-surface-variant/40">
                {driverRankings.map((driver, index) => (
                  <div key={driver.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-md">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 
                          ? "bg-amber-400 text-black" 
                          : index === 1 
                          ? "bg-slate-300 text-black" 
                          : index === 2 
                          ? "bg-amber-700 text-white" 
                          : "bg-surface-container-high text-on-surface-variant border border-surface-variant"
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <h5 className="font-semibold text-on-background">{driver.name}</h5>
                        <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">
                          Trips Completed: {driver.trips_completed} • Incidents: {driver.incidents}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-sm">
                      <span className="font-bold text-primary">{driver.safety_score} pts</span>
                      <span className="material-symbols-outlined text-[18px] text-emerald-400">trending_up</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle health rankings */}
            <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
              <h4 className="font-body-md font-semibold text-on-background mb-md border-b border-surface-variant pb-sm">
                Vehicle Performance Index
              </h4>
              <div className="divide-y divide-surface-variant/40">
                {vehicleRankings.map((v, index) => (
                  <div key={v.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-sm">
                        <span className="font-semibold text-on-background">{v.registration_number}</span>
                        <span className="text-xs text-on-surface-variant">({v.name})</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-xs">
                        Mileage: {v.odometer?.toLocaleString()} km
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-xs font-bold text-emerald-400">
                        <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                        <span>{v.health_score}%</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant block mt-xs">Health index</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
