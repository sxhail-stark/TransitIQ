import os
import re
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
import httpx
from app.core.config import settings

class AIService:
    @classmethod
    async def process_query(cls, db: Session, query: str) -> dict:
        query_lower = query.lower().strip()
        
        # 1. Check if Groq key is available
        if settings.GROQ_API_KEY:
            try:
                return await cls._call_groq_api(db, query)
            except Exception as e:
                # Fall back to local regex on failure
                print(f"Groq API call failed, falling back to local engine: {e}")
                return cls._process_local_query(db, query_lower)
        else:
            return cls._process_local_query(db, query_lower)

    @classmethod
    def _process_local_query(cls, db: Session, query: str) -> dict:
        """
        Rule-based local natural language dispatcher. Parses matching expressions
        and translates them into parameterized SQL queries against the DB.
        """
        # Highest maintenance cost
        if "highest maintenance cost" in query or "most expensive vehicle" in query or "maintenance cost" in query:
            sql = """
                SELECT v.name, v.registration_number, SUM(m.cost) as total_cost
                FROM maintenance_records m
                JOIN vehicles v ON m.vehicle_id = v.id
                GROUP BY v.id, v.name, v.registration_number
                ORDER BY total_cost DESC
                LIMIT 1
            """
            result = db.execute(text(sql)).fetchone()
            if result:
                answer = f"The vehicle with the highest maintenance cost is **{result[0]} ({result[1]})**, with a total repair cost of **${result[2]:,.2f}**."
                data = {"name": result[0], "registration_number": result[1], "total_cost": result[2]}
            else:
                answer = "No maintenance records were found in the database to calculate costs."
                data = None
            return {"answer": answer, "data": data, "sql_executed": sql}
            
        # Trips completed today
        elif "trips completed today" in query or "trips today" in query or "completed today" in query:
            sql = """
                SELECT COUNT(*) as count
                FROM trips
                WHERE status = 'completed' AND completed_at >= CURRENT_DATE
            """
            result = db.execute(text(sql)).fetchone()
            count = result[0] if result else 0
            
            # Fetch details
            sql_detail = """
                SELECT trip_number, source, destination, estimated_distance
                FROM trips
                WHERE status = 'completed' AND completed_at >= CURRENT_DATE
                LIMIT 5
            """
            details = db.execute(text(sql_detail)).fetchall()
            
            detail_text = ""
            if details:
                detail_text = "\n\nRecent dispatches completed:\n" + "\n".join(
                    [f"- **{t[0]}**: {t[1]} to {t[2]} ({t[3]} km)" for t in details]
                )
                
            answer = f"There have been **{count}** trips completed today.{detail_text}"
            return {"answer": answer, "data": {"completed_count": count}, "sql_executed": sql}

        # Expiring licenses
        elif "expiring license" in query or "expired license" in query or "driver license" in query:
            sql = """
                SELECT full_name, license_number, license_expiry
                FROM drivers
                WHERE license_expiry <= (CURRENT_DATE + INTERVAL '30 days')
                ORDER BY license_expiry ASC
            """
            results = db.execute(text(sql)).fetchall()
            if results:
                drivers_list = []
                data_list = []
                for r in results:
                    days = (r[2].date() - datetime.utcnow().date()).days
                    status_lbl = "EXPIRED" if days < 0 else f"expires in {days} days"
                    drivers_list.append(f"- **{r[0]}** (License: {r[1]}) - *{status_lbl}* ({r[2].strftime('%Y-%m-%d')})")
                    data_list.append({"name": r[0], "license": r[1], "expiry": r[2].strftime('%Y-%m-%d'), "days_remaining": days})
                
                answer = f"Found **{len(results)}** drivers with licenses expired or expiring within 30 days:\n" + "\n".join(drivers_list)
                data = data_list
            else:
                answer = "All active drivers have valid licenses with over 30 days remaining before expiration."
                data = []
            return {"answer": answer, "data": data, "sql_executed": sql}

        # Suggest next maintenance
        elif "suggest next maintenance" in query or "maintenance due" in query or "maintenance suggest" in query:
            sql = """
                SELECT name, registration_number, odometer, safety_score, health_score, maintenance_due
                FROM vehicles
                WHERE status != 'retired'
                ORDER BY health_score ASC, odometer DESC
                LIMIT 3
            """
            results = db.execute(text(sql)).fetchall()
            if results:
                maint_list = []
                data_list = []
                for r in results:
                    reason = []
                    if r[4] < 80:
                        reason.append(f"low health score ({r[4]}%)")
                    if r[2] > 100000:
                        reason.append(f"high odometer reading ({r[2]:,.0f} km)")
                    reason_str = " & ".join(reason) if reason else "routine scheduled inspection"
                    maint_list.append(f"- **{r[0]} ({r[1]})** - Recommend inspection due to *{reason_str}*")
                    data_list.append({"name": r[0], "registration_number": r[1], "odometer": r[2], "health_score": r[4]})
                
                answer = "Based on fleet analytics, here are the top 3 vehicles recommended for immediate maintenance:\n" + "\n".join(maint_list)
                data = data_list
            else:
                answer = "No suggestions. The fleet health score is currently optimal."
                data = []
            return {"answer": answer, "data": data, "sql_executed": sql}

        # Predict fuel consumption
        elif "predict fuel" in query or "fuel consumption" in query or "fuel prediction" in query:
            sql = """
                SELECT AVG(cost / NULLIF(quantity, 0)) as avg_fuel_price,
                       AVG(quantity / NULLIF(odometer, 0)) as avg_consumption
                FROM fuel_logs
            """
            result = db.execute(text(sql)).fetchone()
            # Calculate mock baseline if table is empty
            avg_price = result[0] if (result and result[0]) else 1.25
            avg_cons = result[1] if (result and result[1]) else 0.15  # liters/km
            
            answer = (
                f"Based on historical fuel logs, the average fuel price is **${avg_price:.2f}/Liter**.\n"
                f"Predictive consumption for a standard route is estimated at **{avg_cons * 100:.1f} Liters per 100 KM**.\n"
                f"For a typical 500 km cargo trip, we predict an consumption of **{500 * avg_cons:.1f} Liters** (Approx. Cost: **${500 * avg_cons * avg_price:.2f}**)."
            )
            return {
                "answer": answer,
                "data": {"predicted_efficiency_l_km": avg_cons, "average_price_per_l": avg_price},
                "sql_executed": sql
            }

        # Generate fleet summary
        elif "fleet summary" in query or "summary of fleet" in query or "overall status" in query:
            sql_vehicles = "SELECT status, COUNT(*) FROM vehicles GROUP BY status"
            veh_stats = db.execute(text(sql_vehicles)).fetchall()
            
            sql_drivers = "SELECT status, COUNT(*) FROM drivers GROUP BY status"
            drv_stats = db.execute(text(sql_drivers)).fetchall()
            
            v_summary = ", ".join([f"**{r[1]}** {r[0]}" for r in veh_stats]) or "No vehicles"
            d_summary = ", ".join([f"**{r[1]}** {r[0]}" for r in drv_stats]) or "No drivers"
            
            answer = (
                f"### TransitIQ Fleet Summary\n"
                f"- **Vehicles**: {v_summary}\n"
                f"- **Drivers**: {d_summary}\n"
                f"All systems are operating within normal telemetry thresholds. Click on the dashboard panel to view live telemetry updates."
            )
            return {"answer": answer, "data": {"vehicles": dict(veh_stats), "drivers": dict(drv_stats)}, "sql_executed": f"{sql_vehicles}; {sql_drivers}"}

        # Fallback response with helpful guide
        else:
            answer = (
                "Hello! I am your **TransitIQ AI Fleet Assistant**. I can help you analyze your operations in real-time.\n\n"
                "Try asking me queries like:\n"
                "1. *Which vehicle has the highest maintenance cost?*\n"
                "2. *Show trips completed today.*\n"
                "3. *Drivers with expiring licenses.*\n"
                "4. *Suggest next maintenance.*\n"
                "5. *Predict fuel consumption.*\n"
                "6. *Generate fleet summary.*"
            )
            return {"answer": answer, "data": None, "sql_executed": None}

    @classmethod
    async def _call_groq_api(cls, db: Session, query: str) -> dict:
        """
        Integrates with the Groq Cloud REST API to convert the user question
        into SQL or text analysis using LLM capability.
        """
        # Fetch some DB structure context to feed to LLM
        schema_context = """
        Database tables:
        - users(id, email, full_name, role, is_active)
        - vehicles(id, registration_number, name, model, capacity, fuel_type, odometer, status, safety_score, health_score, maintenance_due)
        - drivers(id, full_name, license_number, license_expiry, phone, status, safety_score, trips_completed, incidents_count)
        - trips(id, trip_number, source, destination, vehicle_id, driver_id, cargo_weight, estimated_distance, expected_fuel, actual_fuel, dispatch_time, status)
        - maintenance_records(id, vehicle_id, title, description, maintenance_type, cost, status, scheduled_date, started_at, completed_at, workshop)
        - fuel_logs(id, vehicle_id, driver_id, trip_id, quantity, cost, odometer, date, location)
        - expenses(id, category, amount, description, date, vehicle_id, trip_id)
        
        Write a standard, simple PostgreSQL SELECT query to answer: "{query}".
        Only output the raw SQL query inside a ```sql ... ``` block. Do not include explanation.
        If the query cannot be answered by the database, reply with text explaining why.
        """
        
        # Prepare payload
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a database developer assistant. You translate user questions to safe read-only SQL queries."},
                {"role": "user", "content": schema_context.format(query=query)}
            ],
            "temperature": 0.1,
            "max_tokens": 500
        }
        
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=10.0
            )
            
        if response.status_code != 200:
            raise Exception(f"Groq API returned error: {response.text}")
            
        res_json = response.json()
        content = res_json["choices"][0]["message"]["content"]
        
        # Parse SQL from response
        sql_match = re.search(r"```sql\s*(.*?)\s*```", content, re.DOTALL | re.IGNORECASE)
        if sql_match:
            sql_query = sql_match.group(1).strip()
            
            # Basic security check: only allow SELECT queries
            if not sql_query.lower().strip().startswith("select"):
                return {"answer": f"For security reasons, I can only execute SELECT queries. The generated query was: {sql_query}", "data": None, "sql_executed": None}
                
            try:
                rows = db.execute(text(sql_query)).fetchall()
                # Try to format the output
                if not rows:
                    return {"answer": "The query executed successfully but returned 0 results.", "data": [], "sql_executed": sql_query}
                
                # Format response with LLM
                format_prompt = f"""
                Format this query result as a friendly, professional response in Markdown.
                User Question: {query}
                SQL Run: {sql_query}
                Data Found: {str(rows[:10])}
                """
                
                payload_fmt = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a helpful fleet dispatcher bot. Format DB results nicely into markdown tables or lists."},
                        {"role": "user", "content": format_prompt}
                    ],
                    "temperature": 0.5,
                    "max_tokens": 800
                }
                
                async with httpx.AsyncClient() as client:
                    response_fmt = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        json=payload_fmt,
                        headers=headers,
                        timeout=10.0
                    )
                
                if response_fmt.status_code == 200:
                    fmt_json = response_fmt.json()
                    answer = fmt_json["choices"][0]["message"]["content"]
                else:
                    answer = f"SQL executed successfully. Results: {rows}"
                    
                return {"answer": answer, "data": [dict(row._mapping) for row in rows], "sql_executed": sql_query}
            except Exception as sql_err:
                return {"answer": f"I tried to run a database query but encountered a SQL execution error: {sql_err}", "data": None, "sql_executed": sql_query}
        else:
            # If no SQL block is found, return the direct text answer
            return {"answer": content, "data": None, "sql_executed": None}
