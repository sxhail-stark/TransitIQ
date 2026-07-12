# 🚛 TransitOps
## Smart, Constraint-Aware Transport Operations Platform

> **From Fleet Records to Fleet Decisions.**

**TransitOps** is an intelligent, end-to-end transport operations platform that digitizes and connects the complete fleet lifecycle — from vehicle and driver management to smart dispatching, trip execution, maintenance, fuel tracking, expenses, and operational analytics.

Instead of treating fleet management as a collection of disconnected forms, TransitOps follows a simple principle:

> **Enter once. Validate automatically. Update everywhere.**

Every operational action automatically updates all related modules, reducing repetitive data entry, preventing invalid decisions, and giving fleet managers real-time operational visibility.

---

## 🏆 Team THE_GOAT

| Team Member |
|---|
| **Balaji S** |
| **A. Daria** |
| **Suhail Akthar SM** |
| **Khathija Farah S** |

---

# 📌 The Problem

Many logistics and transport organizations still depend on:

- Spreadsheets
- Paper-based vehicle logs
- Manual driver assignment
- Disconnected maintenance records
- Manual fuel and expense calculations
- Reactive compliance checks

This creates serious operational problems:

- 🚫 Double assignment of vehicles and drivers
- ⚠️ Drivers being assigned with expired licenses
- 📦 Vehicles being assigned cargo beyond their capacity
- 🔧 Vehicles under maintenance being accidentally dispatched
- ⛽ Poor visibility into fuel efficiency
- 💸 Inaccurate operational cost tracking
- 📉 Underutilized fleet resources
- 🕒 Repetitive manual data entry
- 📊 Lack of real-time operational intelligence

Traditional systems often **record problems after they happen**.

## Our goal is different:

> **TransitOps prevents invalid operational decisions before they happen.**

---

# 💡 Our Solution

TransitOps is a centralized **Smart Transport Operations Platform** that connects:

```text
Vehicles
    +
Drivers
    +
Trips
    +
Maintenance
    +
Fuel
    +
Expenses
    ↓
Operational Intelligence
    ↓
Actionable Dashboard
```

The platform combines four core capabilities:

### 1️⃣ Operations Engine
Manages vehicles, drivers, trips, maintenance, fuel, and expenses.

### 2️⃣ Guardrail Engine
Automatically enforces business rules before an invalid operation can occur.

### 3️⃣ Automation Engine
Synchronizes status changes and related records across the platform.

### 4️⃣ Decision Engine
Uses operational data to recommend suitable dispatch combinations and generate actionable insights.

---

# ✨ What Makes TransitOps Different?

## 🔁 1. Zero-Redundant Operations

TransitOps follows an **Enter Once, Update Everywhere** approach.

For example, when a trip is dispatched:

```text
Trip
Draft → Dispatched

Vehicle
Available → On Trip

Driver
Available → On Trip

Dashboard
Active Trips +1

Fleet Analytics
Automatically Recalculated
```

The user performs **one action**, while TransitOps automatically synchronizes the entire system.

---

## 🧠 2. Smart Dispatch Recommendation

Instead of forcing fleet managers to manually search through every vehicle and driver, TransitOps evaluates available resources and recommends the most suitable combination.

The system considers:

- Vehicle availability
- Vehicle load capacity
- Maintenance status
- Driver availability
- Driver license validity
- Driver suspension status
- Driver safety score
- Fuel efficiency
- Operational suitability

Example:

```text
Trip Requirement
────────────────────────
Route   : Chennai → Bangalore
Cargo   : 450 kg

Recommended Dispatch
────────────────────────
Vehicle : Van-05
Driver  : Alex
Score   : 94/100

Why?
✓ Vehicle is available
✓ Capacity is suitable
✓ Driver license is valid
✓ Driver is available
✓ Vehicle is not under maintenance
✓ Strong operational suitability
```

The recommendation is **explainable** — the manager can understand why a vehicle-driver combination was recommended.

---

## 🛡️ 3. Constraint-Aware Dispatch Guardrails

TransitOps does not simply accept user input.

It validates every dispatch against mandatory operational rules.

