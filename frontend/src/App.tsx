import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";

// Import all pages
import { SignIn } from "./pages/signin";
import { Dashboard } from "./pages/dashboard";
import { Fleet } from "./pages/fleet";
import { VehicleDetails } from "./pages/vehicle_details";
import { Drivers } from "./pages/drivers";
import { DriverDetails } from "./pages/driver_details";
import { Trips } from "./pages/trips";
import { Maintenance } from "./pages/maintenance";
import { Financials } from "./pages/financials";
import { Analytics } from "./pages/analytics";
import { AIAssistant } from "./pages/ai_assistant";
import { ActivityTimeline } from "./pages/activity";
import { Notifications } from "./pages/notifications";
import { Settings } from "./pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />

            {/* Layout Wrapper / Protected routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/fleet/:id" element={<VehicleDetails />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/drivers/:id" element={<DriverDetails />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/activity" element={<ActivityTimeline />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
