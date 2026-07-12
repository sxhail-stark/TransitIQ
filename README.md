# TransitIQ - AI Powered Smart Transport Operations Platform

TransitIQ is a full-stack, production-ready enterprise SaaS logistics platform built for smart fleet operations, driver management, real-time dispatches, maintenance tracking, and automated financial accounting. It features a premium dark theme derived from custom layout design variables and integrates an AI Fleet Assistant using the Groq API (with offline local rule fallback).

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (Stitch Palette), React Router, TanStack Query, React Hook Form, Zod, Framer Motion, Recharts, Material Symbols.
- **Backend**: FastAPI (Python 3.14), Pydantic, SQLAlchemy ORM, Alembic Migrations, JWT Authentication, Role-Based Access Control (RBAC).
- **Database**: PostgreSQL (Normalized Schema, connection pooling, cascaded deletion, optimized indexes). Supports MySQL fallback.

---

## Directory Structure

```
transitiq/
├── app/                      # FastAPI Backend
│   ├── core/                 # Security configs, auth dependencies
│   ├── db/                   # Connection, declarative base
│   ├── models/               # SQLAlchemy DB entities (15 tables)
│   ├── schemas/              # Pydantic validation schemas (DTOs)
│   ├── repositories/         # Database access abstraction (Repository Pattern)
│   ├── services/             # Business rules logic (Service Pattern)
│   ├── routers/              # Rest API endpoints (v1)
│   └── main.py               # Main application entrypoint
├── alembic/                  # Database migration logs
├── alembic.ini               # Alembic configuration
├── requirements.txt          # Python packages
├── package.json              # Root npm workspace monorepo config
├── seed.py                   # DB setup and mock data seeder
└── frontend/                 # React 19 Client
    ├── package.json          # Frontend dependencies
    ├── vite.config.ts        # Vite build tool config
    ├── tailwind.config.js    # Custom Stitch Theme Configuration
    ├── index.html            # Entry HTML
    └── src/                  # React Source Code
        ├── components/       # Layouts, Sidebar, Navbar
        ├── context/          # Auth Context, session loaders
        ├── lib/              # API Client (with offline mock fallbacks)
        ├── pages/            # 15 React Pages matching Stitch Layouts
        ├── App.tsx           # Route registrations
        └── main.tsx          # Client mount point
```

---

## Setup & Execution

### 1. Database Setup
Ensure you have PostgreSQL running and create a database named `transitiq`.
Default Connection String: `postgresql://postgres:postgres@localhost:5432/transitiq`
If using MySQL, set `DATABASE_URL` starting with `mysql://...` (the code will automatically load `pymysql`).

### 2. Backend Installation
```bash
# Create and activate virtual environment
py -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed initial operational data
py seed.py

# Start local server (Runs at http://localhost:8000)
uvicorn app.main:app --reload
```

*Swagger API docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 3. Frontend Installation
```bash
# Install dependencies from root monorepo
npm install

# Start Vite React development server (Runs at http://localhost:5173)
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transitiq

# JWT Token Secret Key
SECRET_KEY=transitiq_super_secret_key_change_me_in_production_1234567890

# AI Coprocessor Engine
GROQ_API_KEY=your_groq_api_key_here
```

*Note: If `GROQ_API_KEY` is not provided, the AI Assistant will gracefully fallback to a local rule-based natural language parsing engine matching key operational queries.*

---

## Database Entity Model

- **`users`**: Secure operator registry.
- **`roles`**: RBAC permissions (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).
- **`vehicles`**: Tracks name, model, capacity, status, scores, odometer.
- **`vehicle_documents`**: RC, Fitness, Insurance certificates.
- **`drivers`**: Track CDL license, expiry, experience, safety scores, incidents.
- **`driver_documents`**: Class A CDL licenses, health checks.
- **`trips`**: Source, destination, cargo weight validation, ETA, fuel logging.
- **`trip_timeline`**: Event timeline log for active dispatches.
- **`maintenance_records`**: Schedule repairs, updates vehicle status to "In Shop".
- **`maintenance_images`**: Invoices and repair uploads.
- **`fuel_logs`**: Volume, unit cost, odometer, and refills tracking.
- **`expenses`**: Logs tax, toll, insurance, and maintenance costs.
- **`notifications`**: Live operations alert center.
- **`safety_scores`**: Calculated metrics for vehicles and drivers.
- **`activity_logs`**: System audit logs.
- **`analytics_cache`**: High-performance telemetry caching.

---

## Business Rules & Security

- **Dispatch Constraints**:
  - Trip Cargo Weight cannot exceed Vehicle Capacity.
  - Driver must be "available" (not on another trip, not suspended).
  - Vehicle must be "available" (not retired, not in repair shop).
  - Driver license must be valid (not expired).
- **RBAC Matrix**:
  - `Fleet Manager`: Complete create, edit, delete access.
  - `Dispatcher`: Creates and updates dispatches, schedules crew.
  - `Safety Officer`: Validates license, incident records, driver scores.
  - `Financial Analyst`: Records expenses, refuels, downloads logs.