The system automatically prevents:

- ❌ Duplicate vehicle registration numbers
- ❌ Dispatching retired vehicles
- ❌ Dispatching vehicles under maintenance
- ❌ Assigning suspended drivers
- ❌ Assigning drivers with expired licenses
- ❌ Double-booking a vehicle already on a trip
- ❌ Double-booking a driver already on a trip
- ❌ Assigning cargo beyond vehicle capacity

Instead of displaying a generic error, TransitOps explains:

```text
🔴 Dispatch Blocked

Reason:
Cargo Weight: 700 kg
Vehicle Capacity: 500 kg

The selected vehicle exceeds its maximum
load capacity by 200 kg.

Suggested Action:
Choose a vehicle with at least 700 kg capacity.
```

The philosophy is simple:

> **Don't just say NO. Explain WHY and guide WHAT NEXT.**

---

# 🔗 Connected System Architecture

TransitOps is designed as a connected operational ecosystem.

```text
                    ┌──────────────┐
                    │    USERS     │
                    │    & RBAC    │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   OPERATIONS ENGINE    │
              └────────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ VEHICLES │     │ DRIVERS  │     │  TRIPS   │
    └────┬─────┘     └────┬─────┘     └────┬─────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  VALIDATION & DISPATCH │
              │        ENGINE          │
              └────────────┬───────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       ┌───────────┐ ┌──────────┐ ┌──────────┐
       │MAINTENANCE│ │   FUEL   │ │ EXPENSES │
       └─────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │    ANALYTICS     │
                 │       &          │
                 │ COMMAND CENTER   │
                 └──────────────────┘
```

---

# 🚀 Core Features

## 🔐 1. Authentication & Role-Based Access Control

TransitOps provides secure application access using:

- Email and password authentication
- Protected application routes
- Role-Based Access Control (RBAC)
- Authenticated user sessions
- Role-specific permissions

### Supported Operational Roles

- **Fleet Manager**
- **Driver**
- **Safety Officer**
- **Financial Analyst**

Each user sees only the functionality relevant to their operational responsibility.

---

## 📊 2. Smart Operations Dashboard

The dashboard provides a real-time view of fleet operations.

### KPI Cards

- 🚚 Active Vehicles
- ✅ Available Vehicles
- 🔧 Vehicles in Maintenance
- 🛣️ Active Trips
- ⏳ Pending Trips
- 👨‍✈️ Drivers On Duty
- 📈 Fleet Utilization %

### Filters

- Vehicle Type
- Vehicle Status
- Region

The dashboard automatically updates when operational events occur.

---

# 🎛️ Operations Command Center

Beyond standard KPI cards, TransitOps provides an actionable **Operations Command Center**.

```text
Fleet Health        87/100
Fleet Utilization   78%
Driver Compliance   94%
Cost Efficiency     72%

ACTION REQUIRED
────────────────────────────────
⚠ Driver license expiring soon
🔧 Vehicle approaching maintenance
📉 Vehicle showing low utilization
💸 Vehicle with high operational cost

RECOMMENDED ACTIONS
────────────────────────────────
→ Review driver compliance
→ Schedule vehicle maintenance
→ Optimize the next vehicle assignment
```

The goal is not just to answer:

> **"What happened?"**

TransitOps also helps answer:

> **"What needs attention next?"**

---

## 🚚 3. Vehicle Registry

Maintain a centralized master registry of fleet vehicles.

### Vehicle Information

- Unique Registration Number
- Vehicle Name / Model
- Vehicle Type
- Maximum Load Capacity
- Current Odometer
- Acquisition Cost
- Operational Status

### Vehicle Status Lifecycle

```text
Available
    ↓
On Trip
    ↓
Available

Available
    ↓
In Shop
    ↓
Available

Available / In Shop
    ↓
Retired
```

### Supported Status Values

- `Available`
- `On Trip`
- `In Shop`
- `Retired`

### Automatic Rules

- Registration numbers must be unique
- `In Shop` vehicles are removed from dispatch selection
- `Retired` vehicles are removed from dispatch selection
- `On Trip` vehicles cannot be assigned to another trip

