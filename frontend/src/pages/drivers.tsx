import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    license_number: "",
    license_expiry: "",
    phone: "",
    experience_years: "",
    photo_url: "/uploads/drivers/avatar.png"
  });
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get("/drivers");
      setDrivers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim() || !form.license_number.trim() || !form.license_expiry) {
      setError("Name, license, and expiry are required fields");
      return;
    }

    const expYears = parseInt(form.experience_years);
    if (isNaN(expYears) || expYears < 0) {
      setError("Experience years must be a non-negative number");
      return;
    }

    try {
      await api.post("/drivers", {
        ...form,
        experience_years: expYears,
        license_expiry: new Date(form.license_expiry).toISOString()
      });
      setIsModalOpen(false);
      setForm({
        full_name: "",
        license_number: "",
        license_expiry: "",
        phone: "",
        experience_years: "",
        photo_url: "/uploads/drivers/avatar.png"
      });
      loadDrivers();
    } catch (err: any) {
      setError(err.message || "Failed to add driver");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this driver from active rosters?")) {
      try {
        await api.delete(`/drivers/${id}`);
        loadDrivers();
      } catch (err: any) {
        alert(err.message || "Failed to remove driver");
      }
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesStatus = statusFilter === "" || d.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-lg font-sans">
      {/* Search and Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-surface-variant pb-md">
        <div className="flex flex-wrap items-center gap-sm">
          <input
            type="text"
            placeholder="Search driver name, license..."
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
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-semibold px-lg py-2 rounded hover:bg-primary-container transition-colors flex items-center gap-sm cursor-pointer shadow-md self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add Driver</span>
        </button>
      </div>

      {/* Grid of Driver Cards */}
      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Synchronizing staff registry...</span>
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredDrivers.map((d) => {
            const licenseExpired = new Date(d.license_expiry) < new Date();
            
            return (
              <div
                key={d.id}
                className="bg-surface-container border border-surface-variant rounded-xl p-md flex flex-col justify-between gap-md shadow-md relative overflow-hidden"
              >
                {/* Score badge in top corner */}
                <div className="absolute top-md right-md flex flex-col items-end">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded border ${
                    d.safety_score > 90 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : d.safety_score > 75 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {d.safety_score} pts
                  </span>
                  <span className="text-[9px] text-on-surface-variant mt-xs uppercase font-semibold">Safety Score</span>
                </div>

                <div className="flex gap-md items-start">
                  {/* Photo avatar */}
                  <div className="w-12 h-12 rounded-full bg-surface-variant border border-primary-container/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                    {d.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-background text-[16px]">{d.full_name}</h3>
                    <p className="text-[12px] text-on-surface-variant">{d.phone}</p>
                    <p className="text-[12px] text-on-surface-variant">Exp: {d.experience_years} years</p>
                  </div>
                </div>

                {/* License and Status info */}
                <div className="border-t border-surface-variant/40 pt-md mt-xs space-y-xs">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">License:</span>
                    <span className="font-semibold text-on-background">{d.license_number}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">License Expiry:</span>
                    <span className={`font-semibold ${licenseExpired ? "text-error" : "text-on-background"}`}>
                      {new Date(d.license_expiry).toLocaleDateString()} {licenseExpired && "(Expired)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Status:</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                      d.status === "available"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : d.status === "on_trip"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm border-t border-surface-variant pt-md mt-sm">
                  <Link
                    to={`/drivers/${d.id}`}
                    className="flex-1 text-center py-1.5 bg-surface-container-high hover:bg-surface-variant border border-surface-variant rounded text-on-background font-label-md text-[12px] transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1.5 bg-error-container/10 hover:bg-error-container/20 rounded border border-error/20 text-error font-label-md text-[12px] transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2xl text-center text-on-surface-variant font-body-md">
          No drivers matching filters were found.
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-md glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Add Driver to Fleet</h3>
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
                <label className="font-label-md text-label-md text-on-surface">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-92847194"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">License Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.license_expiry}
                  onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Experience Years</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
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
                  Add New Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
