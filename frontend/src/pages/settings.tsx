import React, { useState } from "react";

export const Settings: React.FC = () => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [thresholds, setThresholds] = useState({
    license_renewal_days: "30",
    maintenance_due_days: "7",
    fuel_anomaly_percent: "20"
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPassError("New password verification must match.");
      return;
    }
    
    // Simulate API update
    setPassSuccess("System credentials updated successfully.");
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });
  };

  const handleThresholdSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Alert thresholds configurations saved.");
  };

  return (
    <div className="bg-surface-container border border-surface-variant rounded-xl p-lg shadow-md font-sans space-y-lg max-w-4xl mx-auto">
      <div className="border-b border-surface-variant pb-md">
        <h3 className="font-headline-md text-title-md text-on-background">System Settings</h3>
        <p className="text-sm text-on-surface-variant mt-xs">
          Manage workspace settings, alert configurations, and operator credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl font-body-md">
        {/* Left: Security Credentials */}
        <form onSubmit={handlePasswordSubmit} className="space-y-md border-r border-surface-variant/40 pr-lg">
          <h4 className="font-semibold text-on-background text-[15px] border-b border-surface-variant/40 pb-xs mb-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
            <span>Update Password</span>
          </h4>

          {passError && (
            <div className="p-sm rounded bg-error-container/20 border border-error text-error text-xs">
              {passError}
            </div>
          )}
          {passSuccess && (
            <div className="p-sm rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {passSuccess}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">Current Password</label>
            <input
              type="password"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">New Password</label>
            <input
              type="password"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">Confirm Password</label>
            <input
              type="password"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-surface-container-high hover:bg-surface-variant text-primary border border-surface-variant rounded font-semibold text-sm transition-colors cursor-pointer"
          >
            Update Credentials
          </button>
        </form>

        {/* Right: Operational Alert thresholds */}
        <form onSubmit={handleThresholdSave} className="space-y-md">
          <h4 className="font-semibold text-on-background text-[15px] border-b border-surface-variant/40 pb-xs mb-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">notifications_active</span>
            <span>Alert Thresholds</span>
          </h4>

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">License Expiry Warning Threshold (Days)</label>
            <input
              type="number"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={thresholds.license_renewal_days}
              onChange={(e) => setThresholds({ ...thresholds, license_renewal_days: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">Maintenance Due Warning Threshold (Days)</label>
            <input
              type="number"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={thresholds.maintenance_due_days}
              onChange={(e) => setThresholds({ ...thresholds, maintenance_due_days: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-xs text-on-surface-variant">Fuel Usage Anomaly Detection (%)</label>
            <input
              type="number"
              required
              className="bg-surface-container-low border border-surface-variant rounded py-1.5 px-3 text-on-background focus:outline-none focus:border-primary text-sm"
              value={thresholds.fuel_anomaly_percent}
              onChange={(e) => setThresholds({ ...thresholds, fuel_anomaly_percent: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary-container text-black font-semibold rounded text-sm transition-colors cursor-pointer shadow"
          >
            Save Configurations
          </button>
        </form>
      </div>

      {/* Global Interface Preference */}
      <div className="border-t border-surface-variant/40 pt-lg mt-lg space-y-md">
        <h4 className="font-semibold text-on-background text-[15px] flex items-center gap-sm">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">palette</span>
          <span>Workspace Preferences</span>
        </h4>
        <div className="flex items-center justify-between p-md rounded bg-surface-container-low border border-surface-variant">
          <div>
            <h5 className="font-semibold text-on-background text-sm">Aesthetics Dark-Mode</h5>
            <p className="text-xs text-on-surface-variant mt-xs">TransitIQ workspace layout lock to dark theme variables.</p>
          </div>
          <span className="px-lg py-1 bg-surface-container-high rounded text-primary text-xs uppercase font-bold border border-surface-variant select-none">
            Locked Dark
          </span>
        </div>
      </div>
    </div>
  );
};