---

## 👨‍✈️ 4. Driver Management

Maintain driver profiles and compliance information.

### Driver Information

- Name
- License Number
- License Category
- License Expiry Date
- Contact Number
- Safety Score
- Current Status

### Driver Status Values

- `Available`
- `On Trip`
- `Off Duty`
- `Suspended`

### Automatic Compliance Validation

TransitOps automatically evaluates driver eligibility.

```text
Valid License
     +
Available Status
     +
Not Suspended
     ↓
Eligible for Dispatch
```

A driver is automatically blocked from assignment when:

- The driving license has expired
- The driver is suspended
- The driver is already on another trip
- The driver is unavailable

---

## 🛣️ 5. Smart Trip Management

Trips connect the entire TransitOps ecosystem.

### Trip Inputs

- Source
- Destination
- Cargo Weight
- Planned Distance
- Vehicle
- Driver

### Trip Lifecycle

```text
Draft
  ↓
Dispatched
  ↓
Completed

OR

Draft / Dispatched
       ↓
    Cancelled
```

Before dispatch, TransitOps validates:

```text
✓ Is the vehicle available?
✓ Is the vehicle outside maintenance?
✓ Is the vehicle not retired?
✓ Is cargo within maximum capacity?
✓ Is the driver available?
✓ Is the driver's license valid?
✓ Is the driver not suspended?
✓ Is the vehicle already on another trip?
✓ Is the driver already on another trip?
```

Only a valid trip can be dispatched.

---

# ⚡ Automatic State Transitions

TransitOps uses automatic state synchronization.

## When a Trip is Dispatched

```text
Trip
Draft → Dispatched

Vehicle
Available → On Trip

Driver
Available → On Trip
```

## When a Trip is Completed

```text
Trip
Dispatched → Completed

Vehicle
On Trip → Available

Driver
On Trip → Available
```

## When a Dispatched Trip is Cancelled

```text
Trip
Dispatched → Cancelled

Vehicle
On Trip → Available

Driver
On Trip → Available
```

This eliminates repetitive manual status updates.

---

# ✅ Smart Trip Completion

At the end of a trip, the operator enters only essential information:

```text
Final Odometer
Fuel Consumed
Additional Expenses
```

TransitOps automatically derives:

```text
Distance Travelled
        =
Final Odometer - Starting Odometer

Fuel Efficiency
        =
Distance Travelled / Fuel Consumed
```

It then automatically:

- Marks the trip as completed
- Updates the vehicle odometer
- Releases the vehicle
- Releases the driver
- Creates/updates fuel information
- Updates expenses
- Recalculates operational metrics
- Refreshes dashboard KPIs

---

## 🔧 6. Maintenance Management

TransitOps connects maintenance directly to vehicle availability.

### Maintenance Workflow

```text
Vehicle Available
       ↓
Maintenance Created
       ↓
Vehicle → In Shop
       ↓
Removed from Dispatch Pool
       ↓
Maintenance Completed
       ↓
Vehicle → Available
       ↓
Returns to Dispatch Pool
```

### Automatic Maintenance Rules

When an active maintenance record is created:

- Vehicle status automatically changes to `In Shop`
- Vehicle disappears from dispatch selection
- Maintenance KPI updates
- Vehicle availability KPI updates

When maintenance is completed:

- Vehicle returns to `Available`
- Vehicle becomes dispatchable again
- Maintenance cost contributes to operational cost

A retired vehicle remains retired even after maintenance closure.

---

## ⛽ 7. Fuel Management

TransitOps maintains fuel logs for operational analysis.

### Fuel Log Information

- Vehicle
- Trip
- Fuel Consumed in Liters
- Fuel Cost
- Date

### Automatic Fuel Efficiency

```text
Fuel Efficiency =
Distance Travelled / Fuel Consumed
```

Fuel information contributes directly to:

- Vehicle efficiency analysis
- Operational cost
- Fleet performance
- Vehicle ROI

---

## 💰 8. Expense Management

TransitOps tracks operational expenses including:

- Fuel
- Maintenance
- Tolls
- Other trip-related expenses

