import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const LiveMap: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      try {
        const data = await api.get("/trips");
        const active = data.filter((t: any) => t.status === "in_transit" || t.status === "dispatched" || t.status === "delayed");
        setTrips(active);
        if (active.length > 0) {
          setSelectedTrip(active[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrips();
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-xl font-sans">
      {/* 1. Left sidebar: Active Dispatches */}
      <div className="w-80 border-r border-surface-variant bg-surface flex flex-col">
        <div className="p-md bg-surface-container-high border-b border-surface-variant">
          <h4 className="font-semibold text-on-background text-sm">Active Crew Routes</h4>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mt-xs">
            {trips.length} Vehicles In Transit
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-sm">
          {isLoading ? (
            <div className="py-xl text-center text-on-surface-variant font-label-md text-xs">
              Synchronizing maps...
            </div>
          ) : trips.length > 0 ? (
            trips.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrip(t)}
                className={`w-full text-left p-md rounded-lg border transition-all cursor-pointer block ${
                  selectedTrip?.id === t.id
                    ? "bg-surface-container-high border-primary text-on-background shadow"
                    : "bg-surface-container-low border-surface-variant text-on-surface-variant hover:text-on-background hover:bg-surface-container"
                }`}
              >
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-semibold text-[13px] text-primary">{t.trip_number}</span>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded">
                    {t.status}
                  </span>
                </div>
                <h5 className="font-semibold text-on-background text-[13px] truncate">{t.source}</h5>
                <p className="text-[11px] text-on-surface-variant mt-xs">➔ {t.destination}</p>
                <div className="mt-sm flex justify-between items-center text-[10px] text-on-surface-variant border-t border-surface-variant/40 pt-xs">
                  <span>Driver: {t.driver?.full_name}</span>
                  <span>Cap: {t.cargo_weight}T</span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-xl text-center text-on-surface-variant font-label-md text-xs">
              No active vehicle routes discovered in transit.
            </div>
          )}
        </div>
      </div>

      {/* 2. Right: Interactive Mock Map Grid */}
      <div className="flex-1 bg-surface-container-lowest relative flex flex-col justify-between overflow-hidden">
        {/* Mock Map Background Grid */}
        <div className="absolute inset-0 mock-map opacity-30 z-0"></div>

        {/* Floating details banner on top of map */}
        {selectedTrip ? (
          <div className="absolute top-md left-md right-md bg-surface/90 backdrop-blur border border-surface-variant rounded-lg p-md z-10 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex justify-between items-center gap-md">
            <div>
              <span className="font-label-md text-on-surface-variant text-[10px] uppercase tracking-wider block">
                Tracking Dispatch
              </span>
              <h4 className="font-semibold text-on-background text-[15px]">{selectedTrip.trip_number}</h4>
              <p className="text-xs text-on-surface-variant">
                Route: {selectedTrip.source} to {selectedTrip.destination}
              </p>
            </div>
            
            <div className="text-right border-l border-surface-variant pl-md">
              <span className="font-label-md text-on-surface-variant text-[10px] uppercase tracking-wider block">
                Estimated Arrival
              </span>
              <h4 className="font-semibold text-primary text-[15px]">
                {selectedTrip.eta ? new Date(selectedTrip.eta).toLocaleTimeString() : "Calculating..."}
              </h4>
              <p className="text-xs text-on-surface-variant">
                Distance Remaining: {selectedTrip.estimated_distance / 2} km
              </p>
            </div>
          </div>
        ) : null}

        {/* Visual Map Render Container */}
        <div className="flex-grow flex justify-center items-center relative z-0">
          {/* Stylized Node Network Graph simulating tracking */}
          <div className="relative w-full h-[300px] flex items-center justify-around">
            {/* Horizontal transit paths */}
            <div className="absolute w-[80%] h-0.5 bg-gradient-to-r from-primary/10 via-primary to-blue-500/20"></div>
            
            {/* Source Node */}
            <div className="w-16 h-16 rounded-full border border-surface-variant bg-surface flex flex-col justify-center items-center z-10 shadow-lg">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">warehouse</span>
              <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-xs">Source</span>
            </div>

            {/* Glowing Truck Icon representing active transit */}
            <div className="relative z-10 -translate-y-4 animate-bounce">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-[10px]"></div>
              <div className="w-12 h-12 rounded-full border border-primary bg-surface-dim flex justify-center items-center shadow-lg relative">
                <span className="material-symbols-outlined text-[24px] text-primary">local_shipping</span>
              </div>
            </div>

            {/* Destination Node */}
            <div className="w-16 h-16 rounded-full border border-surface-variant bg-surface flex flex-col justify-center items-center z-10 shadow-lg">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">location_on</span>
              <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-xs">Dest</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry details panel at bottom */}
        {selectedTrip ? (
          <div className="bg-surface/90 border-t border-surface-variant p-md z-10 relative flex justify-around items-center text-center">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Speed</span>
              <h5 className="font-semibold text-on-background text-sm mt-xs">82 km/h</h5>
            </div>
            <div className="border-l border-surface-variant/40 h-6"></div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Fuel Consumption</span>
              <h5 className="font-semibold text-on-background text-sm mt-xs">31.4 L / 100km</h5>
            </div>
            <div className="border-l border-surface-variant/40 h-6"></div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Tire Temperature</span>
              <h5 className="font-semibold text-emerald-400 text-sm mt-xs">Normal</h5>
            </div>
            <div className="border-l border-surface-variant/40 h-6"></div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Cargo Weight</span>
              <h5 className="font-semibold text-on-background text-sm mt-xs">{selectedTrip.cargo_weight} Tons</h5>
            </div>
          </div>
        ) : (
          <div className="bg-surface border-t border-surface-variant p-md text-center text-on-surface-variant font-label-md text-xs relative z-10">
            Select a live route dispatch from the sidebar panel to check telemetry.
          </div>
        )}
      </div>
    </div>
  );
};
