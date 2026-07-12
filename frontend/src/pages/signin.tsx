import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auth Modes
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Fleet Manager");

  // Sign In inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");

  // States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password, selectedRole);
      setFailedAttempts(0);
      navigate("/");
    } catch (err: any) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      
      if (nextFailed >= 5) {
        setIsLocked(true);
        setError("Account locked due to 5 consecutive failed login attempts.");
      } else {
        setError(`${err.message || "Invalid credentials."} (Attempt ${nextFailed}/5)`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setError("All fields are required");
      return;
    }

    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match");
      return;
    }

    // Role check to prevent Driver sign up
    if (selectedRole === "Driver" || selectedRole === "Dispatcher") {
      setError("Drivers/Dispatchers cannot register accounts directly. Contact Fleet Safety.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        email: signUpEmail,
        password: signUpPassword,
        full_name: signUpName,
        role: selectedRole
      });
      setSuccess("Account registered! Please log in using your credentials.");
      setIsSignUp(false);
      setEmail(signUpEmail);
      setPassword("");
      // Clear inputs
      setSignUpName("");
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirm("");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginRoles = ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];
  const signUpRoles = ["Fleet Manager", "Safety Officer", "Financial Analyst"];

  const activeRolesList = isSignUp ? signUpRoles : loginRoles;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#111317] font-sans relative overflow-hidden p-md">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-glow"></div>
      
      {/* Centered Sleek Login Card */}
      <div className="w-full max-w-md glass-panel rounded-xl p-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-surface-variant z-10 flex flex-col gap-lg transition-all duration-300">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center gap-xs">
          <div className="flex items-center gap-xs text-primary">
            <span className="material-symbols-outlined text-[32px] animate-pulse">route</span>
            <span className="font-headline-lg text-headline-md tracking-wider text-on-background">TransitIQ</span>
          </div>
          <p className="text-body-md text-on-surface-variant">
            {isSignUp ? "Create your logistics coordinator account" : "AI-Powered Smart Transport Operations Platform"}
          </p>
        </div>

        {/* Roles Selector Tab */}
        <div className="flex flex-col gap-xs">
          <label className="text-xs text-on-surface-variant font-label-md text-center">
            {isSignUp ? "Select System Role to Register" : "Select Your Operational Role"}
          </label>
          <div className="flex p-1 bg-surface-container-high rounded-lg gap-xs overflow-x-auto scrollbar-none">
            {activeRolesList.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 min-w-[70px] py-1.5 text-center rounded-md font-label-md text-[11px] transition-all cursor-pointer truncate ${
                  selectedRole === role
                    ? "bg-surface-variant text-on-background shadow border border-surface-variant"
                    : "text-on-surface-variant hover:text-on-background border border-transparent"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Alert banners */}
        {error && (
          <div className="p-sm rounded bg-error-container/20 border border-error text-error text-xs flex items-center gap-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-sm rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Main Forms */}
        {!isSignUp ? (
          /* Sign In Form */
          <form className="flex flex-col gap-md" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">mail</span>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="agent@transitiq.com"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 pl-10 pr-3 text-on-background focus:outline-none focus:border-primary text-sm transition-colors disabled:opacity-50"
                  value={email}
                  disabled={isLocked || isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <span className="text-[10px] text-on-surface-variant">Max 5 wrong attempts</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 pl-10 pr-10 text-on-background focus:outline-none focus:border-primary text-sm transition-colors disabled:opacity-50"
                  value={password}
                  disabled={isLocked || isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked || isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-xs">
              <label className="flex items-center gap-sm cursor-pointer text-on-surface-variant select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLocked || isSubmitting}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 border-surface-variant rounded bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-background"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary-container transition-colors">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="w-full bg-primary hover:bg-primary-container text-black font-semibold py-2.5 rounded-md transition-colors mt-sm flex justify-center items-center gap-xs cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form className="flex flex-col gap-md" onSubmit={handleSignUp}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                required
                placeholder="e.g. Marcus Vance"
                className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-sm transition-colors"
                value={signUpName}
                disabled={isSubmitting}
                onChange={(e) => setSignUpName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                required
                placeholder="agent@transitiq.com"
                className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-sm transition-colors"
                value={signUpEmail}
                disabled={isSubmitting}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-pwd">Password</label>
                <input
                  type="password"
                  id="signup-pwd"
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-sm transition-colors"
                  value={signUpPassword}
                  disabled={isSubmitting}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-confirm">Confirm</label>
                <input
                  type="password"
                  id="signup-confirm"
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-surface-variant rounded-md py-2 px-3 text-on-background focus:outline-none focus:border-primary text-sm transition-colors"
                  value={signUpConfirm}
                  disabled={isSubmitting}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-container text-black font-semibold py-2.5 rounded-md transition-colors mt-sm flex justify-center items-center gap-xs cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span>{isSubmitting ? "Creating Account..." : "Sign Up"}</span>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-md my-xs">
          <div className="h-px bg-surface-variant/40 flex-1"></div>
          <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Authentication Control</span>
          <div className="h-px bg-surface-variant/40 flex-1"></div>
        </div>

        {/* Action button toggling Sign In / Sign Up & Auto Fill */}
        <div className="flex flex-col gap-sm">
          {!isSignUp ? (
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                onClick={() => {
                  let defaultEmail = "manager@transitiq.com";
                  if (selectedRole === "Driver") defaultEmail = "driver1@transitiq.com";
                  if (selectedRole === "Safety Officer") defaultEmail = "safety@transitiq.com";
                  if (selectedRole === "Financial Analyst") defaultEmail = "finance@transitiq.com";

                  setEmail(defaultEmail);
                  setPassword("password123");
                }}
                disabled={isLocked}
                className="py-2 rounded-md border border-surface-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center justify-center gap-xs cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Auto Fill</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  // Default role for signup must be Manager (since Drivers can't register)
                  if (selectedRole === "Driver") {
                    setSelectedRole("Fleet Manager");
                  }
                  setError(null);
                }}
                className="py-2 rounded-md border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-semibold text-xs flex items-center justify-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className="w-full py-2 rounded-md border border-surface-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center justify-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
