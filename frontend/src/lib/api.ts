const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper to get auth header
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.warn("API GET failed, using mock fallback:", endpoint, e);
      return getMockFallback(endpoint);
    }
  },

  async post(endpoint: string, body: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e: any) {
      console.warn("API POST failed, handling via mock:", endpoint, e);
      return handleMockPost(endpoint, body, e.message);
    }
  },

  async put(endpoint: string, body: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e: any) {
      console.warn("API PUT failed, handling via mock:", endpoint, e);
      return handleMockPut(endpoint, body, e.message);
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.warn("API DELETE failed, handling via mock:", endpoint, e);
      return { success: true, deletedEndpoint: endpoint };
    }
  },
};

// --- HACKATHON OFFLINE MOCK DATA FALLBACKS ---
// Keep state in memory so edits persist locally if backend is unavailable
const mockState: Record<string, any> = {
  vehicles: [
    {
      id: "v-1",
      registration_number: "TX-987-AB",
      name: "Freightliner Cascadia",
      model: "Cascadia 2022",
      capacity: 15.0,
      fuel_type: "Diesel",
      odometer: 84500.0,
      insurance_number: "INS-998811",
      fitness_certificate: "FIT-882200",
      rc_number: "RC-773344",
      status: "available",
      safety_score: 92,
      health_score: 95,
      maintenance_due: new Date(Date.now() + 25 * 86400000).toISOString(),
      current_driver_id: "d-1",
      documents: [{ id: "doc-1", doc_type: "insurance", doc_name: "Commercial Policy", expiry_date: new Date(Date.now() + 120 * 86400000).toISOString(), file_path: "#" }],
      current_driver: { id: "d-1", full_name: "John Doe", phone: "+1 (555) 123-4567" }
    },
    {
      id: "v-2",
      registration_number: "TX-456-CD",
      name: "Volvo VNL 860",
      model: "VNL 860 2023",
      capacity: 18.0,
      fuel_type: "Diesel",
      odometer: 42300.0,
      insurance_number: "INS-112233",
      fitness_certificate: "FIT-334455",
      rc_number: "RC-556677",
      status: "available",
      safety_score: 96,
      health_score: 98,
      maintenance_due: new Date(Date.now() + 60 * 86400000).toISOString(),
      current_driver_id: "d-2",
      documents: [],
      current_driver: { id: "d-2", full_name: "Jane Smith", phone: "+1 (555) 987-6543" }
    },
    {
      id: "v-3",
      registration_number: "TX-112-EF",
      name: "Peterbilt 579",
      model: "579 EV 2023",
      capacity: 12.0,
      fuel_type: "EV",
      odometer: 12800.0,
      insurance_number: "INS-445566",
      fitness_certificate: "FIT-667788",
      rc_number: "RC-889900",
      status: "on_trip",
      safety_score: 85,
      health_score: 89,
      maintenance_due: new Date(Date.now() + 14 * 86400000).toISOString(),
      current_driver_id: "d-3",
      documents: [],
      current_driver: { id: "d-3", full_name: "Robert Miller", phone: "+1 (555) 456-7890" }
    },
    {
      id: "v-4",
      registration_number: "TX-554-GH",
      name: "Kenworth T680",
      model: "T680 2021",
      capacity: 20.0,
      fuel_type: "CNG",
      odometer: 156900.0,
      insurance_number: "INS-778899",
      fitness_certificate: "FIT-990011",
      rc_number: "RC-112244",
      status: "in_shop",
      safety_score: 78,
      health_score: 68,
      maintenance_due: new Date(Date.now() - 2 * 86400000).toISOString(),
      documents: [],
      current_driver: null
    }
  ],
  drivers: [
    {
      id: "d-1",
      full_name: "John Doe",
      license_number: "DL-92847194",
      license_expiry: new Date(Date.now() + 45 * 86400000).toISOString(),
      phone: "+1 (555) 123-4567",
      experience_years: 8,
      status: "available",
      safety_score: 94,
      trips_completed: 48,
      incidents_count: 0,
      documents: []
    },
    {
      id: "d-2",
      full_name: "Jane Smith",
      license_number: "DL-10928475",
      license_expiry: new Date(Date.now() + 120 * 86400000).toISOString(),
      phone: "+1 (555) 987-6543",
      experience_years: 5,
      status: "available",
      safety_score: 88,
      trips_completed: 32,
      incidents_count: 1,
      documents: []
    },
    {
      id: "d-3",
      full_name: "Robert Miller",
      license_number: "DL-83749281",
      license_expiry: new Date(Date.now() + 12 * 86400000).toISOString(),
      phone: "+1 (555) 456-7890",
      experience_years: 12,
      status: "on_trip",
      safety_score: 97,
      trips_completed: 114,
      incidents_count: 0,
      documents: []
    },
    {
      id: "d-4",
      full_name: "David Davis",
      license_number: "DL-47391028",
      license_expiry: new Date(Date.now() - 5 * 86400000).toISOString(),
      phone: "+1 (555) 321-7654",
      experience_years: 3,
      status: "suspended",
      safety_score: 60,
      trips_completed: 15,
      incidents_count: 3,
      documents: []
    }
  ],
  trips: [
    {
      id: "t-1",
      trip_number: "TRIP-20260712-001",
      source: "Port of Houston, TX",
      destination: "Distribution Center, Dallas TX",
      vehicle_id: "v-3",
      driver_id: "d-3",
      cargo_weight: 10.5,
      estimated_distance: 390.0,
      expected_fuel: 117.0,
      dispatch_time: new Date(Date.now() - 3 * 3600000).toISOString(),
      status: "in_transit",
      eta: new Date(Date.now() + 2 * 3600000).toISOString(),
      vehicle: { name: "Peterbilt 579", registration_number: "TX-112-EF" },
      driver: { full_name: "Robert Miller" },
      timeline: [
        { id: "tl-1", status: "assigned", description: "Trip scheduled and assigned", timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
        { id: "tl-2", status: "dispatched", description: "Vehicle departed Houston port gate 4.", location: "Houston, TX", timestamp: new Date(Date.now() - 3 * 3600000).toISOString() }
      ]
    },
    {
      id: "t-2",
      trip_number: "TRIP-20260711-002",
      source: "Warehouse 12, Chicago IL",
      destination: "Retail Outlet, St. Louis MO",
      vehicle_id: "v-1",
      driver_id: "d-1",
      cargo_weight: 14.0,
      estimated_distance: 470.0,
      expected_fuel: 141.0,
      actual_fuel: 138.0,
      dispatch_time: new Date(Date.now() - 32 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 26 * 3600000).toISOString(),
      status: "completed",
      vehicle: { name: "Freightliner Cascadia", registration_number: "TX-987-AB" },
      driver: { full_name: "John Doe" },
      timeline: [{ id: "tl-3", status: "completed", description: "Cargo delivered, signed off.", location: "St. Louis, MO", timestamp: new Date(Date.now() - 26 * 3600000).toISOString() }]
    },
    {
      id: "t-3",
      trip_number: "TRIP-20260712-003",
      source: "Logistics Hub, Austin TX",
      destination: "Port of Houston, TX",
      vehicle_id: "v-2",
      driver_id: "d-2",
      cargo_weight: 16.5,
      estimated_distance: 260.0,
      expected_fuel: 78.0,
      dispatch_time: new Date(Date.now() + 6 * 3600000).toISOString(),
      status: "assigned",
      vehicle: { name: "Volvo VNL 860", registration_number: "TX-456-CD" },
      driver: { full_name: "Jane Smith" },
      timeline: []
    }
  ],
  maintenance: [
    {
      id: "m-1",
      vehicle_id: "v-4",
      title: "Hydraulic Brake Line Replacement",
      description: "Brake line leakage discovered. Replacing hoses and refilling fluid.",
      maintenance_type: "repair",
      cost: 750.0,
      status: "in_progress",
      scheduled_date: new Date(Date.now() - 86400000).toISOString(),
      started_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      workshop: "Downtown Fleet Repair Shop",
      vehicle: { name: "Kenworth T680", registration_number: "TX-554-GH" }
    },
    {
      id: "m-2",
      vehicle_id: "v-1",
      title: "Engine Oil & Filter Change",
      description: "Routine 15,000 miles engine service.",
      maintenance_type: "routine",
      cost: 250.0,
      status: "completed",
      scheduled_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      workshop: "Mobile Fleet Lube Services",
      vehicle: { name: "Freightliner Cascadia", registration_number: "TX-987-AB" }
    },
    {
      id: "m-3",
      vehicle_id: "v-2",
      title: "Tire Rotation and Balancing",
      description: "Scheduled rotation of all 18 tires.",
      maintenance_type: "routine",
      cost: 380.0,
      status: "scheduled",
      scheduled_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      workshop: "Volvo Truck Care Austin",
      vehicle: { name: "Volvo VNL 860", registration_number: "TX-456-CD" }
    }
  ],
  expenses: [
    { id: "e-1", category: "repair", amount: 250.0, description: "Engine Oil & Filter Change", date: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: "e-2", category: "toll", amount: 45.5, description: "Toll charges IL to MO", date: new Date(Date.now() - 86400000).toISOString() },
    { id: "e-3", category: "insurance", amount: 1200.0, description: "Monthly insurance allocation", date: new Date(Date.now() - 5 * 86400000).toISOString() }
  ],
  fuel: [
    { id: "f-1", vehicle_id: "v-1", driver_id: "d-1", quantity: 138.0, cost: 648.6, odometer: 84030.0, date: new Date(Date.now() - 86400000).toISOString(), location: "Loves Stop, IL" }
  ],
  notifications: [
    { id: "n-1", title: "Driver License Renewal Overdue", message: "David Davis's license has expired. Suspended.", type: "license_expiry", priority: "high", is_read: false, driver_id: "d-4" },
    { id: "n-2", title: "Vehicle Maintenance Window Approaching", message: "Peterbilt 579 is due for inspection in 14 days.", type: "maintenance_due", priority: "medium", is_read: false, vehicle_id: "v-3" }
  ],
  activity: [
    { id: "a-1", action: "user_login", description: "Fleet Manager logged in from 192.168.1.100", created_at: new Date().toISOString() },
    { id: "a-2", action: "vehicle_added", description: "Vehicle TX-987-AB added to registry", created_at: new Date().toISOString() }
  ]
};

function getMockFallback(endpoint: string) {
  if (endpoint.startsWith("/vehicles/")) {
    const id = endpoint.split("/")[2];
    return mockState.vehicles.find((v: any) => v.id === id) || mockState.vehicles[0];
  }
  if (endpoint === "/vehicles") return mockState.vehicles;
  
  if (endpoint.startsWith("/drivers/")) {
    const id = endpoint.split("/")[2];
    return mockState.drivers.find((d: any) => d.id === id) || mockState.drivers[0];
  }
  if (endpoint === "/drivers") return mockState.drivers;

  if (endpoint.startsWith("/trips/")) {
    const id = endpoint.split("/")[2];
    return mockState.trips.find((t: any) => t.id === id) || mockState.trips[0];
  }
  if (endpoint === "/trips") return mockState.trips;
  
  if (endpoint === "/maintenance") return mockState.maintenance;
  if (endpoint === "/financials/fuel") return mockState.fuel;
  if (endpoint === "/financials/expenses") return mockState.expenses;
  if (endpoint === "/notifications") return mockState.notifications;
  if (endpoint === "/activity") return mockState.activity;

  if (endpoint === "/financials/summary") {
    return {
      total_operational_cost: 2144.10,
      cost_per_km: 0.16,
      average_mileage_km_l: 8.5,
      monthly_fuel_cost: 648.60,
      monthly_revenue: 150000.00
    };
  }

  if (endpoint === "/analytics/summary") {
    return {
      vehicles: { total: 4, active: 1, in_maintenance: 1, available: 2 },
      drivers: { total: 4, active: 1, available: 2, suspended: 1 },
      avg_driver_safety_score: 84.25,
      avg_vehicle_health_score: 87.5,
      trips: { total: 3, completed: 1, pending: 1, active: 1, delayed: 0 }
    };
  }

  if (endpoint === "/analytics/charts/fuel-trend") {
    return [
      { date: "2026-07-06", cost: 120.0, quantity: 100.0 },
      { date: "2026-07-07", cost: 240.0, quantity: 200.0 },
      { date: "2026-07-08", cost: 180.0, quantity: 150.0 },
      { date: "2026-07-09", cost: 320.0, quantity: 270.0 },
      { date: "2026-07-10", cost: 290.0, quantity: 240.0 },
      { date: "2026-07-11", cost: 648.6, quantity: 138.0 },
    ];
  }

  if (endpoint === "/analytics/charts/expenses-breakdown") {
    return [
      { category: "Repair", amount: 1000.0 },
      { category: "Insurance", amount: 1200.0 },
      { category: "Tax", amount: 350.0 },
      { category: "Toll", amount: 45.5 },
      { category: "Others", amount: 648.6 }
    ];
  }

  if (endpoint === "/analytics/rankings/drivers") {
    return mockState.drivers
      .map((d: any) => ({ id: d.id, name: d.full_name, safety_score: d.safety_score, trips_completed: d.trips_completed, incidents: d.incidents_count }))
      .sort((a: any, b: any) => b.safety_score - a.safety_score);
  }

  if (endpoint === "/analytics/rankings/vehicles") {
    return mockState.vehicles
      .map((v: any) => ({ id: v.id, registration_number: v.registration_number, name: v.name, safety_score: v.safety_score, health_score: v.health_score, odometer: v.odometer }))
      .sort((a: any, b: any) => b.safety_score - a.safety_score);
  }

  return [];
}

function handleMockPost(endpoint: string, body: any, originalErr: string) {
  if (endpoint === "/auth/login") {
    // Validate custom mockup users
    const validEmails = ["manager@transitiq.com", "dispatcher@transitiq.com", "safety@transitiq.com", "finance@transitiq.com", "driver1@transitiq.com"];
    if (validEmails.includes(body.email) && body.password === "password123") {
      const name = body.email.split("@")[0].toUpperCase();
      return {
        access_token: "mock-jwt-token-12345",
        token_type: "bearer",
        role: body.role,
        user_id: `u-${body.role.replace(" ", "")}`,
        email: body.email,
        full_name: `${name} Agent`
      };
    }
    throw new Error(originalErr || "Invalid email or password");
  }

  const newObj = { id: `mock-${uuid()}`, ...body, created_at: new Date().toISOString(), documents: [] };

  if (endpoint === "/vehicles") {
    if (mockState.vehicles.some((v: any) => v.registration_number === body.registration_number)) {
      throw new Error("Vehicle with registration number already exists");
    }
    const driver = mockState.drivers.find((d: any) => d.id === body.current_driver_id);
    newObj.health_score = 100;
    newObj.safety_score = 100;
    newObj.current_driver = driver ? { id: driver.id, full_name: driver.full_name } : null;
    mockState.vehicles.push(newObj);
    logActivity("vehicle_added", `Vehicle ${body.registration_number} added to registry`);
    return newObj;
  }

  if (endpoint === "/drivers") {
    if (mockState.drivers.some((d: any) => d.license_number === body.license_number)) {
      throw new Error("Driver with this license number already exists");
    }
    newObj.safety_score = 100;
    newObj.trips_completed = 0;
    newObj.incidents_count = 0;
    mockState.drivers.push(newObj);
    logActivity("driver_added", `Driver ${body.full_name} added to fleet`);
    return newObj;
  }

  if (endpoint === "/trips") {
    const vehicle = mockState.vehicles.find((v: any) => v.id === body.vehicle_id);
    const driver = mockState.drivers.find((d: any) => d.id === body.driver_id);
    
    if (!vehicle || !driver) throw new Error("Vehicle or driver not found");
    if (body.cargo_weight > vehicle.capacity) {
      throw new Error(`Cargo weight exceeds vehicle capacity of ${vehicle.capacity} tons`);
    }
    if (vehicle.status !== "available") throw new Error("Vehicle is not available");
    if (driver.status !== "available") throw new Error("Driver is not available");
    if (new Date(driver.license_expiry) < new Date()) throw new Error("Driver license is expired");

    vehicle.status = "on_trip";
    driver.status = "on_trip";
    
    newObj.trip_number = `TRIP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${uuid().slice(0, 4).toUpperCase()}`;
    newObj.status = "assigned";
    newObj.vehicle = { name: vehicle.name, registration_number: vehicle.registration_number };
    newObj.driver = { full_name: driver.full_name };
    newObj.timeline = [{ id: `tl-${uuid()}`, status: "assigned", description: "Trip assigned", timestamp: new Date().toISOString() }];
    
    mockState.trips.push(newObj);
    logActivity("trip_created", `Trip ${newObj.trip_number} created: ${newObj.source} to ${newObj.destination}`);
    return newObj;
  }

  if (endpoint === "/maintenance") {
    const vehicle = mockState.vehicles.find((v: any) => v.id === body.vehicle_id);
    if (!vehicle) throw new Error("Vehicle not found");
    
    newObj.vehicle = { name: vehicle.name, registration_number: vehicle.registration_number };
    if (body.status === "in_progress") {
      vehicle.status = "in_shop";
    }
    mockState.maintenance.push(newObj);
    logActivity("maintenance_created", `Maintenance scheduled for ${vehicle.registration_number}`);
    return newObj;
  }

  if (endpoint === "/financials/fuel") {
    const vehicle = mockState.vehicles.find((v: any) => v.id === body.vehicle_id);
    if (vehicle && body.odometer > vehicle.odometer) {
      vehicle.odometer = body.odometer;
    }
    mockState.fuel.push(newObj);
    mockState.expenses.push({ id: `e-${uuid()}`, category: "others", amount: body.cost, description: `Fuel refill at ${body.location}`, date: body.date, vehicle_id: body.vehicle_id });
    logActivity("fuel_logged", `Logged fuel refill for ${vehicle ? vehicle.registration_number : "vehicle"}`);
    return newObj;
  }

  if (endpoint === "/financials/expenses") {
    mockState.expenses.push(newObj);
    logActivity("expense_created", `Created expense of $${body.amount} (${body.category})`);
    return newObj;
  }

  if (endpoint.startsWith("/ai/query")) {
    return runLocalAIResponse(body.query);
  }

  return newObj;
}

function handleMockPut(endpoint: string, body: any, originalErr: string) {
  if (endpoint.startsWith("/vehicles/")) {
    const id = endpoint.split("/")[2];
    const index = mockState.vehicles.findIndex((v: any) => v.id === id);
    if (index !== -1) {
      mockState.vehicles[index] = { ...mockState.vehicles[index], ...body };
      return mockState.vehicles[index];
    }
  }

  if (endpoint.startsWith("/drivers/")) {
    const id = endpoint.split("/")[2];
    const index = mockState.drivers.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      mockState.drivers[index] = { ...mockState.drivers[index], ...body };
      return mockState.drivers[index];
    }
  }

  if (endpoint.startsWith("/trips/") && endpoint.endsWith("/status")) {
    const id = endpoint.split("/")[2];
    const trip = mockState.trips.find((t: any) => t.id === id);
    if (trip) {
      const oldStatus = trip.status;
      trip.status = body.status;
      trip.timeline.push({
        id: `tl-${uuid()}`,
        status: body.status,
        description: body.description || `Trip status changed to ${body.status}`,
        location: body.location,
        timestamp: new Date().toISOString()
      });

      const vehicle = mockState.vehicles.find((v: any) => v.id === trip.vehicle_id);
      const driver = mockState.drivers.find((d: any) => d.id === trip.driver_id);

      if (body.status === "dispatched" || body.status === "in_transit") {
        if (vehicle) vehicle.status = "on_trip";
        if (driver) driver.status = "on_trip";
      } else if (body.status === "completed") {
        trip.completed_at = new Date().toISOString();
        if (vehicle) {
          vehicle.status = "available";
          vehicle.odometer += trip.estimated_distance;
        }
        if (driver) {
          driver.status = "available";
          driver.trips_completed += 1;
        }
      } else if (body.status === "cancelled") {
        if (vehicle) vehicle.status = "available";
        if (driver) driver.status = "available";
      }

      logActivity("trip_status_updated", `Trip ${trip.trip_number} updated to ${body.status}`);
      return trip;
    }
  }

  if (endpoint.startsWith("/maintenance/") && endpoint.endsWith("/status")) {
    const id = endpoint.split("/")[2];
    const maint = mockState.maintenance.find((m: any) => m.id === id);
    if (maint) {
      maint.status = body.status;
      const vehicle = mockState.vehicles.find((v: any) => v.id === maint.vehicle_id);
      if (body.status === "in_progress") {
        maint.started_at = new Date().toISOString();
        if (vehicle) vehicle.status = "in_shop";
      } else if (body.status === "completed") {
        maint.completed_at = new Date().toISOString();
        if (vehicle) {
          vehicle.status = "available";
          vehicle.maintenance_due = new Date(Date.now() + 180 * 86400000).toISOString();
        }
        mockState.expenses.push({ id: `e-${uuid()}`, category: "repair", amount: maint.cost, description: `Completed Maintenance: ${maint.title}`, date: new Date().toISOString(), vehicle_id: maint.vehicle_id });
      }
      return maint;
    }
  }

  return { success: true };
}

