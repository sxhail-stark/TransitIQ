import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Doc modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    doc_type: "insurance",
    doc_name: "",
    expiry_date: "",
    file_path: "/uploads/docs/mock_doc.pdf"
  });
  const [docError, setDocError] = useState<string | null>(null);

  const loadVehicleData = async () => {
    setIsLoading(true);
    try {
      const vData = await api.get(`/vehicles/${id}`);
      setVehicle(vData);
      
      const allMaint = await api.get("/maintenance");
      setMaintenance(allMaint.filter((m: any) => m.vehicle_id === id));
      
      const allExp = await api.get("/financials/expenses");
      setExpenses(allExp.filter((e: any) => e.vehicle_id === id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleData();
  }, [id]);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);
    if (!docForm.doc_name.trim() || !docForm.expiry_date) {
      setDocError("All document metadata fields are required");
      return;
    }

    try {
      await api.post(`/vehicles/${id}/documents`, {
        ...docForm,
        expiry_date: new Date(docForm.expiry_date).toISOString()
      });
      setIsDocModalOpen(false);
      setDocForm({
        doc_type: "insurance",
        doc_name: "",
        expiry_date: "",
        file_path: "/uploads/docs/mock_doc.pdf"
      });
      loadVehicleData();
    } catch (err: any) {
      setDocError(err.message || "Failed to add document");
    }
  };

  if (isLoading) {
    return (
      <div className="py-2xl text-center flex flex-col items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
        <span className="text-on-surface-variant font-body-md">Synchronizing vehicle telemetry...</span>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="py-2xl text-center text-error font-body-md">
        Telemetry lost. Vehicle details not found in active registries.
      </div>
    );
  }

  return (
    <div className="space-y-lg font-sans">
      {/* 1. Header info banner */}
      <div className="bg-surface-container border border-surface-variant rounded-xl p-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <div className="flex items-center gap-sm">
            <span className="inline-block px-3 py-1 bg-surface-container-high rounded text-primary font-bold text-sm tracking-wider uppercase border border-surface-variant">
              {vehicle.registration_number}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                vehicle.status === "available"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : vehicle.status === "on_trip"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : vehicle.status === "in_shop"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {vehicle.status.replace("_", " ")}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-md text-on-background mt-sm">{vehicle.name}</h2>
          <p className="font-body-md text-on-surface-variant mt-xs">
            Model: {vehicle.model} • Engine Type: {vehicle.fuel_type} • Odometer: {vehicle.odometer?.toLocaleString()} km
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-sm self-stretch md:self-auto">
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="flex-1 px-lg py-2 bg-surface-container-high hover:bg-surface-variant text-on-background rounded border border-surface-variant font-semibold text-body-md cursor-pointer transition-colors flex justify-center items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            <span>Upload Document</span>
          </button>
          <Link
            to="/trips"
            className="flex-1 px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded text-body-md text-center transition-colors flex justify-center items-center gap-sm shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">route</span>
            <span>Dispatch Trip</span>
          </Link>
        </div>
      </div>

      {/* 2. Secondary Telemetry grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Health Stats */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-md">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Health Rating</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">{vehicle.health_score}%</h2>
          </div>
          <span className={`material-symbols-outlined text-[42px] ${vehicle.health_score > 80 ? "text-emerald-400" : "text-amber-400"}`}>
            settings_suggest
          </span>
        </div>

        {/* Safety Score */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-md">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Safety Index</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">{vehicle.safety_score} / 100</h2>
          </div>
          <span className="material-symbols-outlined text-[42px] text-primary">shield</span>
        </div>

        {/* Cargo Limit */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md flex items-center justify-between shadow-md">
          <div>
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Cargo Limit</span>
            <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">{vehicle.capacity} Tons</h2>
          </div>
          <span className="material-symbols-outlined text-[42px] text-secondary">inventory_2</span>
        </div>
      </div>

      {/* 3. Detailed panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left column: Documents Registry & Info */}
        <div className="space-y-lg lg:col-span-1">
          {/* Docs Panel */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
            <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md flex justify-between items-center">
              <span>Security Documents</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">verified</span>
            </h3>
            
            <div className="space-y-md">
              {/* RC Card */}
              <div className="p-sm rounded bg-surface-container-low border border-surface-variant flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-on-background">Registration Certificate (RC)</span>
                  <span className="font-label-md text-emerald-400 text-xs uppercase font-bold">Verified</span>
                </div>
                <p className="font-label-md text-[12px] text-on-surface-variant">License #: {vehicle.rc_number}</p>
              </div>

              {/* Insurance Card */}
              <div className="p-sm rounded bg-surface-container-low border border-surface-variant flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-on-background">Commercial Insurance</span>
                  <span className="font-label-md text-emerald-400 text-xs uppercase font-bold">Active</span>
                </div>
                <p className="font-label-md text-[12px] text-on-surface-variant">Policy #: {vehicle.insurance_number}</p>
              </div>

              {/* Fitness Certificate Card */}
              <div className="p-sm rounded bg-surface-container-low border border-surface-variant flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-on-background">Fitness Expiry</span>
                  <span className="font-label-md text-emerald-400 text-xs uppercase font-bold">Valid</span>
                </div>
                <p className="font-label-md text-[12px] text-on-surface-variant">Cert #: {vehicle.fitness_certificate}</p>
              </div>

              {/* Uploaded Documents List */}
              {vehicle.documents && vehicle.documents.length > 0 && (
                <div className="border-t border-surface-variant pt-md mt-md">
                  <h4 className="font-semibold text-[13px] text-on-background mb-sm">Uploaded PDFs</h4>
                  <div className="space-y-sm">
                    {vehicle.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-xs bg-surface-container-high rounded border border-surface-variant">
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-primary text-[18px]">picture_as_pdf</span>
                          <span className="text-[12px] text-on-background truncate max-w-[120px]">{doc.doc_name}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant">
                          Exp: {new Date(doc.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Driver Details */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
            <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md">
              Assigned Crew
            </h3>
            {vehicle.current_driver ? (
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-surface-variant border border-primary-container/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                  {vehicle.current_driver.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-background">{vehicle.current_driver.full_name}</h4>
                  <p className="text-[12px] text-on-surface-variant">Phone: {vehicle.current_driver.phone}</p>
                  <Link to={`/drivers/${vehicle.current_driver_id}`} className="text-primary text-[12px] hover:underline mt-xs block">
                    View Driver Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-sm text-center text-on-surface-variant text-body-md">
                No active driver assignment.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Maintenance history timeline & expenses */}
        <div className="space-y-lg lg:col-span-2">
          {/* Maintenance Records */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
            <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md">
              Maintenance History
            </h3>
            
            <div className="space-y-md">
              {maintenance.length > 0 ? (
                maintenance.map((m) => (
                  <div key={m.id} className="p-md rounded bg-surface-container-low border border-surface-variant/60 flex flex-col gap-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-on-background text-[15px]">{m.title}</h4>
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
                          Type: {m.maintenance_type} • Workshop: {m.workshop}
                        </span>
                      </div>
                      <span className="font-bold text-primary">${m.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <p className="text-sm text-on-surface-variant">{m.description}</p>
                    
                    <div className="flex justify-between items-center mt-xs border-t border-surface-variant/40 pt-sm">
                      <span className="text-[11px] text-on-surface-variant">
                        Scheduled: {new Date(m.scheduled_date).toLocaleDateString()}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          m.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : m.status === "in_progress"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-md text-center text-on-surface-variant text-body-md">
                  No maintenance records registered for this vehicle.
                </div>
              )}
            </div>
          </div>

          {/* Associated Expenses */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
            <h3 className="font-body-md font-semibold text-on-background border-b border-surface-variant pb-sm mb-md">
              Operations Expenses Log
            </h3>
            
            <div className="divide-y divide-surface-variant">
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <div key={e.id} className="py-md flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-on-background">{e.description}</h4>
                      <p className="text-[12px] text-on-surface-variant uppercase tracking-wider">{e.category} • {new Date(e.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-error">-${e.amount?.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="py-md text-center text-on-surface-variant text-body-md">
                  No recorded expenses for this vehicle.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-md glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Upload Document Metadata</h3>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {docError && (
              <div className="p-md rounded bg-error-container/20 border border-error text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{docError}</span>
              </div>
            )}

            <form onSubmit={handleAddDoc} className="flex flex-col gap-md font-body-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Pollution Certificate"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={docForm.doc_name}
                  onChange={(e) => setDocForm({ ...docForm, doc_name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Document Type</label>
                <select
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer"
                  value={docForm.doc_type}
                  onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                >
                  <option value="insurance">Insurance Policy</option>
                  <option value="fitness">Fitness Certificate</option>
                  <option value="rc">Registration Certificate (RC)</option>
                  <option value="permit">National Permit</option>
                  <option value="others">Other Documents</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={docForm.expiry_date}
                  onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded cursor-pointer transition-colors"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
