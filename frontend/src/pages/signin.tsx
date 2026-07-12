import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Fleet Manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, selectedRole);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst", "Driver"];

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden relative z-10 bg-background font-sans">
      {/* Left Side: Brand Area (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-2xl relative bg-surface-dim overflow-hidden border-r border-surface-variant">
        {/* Abstract Grid Background for Brand Side */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #333539 1px, transparent 1px), linear-gradient(to bottom, #333539 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-glow"></div>
        
        {/* Header / Logo */}
        <div className="z-10 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[32px]">route</span>
          <h1 className="font-headline-lg text-headline-lg text-on-background">TransitIQ</h1>
        </div>

        {/* Central Illustration/Messaging */}
        <div className="z-10 flex flex-col gap-xl max-w-lg">
          <div className="w-full h-64 rounded-xl overflow-hidden relative border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div
              className="bg-cover bg-center w-full h-full"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLZg_TLg01KXO4iKHgQZfo7AxLQlqpiMacgaoxNBqip71A94IONgty4ETUzyFo4O9btH7oDPLdqSfmzSUwexa18mmp7we_xoDTy2H3MO_tO0oH7qKHIEVoC5oglFb_MGxBSvZviaUDXY_27AgNkBVPBhUPhEdZMzCXU-7vRmjsgAl5AKeCdr2iflZKv-VTKWQhOsK96AsqgJQTUynpd7hhRb8OwzM79TPXkmaXvdC932eu5MqMgG7yBk1eUsM9aht_OWnl7qnBIZU')",
              }}
            ></div>
          </div>
          <div>
            <h2 className="font-display-lg text-display-lg text-on-background mb-md">Manage your fleet intelligently.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Real-time situational awareness and precision analytics for high-stakes transport logistics. Secure access to your mission control.
            </p>
          </div>
        </div>

        {/* Footer area for branding */}
        <div className="z-10 flex items-center gap-md font-label-md text-label-md text-on-surface-variant">
          <span>© 2026 TransitIQ Logistics</span>
          <span className="w-1 h-1 bg-surface-variant rounded-full"></span>
          <a className="hover:text-primary transition-colors" href="#">Privacy</a>
          <span className="w-1 h-1 bg-surface-variant rounded-full"></span>
          <a className="hover:text-primary transition-colors" href="#">Terms</a>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-lg md:p-2xl relative bg-background">
        {/* Mobile Logo (only visible on small screens) */}
        <div className="absolute top-lg left-lg md:hidden flex items-center gap-sm z-20">
          <span className="material-symbols-outlined text-primary text-[24px]">route</span>
          <span className="font-headline-md text-headline-md text-on-background">TransitIQ</span>
        </div>

        {/* Login Card (Glassmorphism) */}
        <div className="w-full max-w-md glass-panel rounded-xl p-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-10 flex flex-col gap-lg border border-surface-variant">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background">Welcome Back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
              Authenticate to access fleet controls.
            </p>
          </div>

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {/* Role Selector (Pill tabs) */}
            <div className="flex p-1 bg-surface-container-high rounded-lg mb-sm overflow-x-auto gap-xs scrollbar-none">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-shrink-0 px-3 py-2 text-center rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                    selectedRole === role
                      ? "bg-surface-variant text-on-background shadow-sm border border-surface-variant"
                      : "text-on-surface-variant hover:text-on-background border border-transparent"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-md rounded bg-error-container/20 border border-error text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 pl-10 pr-3 text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder-on-surface-variant/30"
                  id="email"
                  type="email"
                  required
                  placeholder="agent@transitiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <a className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 pl-10 pr-10 text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md"
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-sm mt-xs">
              <input
                className="w-4 h-4 rounded border-surface-variant bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-background"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary text-black font-semibold py-3 rounded-md hover:bg-primary-container transition-all mt-sm flex justify-center items-center gap-sm cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
              <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-md my-sm">
            <div className="h-px bg-surface-variant flex-1"></div>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Or continue with</span>
            <div className="h-px bg-surface-variant flex-1"></div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-md">
            <button
              onClick={() => {
                setEmail("manager@transitiq.com");
                setPassword("password123");
              }}
              type="button"
              className="flex justify-center items-center gap-sm py-2 px-4 rounded-md border border-surface-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-body-md text-body-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">badge</span>
              Auto Fill
            </button>
            <button
              type="button"
              className="flex justify-center items-center gap-sm py-2 px-4 rounded-md border border-surface-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-body-md text-body-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">vpn_key</span>
              Security Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