### Automatic Operational Cost

```text
Total Operational Cost
        =
Fuel Cost
+
Maintenance Cost
+
Other Operational Expenses
```

Users do not manually calculate totals.

TransitOps derives them directly from connected operational records.

---

# 📈 Reports & Analytics

TransitOps converts operational data into actionable insights.

### Key Metrics

#### Fuel Efficiency

```text
Fuel Efficiency =
Distance Travelled / Fuel Consumed
```

#### Fleet Utilization

Tracks how effectively available fleet resources are being used.

#### Operational Cost

```text
Operational Cost =
Fuel + Maintenance + Other Expenses
```

#### Vehicle ROI

```text
Vehicle ROI =
Revenue - (Maintenance + Fuel)
───────────────────────────────
       Acquisition Cost
```

### Analytics Views

- Fleet Utilization
- Fuel Efficiency
- Vehicle Performance
- Operational Cost
- Maintenance Trends
- Driver Compliance
- Vehicle ROI

### Export Support

- CSV Export
- PDF Export

---

# 🔔 Smart Alerts & Notifications

TransitOps can surface important operational events such as:

- Driver license approaching expiry
- Driver license expired
- Vehicle maintenance required
- Vehicle unavailable for dispatch
- Capacity violation
- Driver compliance violation
- High operational cost
- Low vehicle utilization

This helps fleet managers move from **reactive operations** to **proactive management**.

---

# 🧠 Decision Flow

```text
User Action
     │
     ▼
┌──────────────────────┐
│ Validate Business    │
│ Rules                │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
   INVALID      VALID
     │           │
     ▼           ▼
Explain Why   Execute Action
     │           │
     ▼           ▼
Suggest Next  Update Related
Action        Entities
                 │
                 ▼
           Recalculate KPIs
                 │
                 ▼
           Refresh Dashboard
```

---

# 🗄️ Core Database Entities

TransitOps uses the following primary entities:

```text
Users
Roles
Vehicles
Drivers
Trips
Maintenance Logs
Fuel Logs
Expenses
```

### High-Level Relationship

```text
Users ───────── Roles

Vehicles ──────┐
               │
Drivers ───────┼──── Trips
               │       │
               │       ├──── Fuel Logs
               │       │
               │       └──── Expenses
               │
               └──── Maintenance Logs
```

---

# 🔄 Complete End-to-End Workflow

```text
1. Register Vehicle
        ↓
2. Register Driver
        ↓
3. Create Trip Requirement
        ↓
4. Validate Vehicle + Driver + Cargo
        ↓
5. Recommend Suitable Dispatch
        ↓
6. Dispatch Trip
        ↓
7. Vehicle + Driver → On Trip
        ↓
8. Complete Trip
        ↓
9. Record Final Odometer + Fuel
        ↓
10. Calculate Distance + Fuel Efficiency
        ↓
11. Vehicle + Driver → Available
        ↓
12. Update Fuel + Expenses
        ↓
13. Update Operational Cost
        ↓
14. Trigger Maintenance When Required
        ↓
15. Update Dashboard + Analytics
```

---

# 🧪 Example Scenario

### Step 1 — Vehicle Registration

```text
Vehicle: Van-05
Maximum Capacity: 500 kg
Status: Available
```

### Step 2 — Driver Registration

```text
Driver: Alex
License: Valid
Status: Available
```

### Step 3 — Trip Request

```text
Source: Chennai
Destination: Bangalore
Cargo Weight: 450 kg
```

### Step 4 — Validation

```text
450 kg ≤ 500 kg
✓ Capacity Valid

Driver License
✓ Valid

Vehicle
✓ Available

Driver
✓ Available
```

### Step 5 — Dispatch

```text
Trip → Dispatched
Vehicle → On Trip
Driver → On Trip
```

### Step 6 — Trip Completion

The operator enters:

```text
Final Odometer
Fuel Consumed
Trip Expenses
```

TransitOps automatically:

- Calculates distance
- Calculates fuel efficiency
- Updates vehicle odometer
- Updates operational cost
- Marks vehicle as available
- Marks driver as available
- Refreshes analytics