function logActivity(action: string, description: string) {
  mockState.activity.unshift({
    id: `act-${uuid()}`,
    action,
    description,
    created_at: new Date().toISOString()
  });
}

function uuid() {
  return Math.random().toString(36).substring(2, 9);
}

function runLocalAIResponse(query: string) {
  const q = query.toLowerCase();
  let answer = "";
  let data = null;

  if (q.includes("highest maintenance cost")) {
    answer = "The vehicle with the highest maintenance cost is **Kenworth T680 (TX-554-GH)**, with a total repair cost of **$750.00**.";
    data = { name: "Kenworth T680", registration_number: "TX-554-GH", total_cost: 750 };
  } else if (q.includes("completed today")) {
    answer = "There have been **1** trips completed today.\n\nRecent dispatches completed:\n- **TRIP-20260711-002**: Chicago IL to St. Louis MO (470 km)";
    data = { completed_count: 1 };
  } else if (q.includes("expiring licenses")) {
    answer = "Found **1** driver with license expiring soon:\n- **Robert Miller** (License: DL-83749281) - *expires in 12 days* (2026-07-24)";
    data = [{ name: "Robert Miller", license: "DL-83749281", days_remaining: 12 }];
  } else if (q.includes("suggest next maintenance")) {
    answer = "Based on fleet analytics, here are the top vehicles recommended for maintenance:\n- **Kenworth T680 (TX-554-GH)** - Recommend inspection due to low health score (68%)\n- **Freightliner Cascadia (TX-987-AB)** - Routine lube and filter checks.";
    data = [{ name: "Kenworth T680", health_score: 68 }];
  } else if (q.includes("predict fuel")) {
    answer = "Based on historical fuel logs, average fuel price is **$4.70/Gallon**.\nPredictive consumption is estimated at **0.15 Liters/KM**. For a 500 km cargo route, we predict **75 Liters** used.";
  } else {
    answer = "I am the **TransitIQ AI Fleet Assistant**. I can help you with natural language queries like:\n- *Which vehicle has the highest maintenance cost?*\n- *Show trips completed today.*\n- *Drivers with expiring licenses.*\n- *Suggest next maintenance.*";
  }

  return { answer, data };
}
