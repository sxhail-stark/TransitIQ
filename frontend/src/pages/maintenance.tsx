import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const Maintenance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicle_id: "",
    title: "",
    description: "",
    maintenance_type: "routine",
    cost: "0",
    scheduled_date: "",
    workshop: ""
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mData, vData] = await Promise.all([
        api.get("/maintenance"),
        api.get("/vehicles")
      ]);
      setRecords(mData);
      setVehicles(vData.filter((v: any) => v.status !== "retired"));
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

    const costVal = parseFloat(form.cost);
    if (!form.vehicle_id || !form.title.trim() || !form.scheduled_date || !form.workshop.trim()) {
      setError("All fields are required");
      return;
    }
    if (isNaN(costVal) || costVal < 0) {
      setError("Cost must be a positive number");
      return;
    }

    try {
      await api.post("/maintenance", {
        ...form,
        cost: costVal,
        scheduled_date: new Date(form.scheduled_date).toISOString()
      });
      setIsModalOpen(false);
      setForm({
        vehicle_id: "",
        title: "",
        description: "",
        maintenance_type: "routine",
        cost: "0",
        scheduled_date: "",
        workshop: ""
      });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to schedule maintenance");
    }
  };

  const handleTransition = async (recordId: string, nextStatus: string) => {
    try {
      await api.put(`/maintenance/${recordId}/status`, { status: nextStatus });
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to update maintenance status");
    }
  };

  // Group columns
  const getColRecords = (status: string) => {
    return records.filter((r) => r.status === status);
  };

  const cols = [
    { title: "Scheduled Checks", status: "scheduled", color: "border-sky-500/20 bg-sky-500/5 text-sky-400" },
    { title: "Active In Shop", status: "in_progress", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
    { title: "Completed Checks", status: "completed", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" }
  ];

  return (
    <div className="space-y-lg font-sans">
      {/* Top Controls Banner */}
      <div className="flex justify-between items-center border-b border-surface-variant pb-md">
        <h3 className="font-body-md text-on-surface-variant">Maintenance Logs & Kanban Boards</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-semibold px-lg py-2 rounded hover:bg-primary-container transition-colors flex items-center gap-sm cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">build</span>
          <span>Schedule Service</span>
        </button>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Synchronizing workshop rosters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
          {cols.map((col) => {
            const colRecords = getColRecords(col.status);
            
            return (
              <div key={col.status} className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col gap-md shadow-md min-h-[500px]">
                <div className={`p-sm rounded border ${col.color} flex justify-between items-center`}>
                  <h4 className="font-semibold text-sm uppercase tracking-wider">{col.title}</h4>
                  <span className="font-bold text-sm bg-surface-dim px-2 py-0.5 rounded border border-surface-variant">{colRecords.length}</span>
                </div>

                <div className="flex flex-col gap-sm overflow-y-auto max-h-[600px] pr-xs">
                  {colRecords.length > 0 ? (
                    colRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-md rounded bg-surface-container-low border border-surface-variant hover:border-on-surface-variant/40 transition-colors flex flex-col gap-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-on-background text-[14px]">{r.title}</h5>
                            <span className="font-semibold text-[12px] text-primary block mt-xs">
                              {r.vehicle?.registration_number} - {r.vehicle?.name}
                            </span>
                          </div>
                          <span className="font-bold text-sm text-primary-container">${r.cost?.toFixed(0)}</span>
                        </div>

                        <p className="text-[12px] text-on-surface-variant line-clamp-3">{r.description}</p>

                        <div className="border-t border-surface-variant/40 pt-sm mt-xs flex flex-col gap-xs text-[11px] text-on-surface-variant">
                          <span>Date: {new Date(r.scheduled_date).toLocaleDateString()}</span>
                          <span>Workshop: {r.workshop}</span>
                        </div>

                        {/* Transitions buttons */}
                        <div className="flex justify-end gap-sm border-t border-surface-variant/40 pt-sm mt-xs">
                          {col.status === "scheduled" && (
                            <button
                              onClick={() => handleTransition(r.id, "in_progress")}
                              className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Check In Shop
                            </button>
                          )}
                          {col.status === "in_progress" && (
                            <button
                              onClick={() => handleTransition(r.id, "completed")}
                              className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Mark Complete
                            </button>
                          )}
                          {col.status === "completed" && (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[14px]">done</span>
                              <span>Done & Available</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-2xl text-center text-on-surface-variant font-label-md text-[12px] border border-dashed border-surface-variant rounded-lg">
                      No service records in this column.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-md glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Schedule Vehicle Maintenance</h3>
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

            <form onSubmit={handleCreate} className="flex flex-col gap-md font-body-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Vehicle</label>
                <select
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Oil Service"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Description / Details</label>
                <textarea
                  placeholder="Describe service details..."
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary h-20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Type</label>
                  <select
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer"
                    value={form.maintenance_type}
                    onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                  >
                    <option value="routine">Routine</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Est. Cost ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250"
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Scheduled Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Service Center / Workshop</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volvo Truck Care"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.workshop}
                  onChange={(e) => setForm({ ...form, workshop: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
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
                  Schedule Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
