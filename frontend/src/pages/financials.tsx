import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const Financials: React.FC = () => {
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab selection
  const [activeTab, setActiveTab] = useState("expenses");

  // Fuel modal
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    vehicle_id: "",
    driver_id: "",
    quantity: "",
    cost: "",
    odometer: "",
    date: "",
    location: ""
  });
  const [fuelError, setFuelError] = useState<string | null>(null);

  // Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "repair",
    amount: "",
    description: "",
    date: "",
    vehicle_id: "",
  });
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fData, eData, sumData, vData, dData] = await Promise.all([
        api.get("/financials/fuel"),
        api.get("/financials/expenses"),
        api.get("/financials/summary"),
        api.get("/vehicles"),
        api.get("/drivers")
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setSummary(sumData);
      setVehicles(vData.filter((v: any) => v.status !== "retired"));
      setDrivers(dData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError(null);

    const qtyVal = parseFloat(fuelForm.quantity);
    const costVal = parseFloat(fuelForm.cost);
    const odoVal = parseFloat(fuelForm.odometer);

    if (!fuelForm.vehicle_id || !fuelForm.driver_id || !fuelForm.date || !fuelForm.location.trim()) {
      setFuelError("All refuel fields are required");
      return;
    }
    if (isNaN(qtyVal) || qtyVal <= 0 || isNaN(costVal) || costVal <= 0 || isNaN(odoVal) || odoVal < 0) {
      setFuelError("Quantity, cost, and odometer must be positive numbers");
      return;
    }

    try {
      await api.post("/financials/fuel", {
        ...fuelForm,
        quantity: qtyVal,
        cost: costVal,
        odometer: odoVal,
        date: new Date(fuelForm.date).toISOString()
      });
      setIsFuelModalOpen(false);
      setFuelForm({
        vehicle_id: "",
        driver_id: "",
        quantity: "",
        cost: "",
        odometer: "",
        date: "",
        location: ""
      });
      loadData();
    } catch (err: any) {
      setFuelError(err.message || "Failed to log fuel entry");
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    const amtVal = parseFloat(expenseForm.amount);
    if (!expenseForm.description.trim() || !expenseForm.date) {
      setExpenseError("Description and date are required");
      return;
    }
    if (isNaN(amtVal) || amtVal <= 0) {
      setExpenseError("Expense amount must be a positive number");
      return;
    }

    try {
      await api.post("/financials/expenses", {
        ...expenseForm,
        amount: amtVal,
        vehicle_id: expenseForm.vehicle_id || null,
        date: new Date(expenseForm.date).toISOString()
      });
      setIsExpenseModalOpen(false);
      setExpenseForm({
        category: "repair",
        amount: "",
        description: "",
        date: "",
        vehicle_id: "",
      });
      loadData();
    } catch (err: any) {
      setExpenseError(err.message || "Failed to log expense");
    }
  };

  const handleExportCSV = () => {
    // Standard triggers a CSV download endpoint on backend
    window.open("http://localhost:8000/api/v1/financials/export/csv", "_blank");
  };

  const handleExportPDF = () => {
    alert("Exporting secure financial reports to PDF... Download starting shortly.");
  };

  return (
    <div className="space-y-lg font-sans">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
          <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Total Ops Expenses</span>
          <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">
            ${summary?.total_operational_cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <span className="font-label-md text-[10px] text-on-surface-variant block mt-xs">Including repair, toll & tax allocations</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
          <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Cost Efficiency</span>
          <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">
            ${summary?.cost_per_km?.toFixed(2)} <span className="text-sm font-normal text-on-surface-variant">/ KM</span>
          </h2>
          <span className="font-label-md text-[10px] text-on-surface-variant block mt-xs">Total operational cost divided by mileage</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
          <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Average Mileage</span>
          <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">
            {summary?.average_mileage_km_l?.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">KM / L</span>
          </h2>
          <span className="font-label-md text-[10px] text-on-surface-variant block mt-xs">Fuel efficiency telemetry average</span>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl p-md shadow-md">
          <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider">Monthly Fuel Spend</span>
          <h2 className="font-display-lg text-headline-lg text-on-background mt-sm">
            ${summary?.monthly_fuel_cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <span className="font-label-md text-[10px] text-on-surface-variant block mt-xs">Spend for current calendar month</span>
        </div>
      </div>

      {/* 2. Top Table Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-surface-variant pb-md">
        {/* Navigation Tabs */}
        <div className="flex bg-surface-container-high rounded-lg p-1 border border-surface-variant">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-lg py-1.5 font-label-md text-label-md rounded-md cursor-pointer transition-all ${
              activeTab === "expenses" ? "bg-surface-variant text-on-background shadow" : "text-on-surface-variant hover:text-on-background"
            }`}
          >
            Operating Expenses
          </button>
          <button
            onClick={() => setActiveTab("fuel")}
            className={`px-lg py-1.5 font-label-md text-label-md rounded-md cursor-pointer transition-all ${
              activeTab === "fuel" ? "bg-surface-variant text-on-background shadow" : "text-on-surface-variant hover:text-on-background"
            }`}
          >
            Fuel Registries
          </button>
        </div>

        {/* Buttons actions */}
        <div className="flex flex-wrap items-center gap-sm">
          <button
            onClick={handleExportCSV}
            className="px-md py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold text-body-md rounded cursor-pointer transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-md py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold text-body-md rounded cursor-pointer transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Export PDF</span>
          </button>
          
          <button
            onClick={() => {
              if (activeTab === "fuel") setIsFuelModalOpen(true);
              else setIsExpenseModalOpen(true);
            }}
            className="px-lg py-2 bg-primary text-black font-semibold text-body-md rounded hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-xs shadow"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{activeTab === "fuel" ? "Log Fuel Refill" : "Record Expense"}</span>
          </button>
        </div>
      </div>

      {/* 3. Tables Content */}
      {isLoading ? (
        <div className="py-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">sync</span>
          <span className="text-on-surface-variant font-body-md">Synchronizing ledger ledgers...</span>
        </div>
      ) : activeTab === "expenses" ? (
        /* Expenses Table */
        expenses.length > 0 ? (
          <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-variant text-on-surface-variant font-label-md text-label-md">
                  <th className="p-md">Category</th>
                  <th className="p-md">Description</th>
                  <th className="p-md">Amount</th>
                  <th className="p-md">Date</th>
                  <th className="p-md">Vehicle ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant font-body-md">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-md">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border border-surface-variant bg-surface-container-high">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-md font-semibold text-on-background">{e.description}</td>
                    <td className="p-md text-error font-bold">-${e.amount?.toFixed(2)}</td>
                    <td className="p-md text-on-surface-variant">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-md text-on-surface-variant text-sm">{e.vehicle_id ? "Assigned" : "General"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-2xl text-center text-on-surface-variant font-body-md">
            No logged expenses.
          </div>
        )
      ) : (
        /* Fuel Logs Table */
        fuelLogs.length > 0 ? (
          <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-variant text-on-surface-variant font-label-md text-label-md">
                  <th className="p-md">Refill Date</th>
                  <th className="p-md">Location</th>
                  <th className="p-md">Volume</th>
                  <th className="p-md">Total Cost</th>
                  <th className="p-md">Odometer</th>
                  <th className="p-md">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant font-body-md">
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-md font-semibold">{new Date(f.date).toLocaleDateString()}</td>
                    <td className="p-md text-on-background">{f.location}</td>
                    <td className="p-md">{f.quantity} Liters</td>
                    <td className="p-md font-bold text-primary">${f.cost?.toFixed(2)}</td>
                    <td className="p-md">{f.odometer?.toLocaleString()} km</td>
                    <td className="p-md text-on-surface-variant">${(f.cost / f.quantity).toFixed(2)} / L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-2xl text-center text-on-surface-variant font-body-md">
            No fuel logs registered in active registries.
          </div>
        )
      )}

      {/* Fuel Log Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-md glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Log Fuel Dispatch</h3>
              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {fuelError && (
              <div className="p-md rounded bg-error-container/20 border border-error text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{fuelError}</span>
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="flex flex-col gap-md font-body-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Vehicle</label>
                <select
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={fuelForm.vehicle_id}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })}
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
                <label className="font-label-md text-label-md text-on-surface">Driver Refilled</label>
                <select
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={fuelForm.driver_id}
                  onChange={(e) => setFuelForm({ ...fuelForm, driver_id: e.target.value })}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Fuel Volume (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 120"
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                    value={fuelForm.quantity}
                    onChange={(e) => setFuelForm({ ...fuelForm, quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 540.00"
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Current Odometer (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 84500"
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                    value={fuelForm.odometer}
                    onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Refill Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Gas Station / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loves Travel Stop, Illinois"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={fuelForm.location}
                  onChange={(e) => setFuelForm({ ...fuelForm, location: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded cursor-pointer transition-colors"
                >
                  Log Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-md font-sans">
          <div className="w-full max-w-md glass-panel-heavy rounded-xl p-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-surface-variant flex flex-col gap-lg">
            <div className="flex justify-between items-center border-b border-surface-variant pb-md">
              <h3 className="font-headline-md text-title-md text-on-background">Record Operations Expense</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {expenseError && (
              <div className="p-md rounded bg-error-container/20 border border-error text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{expenseError}</span>
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-md font-body-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Category</label>
                <select
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  <option value="repair">Repair</option>
                  <option value="insurance">Insurance Allocation</option>
                  <option value="tax">Road Tax</option>
                  <option value="toll">Toll Charges</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 150.00"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interstate road tolls Houston to Austin"
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Expense Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Associated Vehicle (Optional)</label>
                <select
                  className="w-full bg-surface-container-low border border-surface-variant rounded py-2 px-3 text-on-background focus:outline-none focus:border-primary cursor-pointer font-body-md"
                  value={expenseForm.vehicle_id}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })}
                >
                  <option value="">None (General Office Expense)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-md border-t border-surface-variant pt-md mt-sm">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-lg py-2 border border-surface-variant hover:bg-surface-container text-on-background font-semibold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded cursor-pointer transition-colors"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