### Step 7 — Maintenance

An Oil Change maintenance record is created.

```text
Vehicle
Available → In Shop
```

The vehicle is automatically hidden from the dispatch pool.

After maintenance completion:

```text
Vehicle
In Shop → Available
```

---

# 📋 Mandatory Requirement Coverage

| Requirement | TransitOps Implementation |
|---|---|
| Responsive Web Interface | ✅ Responsive operational UI |
| Authentication | ✅ Email and password authentication |
| RBAC | ✅ Role-based application access |
| Vehicle CRUD | ✅ Complete vehicle lifecycle management |
| Driver CRUD | ✅ Driver profile and compliance management |
| Trip Management | ✅ Full trip lifecycle |
| Trip Validations | ✅ Constraint-aware dispatch engine |
| Automatic Status Transitions | ✅ Event-driven state synchronization |
| Maintenance Workflow | ✅ Connected vehicle maintenance lifecycle |
| Fuel Tracking | ✅ Trip-linked fuel records |
| Expense Tracking | ✅ Connected operational expenses |
| Dashboard with KPIs | ✅ Real-time operations dashboard |

---

# 🌟 Bonus Features

| Bonus Feature | Implementation |
|---|---|
| Charts & Visual Analytics | 📊 Operational dashboards |
| PDF Export | 📄 Exportable reports |
| License Expiry Reminders | 🔔 Smart compliance alerts |
| Vehicle Document Management | 📁 Vehicle-related document support |
| Search | 🔍 Fast operational discovery |
| Filters | 🎯 Vehicle, status and region filtering |
| Sorting | ↕️ Structured data exploration |
| Dark Mode | 🌙 Enhanced user experience |

---

# 🎯 Design Philosophy

TransitOps is built around five principles:

### 1. Enter Once
Avoid repeated manual data entry.

### 2. Validate Before Action
Prevent operational mistakes before they happen.

### 3. Automate State Changes
Users should not manually synchronize related records.

### 4. Explain Every Decision
Every blocked operation should clearly explain why.

### 5. Turn Data Into Action
Dashboards should guide decisions, not simply display numbers.

---

# 🏆 Why TransitOps?

Most fleet-management platforms focus on:

> **Recording fleet data.**

TransitOps focuses on:

> **Connecting operations, preventing invalid decisions, automating repetitive work, and transforming fleet data into actionable decisions.**

### Traditional Workflow

```text
Manual Entry
    ↓
Manual Validation
    ↓
Manual Status Updates
    ↓
Disconnected Records
    ↓
Reactive Reporting
```

### TransitOps Workflow

```text
Minimal Input
    ↓
Automatic Validation
    ↓
Smart Recommendation
    ↓
Automatic State Synchronization
    ↓
Connected Operational Data
    ↓
Actionable Intelligence
```

---

# 🔮 Future Scope

TransitOps is designed to scale beyond the hackathon prototype.

Future enhancements may include:

- 🗺️ Real-time GPS fleet tracking
- 🧠 Predictive maintenance
- 📍 Route optimization
- ⛽ Fuel anomaly detection
- 🚨 Driver risk prediction
- 📱 Driver mobile application
- 🌍 Multi-region fleet management
- 📡 IoT vehicle telemetry integration
- 🔋 EV battery and charging management
- 📊 Advanced cost forecasting

---

# 🎤 Our Vision

> **“TransitOps transforms fleet management from a system of records into a system of decisions.”**

Our goal is to create a platform where:

- Managers enter less data
- Invalid operations are prevented
- Fleet states update automatically
- Operational information remains synchronized
- Decisions are explainable
- Insights lead directly to action

---

# 👥 Team

## **THE_GOAT**

| Name |
|---|
| **Balaji S** |
| **A. Daria** |
| **Suhail Akthar SM** |
| **Khathija Farah S** |

---

## 🚀 Built for the Hackathon

**TransitOps — Smart Transport Operations Platform**

### *Enter once. Validate automatically. Update everywhere.*

---

⭐ **If you find this project valuable, consider starring the repository.**
