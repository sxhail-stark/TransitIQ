import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export const Fleet: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    registration_number: "",
    name: "",
    model: "",
    capacity: "",
    fuel_type: "Diesel",
    odometer: "0",
    insurance_number: "",
    fitness_certificate: "",
    rc_number: "",
    current_driver_id: ""
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vData, dData] = await Promise.all([
        api.get("/vehicles"),
        api.get("/drivers")
      ]);
      setVehicles(vData);
      setDrivers(dData.filter((d: any) => d.status === "available"));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validations
    if (!form.registration_number.trim()) {
      setError("Registration number is required");
      return;
    }
    const capacityVal = parseFloat(form.capacity);
    if (isNaN(capacityVal) || capacityVal <= 0) {
      setError("Cargo capacity must be a positive number");
      return;
    }
    
    try {
      await api.post("/vehicles", {
        ...form,
        capacity: capacityVal,
        odometer: parseFloat(form.odometer) || 0.0,
        current_driver_id: form.current_driver_id || null
      });
      setIsModalOpen(false);
      setForm({
        registration_number: "",
        name: "",
        model: "",
        capacity: "",
        fuel_type: "Diesel",
        odometer: "0",
        insurance_number: "",
        fitness_certificate: "",
        rc_number: "",
        current_driver_id: ""
      });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle from the registry?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        loadData();
      } catch (err: any) {
        alert(err.message || "Failed to delete vehicle");
      }
    }
  };

  // Filter vehicles list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === "" || v.status === statusFilter;
    const matchesFuel = fuelFilter === "" || v.fuel_type === fuelFilter;
    const matchesSearch = searchQuery === "" || 
      v.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesFuel && matchesSearch;
  });

  return (
    <div className="space-y-lg">
      {/* Top controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-surface-variant pb-md">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-sm">
          <input
            type="text"
            placeholder="Search registration, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-body-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-body-md cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-body-md cursor-pointer"
          >
            <option value="">All Fuel Types</option>
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="CNG">CNG</option>
            <option value="EV">EV</option>
          </select>
        </div>

        {/* Add trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-semibold px-lg py-2 rounded hover:bg-primary-container transition-colors flex items-center gap-sm cursor-pointer shadow-md self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicles Table */}
      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Loading registry database...</span>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-surface-variant text-on-surface-variant font-label-md text-label-md">
                <th className="p-md">Vehicle</th>
                <th className="p-md">Registration</th>
                <th className="p-md">Odometer</th>
                <th className="p-md">Capacity</th>
                <th className="p-md">Status</th>
                <th className="p-md">Health</th>
                <th className="p-md">Driver</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant font-body-md">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-low transition-colors">
                  {/* Vehicle details */}
                  <td className="p-md">
                    <div>
                      <h4 className="font-semibold text-on-background">{v.name}</h4>
                      <p className="text-on-surface-variant text-[12px]">{v.model} • {v.fuel_type}</p>
                    </div>
                  </td>
                  {/* Reg No */}
                  <td className="p-md font-semibold text-primary">{v.registration_number}</td>
                  {/* Odometer */}
                  <td className="p-md">{v.odometer?.toLocaleString()} km</td>
                  {/* Capacity */}
                  <td className="p-md">{v.capacity} Tons</td>
                  {/* Status */}
                  <td className="p-md">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        v.status === "available"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : v.status === "on_trip"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : v.status === "in_shop"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      {v.status.replace("_", " ")}
                    </span>
                  </td>
                  {/* Health Score */}
                  <td className="p-md">
                    <div className="flex items-center gap-sm">
                      <span className="font-bold">{v.health_score}%</span>
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.health_score > 85 ? "bg-emerald-500" : v.health_score > 70 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${v.health_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  {/* Current Driver */}
                  <td className="p-md text-on-surface-variant text-sm">
                    {v.current_driver?.full_name || "Unassigned"}
                  </td>
                  {/* Actions */}
                  <td className="p-md text-right space-x-sm">
                    <Link
                      to={`/fleet/${v.id}`}
                      className="px-3 py-1 bg-surface-container-high hover:bg-surface-variant rounded border border-surface-variant text-on-background font-label-md text-[12px] inline-block transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1 bg-error-container/10 hover:bg-error-container/20 rounded border border-error/20 text-error font-label-md text-[12px] transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-2xl text-center text-on-surface-variant font-body-md">
          No vehicles matching search filters were found.
        </div>
      )}

      {/* Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-lg glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Add Vehicle to Registry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-md font-body-md">
              <div className="flex flex-col gap-xs col-span-2">
                <label className="font-label-md text-label-md text-on-surface">Vehicle Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peterbilt 579"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX-987-AB"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.registration_number}
                  onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Model Year / Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 579 EV 2023"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Cargo Capacity (Tons)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 15.0"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Fuel Type</label>
                <select
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer"
                  value={form.fuel_type}
                  onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">EV</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Initial Odometer Reading (km)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.odometer}
                  onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Current Driver Assignment</label>
                <select
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer"
                  value={form.current_driver_id}
                  onChange={(e) => setForm({ ...form, current_driver_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.license_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs col-span-2 border-t border-surface-variant pt-md mt-xs">
                <h4 className="font-semibold text-[13px] text-on-background mb-sm">Verification Certificates</h4>
                <div className="grid grid-cols-3 gap-sm">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[11px] text-on-surface-variant">Insurance #</label>
                    <input
                      type="text"
                      required
                      placeholder="INS-99..."
                      className="bg-surface-container-low border border-surface-variant rounded py-1 px-2 text-sm text-on-background focus:outline-none focus:border-primary"
                      value={form.insurance_number}
                      onChange={(e) => setForm({ ...form, insurance_number: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[11px] text-on-surface-variant">Fitness #</label>
                    <input
                      type="text"
                      required
                      placeholder="FIT-88..."
                      className="bg-surface-container-low border border-surface-variant rounded py-1 px-2 text-sm text-on-background focus:outline-none focus:border-primary"
                      value={form.fitness_certificate}
                      onChange={(e) => setForm({ ...form, fitness_certificate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[11px] text-on-surface-variant">RC Book #</label>
                    <input
                      type="text"
                      required
                      placeholder="RC-77..."
                      className="bg-surface-container-low border border-surface-variant rounded py-1 px-2 text-sm text-on-background focus:outline-none focus:border-primary"
                      value={form.rc_number}
                      onChange={(e) => setForm({ ...form, rc_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded cursor-pointer transition-colors"
                >
                  Create Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
