import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dispatch Wizard modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicle_id: "",
    driver_id: "",
    cargo_weight: "",
    estimated_distance: "",
    expected_fuel: "",
    dispatch_time: ""
  });

  const loadTripsData = async () => {
    setIsLoading(true);
    try {
      const [tData, vData, dData] = await Promise.all([
        api.get("/trips"),
        api.get("/vehicles"),
        api.get("/drivers")
      ]);
      setTrips(tData);
      // Filter out vehicles and drivers for available select dropdown
      setVehicles(vData);
      setDrivers(dData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTripsData();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations to match business rules
    const cargoWeightVal = parseFloat(form.cargo_weight);
    const estDistanceVal = parseFloat(form.estimated_distance);
    const expFuelVal = parseFloat(form.expected_fuel);

    if (!form.source.trim() || !form.destination.trim() || !form.vehicle_id || !form.driver_id || !form.dispatch_time) {
      setError("All scheduling fields are required");
      return;
    }

    if (isNaN(cargoWeightVal) || cargoWeightVal <= 0 || isNaN(estDistanceVal) || estDistanceVal <= 0 || isNaN(expFuelVal) || expFuelVal <= 0) {
      setError("Weight, distance, and fuel estimates must be positive numbers");
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
    const selectedDriver = drivers.find((d) => d.id === form.driver_id);

    if (!selectedVehicle || !selectedDriver) {
      setError("Vehicle or driver selection is invalid");
      return;
    }

    // 1. Cargo weight <= vehicle capacity
    if (cargoWeightVal > selectedVehicle.capacity) {
      setError(`Overload warning! Cargo weight (${cargoWeightVal} tons) exceeds vehicle capacity (${selectedVehicle.capacity} tons)`);
      return;
    }

    // 2. Status validations
    if (selectedVehicle.status === "retired") {
      setError("Cannot dispatch retired vehicles");
      return;
    }
    if (selectedVehicle.status === "in_shop") {
      setError("Cannot dispatch vehicles undergoing repairs inside the shop");
      return;
    }
    if (selectedVehicle.status !== "available") {
      setError("Vehicle is currently assigned or unavailable");
      return;
    }

    if (selectedDriver.status === "suspended") {
      setError("Cannot dispatch suspended drivers");
      return;
    }
    if (selectedDriver.status !== "available") {
      setError("Driver is currently on another trip");
      return;
    }

    // 3. Expiry check
    if (new Date(selectedDriver.license_expiry) < new Date()) {
      setError("Cannot dispatch. Selected driver license has expired!");
      return;
    }

    try {
      await api.post("/trips", {
        ...form,
        cargo_weight: cargoWeightVal,
        estimated_distance: estDistanceVal,
        expected_fuel: expFuelVal,
        dispatch_time: new Date(form.dispatch_time).toISOString()
      });
      setIsWizardOpen(false);
      setForm({
        source: "",
        destination: "",
        vehicle_id: "",
        driver_id: "",
        cargo_weight: "",
        estimated_distance: "",
        expected_fuel: "",
        dispatch_time: ""
      });
      loadTripsData();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch trip");
    }
  };

  const handleUpdateStatus = async (tripId: string, nextStatus: string) => {
    try {
      await api.put(`/trips/${tripId}/status`, {
        status: nextStatus,
        description: `Trip marked as ${nextStatus} via manual override.`
      });
      loadTripsData();
    } catch (e: any) {
      alert(e.message || "Failed to update trip status");
    }
  };

  // Lists filtered vehicles/drivers for dropdowns
  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available" && new Date(d.license_expiry) >= new Date());

  return (
    <div className="space-y-lg font-sans">
      {/* Top Banner Control */}
      <div className="flex justify-between items-center border-b border-surface-variant pb-md">
        <h3 className="font-body-md text-on-surface-variant">Active Operations & Dispatches</h3>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-primary text-black font-semibold px-lg py-2 rounded hover:bg-primary-container transition-colors flex items-center gap-sm cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">add_road</span>
          <span>Dispatch Trip Wizard</span>
        </button>
      </div>

      {/* Dispatches List */}
      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Synchronizing dispatches database...</span>
        </div>
      ) : trips.length > 0 ? (
        <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-surface-variant text-on-surface-variant font-label-md text-label-md">
                <th className="p-md">Trip Number</th>
                <th className="p-md">Route</th>
                <th className="p-md">Vehicle</th>
                <th className="p-md">Driver</th>
                <th className="p-md">Cargo</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant font-body-md">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-md font-semibold text-primary">{t.trip_number}</td>
                  <td className="p-md">
                    <div>
                      <h4 className="font-semibold text-on-background">{t.source} ➔ {t.destination}</h4>
                      <p className="text-[12px] text-on-surface-variant">Distance: {t.estimated_distance} km • Fuel: {t.expected_fuel}L</p>
                    </div>
                  </td>
                  <td className="p-md text-on-surface-variant text-sm">
                    {t.vehicle?.name} ({t.vehicle?.registration_number})
                  </td>
                  <td className="p-md text-on-surface-variant text-sm">
                    {t.driver?.full_name}
                  </td>
                  <td className="p-md text-sm">{t.cargo_weight} Tons</td>
                  <td className="p-md">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${
                      t.status === "completed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : t.status === "in_transit" || t.status === "dispatched"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : t.status === "delayed"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-md text-right space-x-xs">
                    {t.status === "assigned" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "dispatched")}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Start Trip
                      </button>
                    )}
                    {t.status === "dispatched" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "in_transit")}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Transit
                      </button>
                    )}
                    {t.status === "in_transit" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "completed")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    <span className="text-[12px] text-on-surface-variant font-label-md pl-xs">
                      {t.status === "completed" && `Finished`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-2xl text-center text-on-surface-variant font-body-md">
          No dispatches registered. Use the wizard to deploy vehicles.
        </div>
      )}

      {/* Dispatch Wizard Dialog */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-lg glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Create Dispatch Schedule</h3>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {error && (
              <div className="p-md rounded bg-error-container/20 border border-error text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleDispatch} className="grid grid-cols-2 gap-md font-body-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Source Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Houston Port"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Destination Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dallas Center"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Vehicle Assignment</label>
                <select
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                >
                  <option value="">Select Available Vehicle</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.name} (Cap: {v.capacity}T)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Driver Assignment</label>
                <select
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={form.driver_id}
                  onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                >
                  <option value="">Select Available Driver</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} (Safety: {d.safety_score})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Cargo Weight (Tons)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 12.5"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.cargo_weight}
                  onChange={(e) => setForm({ ...form, cargo_weight: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Est. Distance (KM)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.estimated_distance}
                  onChange={(e) => setForm({ ...form, estimated_distance: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Expected Fuel Usage (Liters)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 135"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.expected_fuel}
                  onChange={(e) => setForm({ ...form, expected_fuel: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Dispatch Schedule Date/Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.dispatch_time}
                  onChange={(e) => setForm({ ...form, dispatch_time: e.target.value })}
                />
              </div>

              <div className="col-span-2 flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded cursor-pointer transition-colors"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
