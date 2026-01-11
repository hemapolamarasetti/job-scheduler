
# 📘 Job Scheduler & Automation System

A simplified automation engine that lets users create jobs, run them, track their status, and trigger webhooks when jobs complete.  
Built as part of the Dotix Technologies Full Stack Developer Skill Test.

---

## 🚀 Features
- Create jobs with **task name, payload, and priority**
- Track jobs with statuses: **pending → running → completed**
- Run jobs with simulated 3‑second processing
- Dashboard with filters (status, priority)
- Webhook integration: sends job details to external URL when completed

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js + Express  
- **Database:** SQLite  
- **Integration:** Webhook (via axios)  
- **Optional Tools:** dotenv (env management), cors (frontend/backend connection)

---

## 🗂 Project Structure
```
/frontend
   index.html
   style.css
   script.js
/backend
   server.js
   db.js
   jobs.db
/screenshots
   dashboard.png
   job_creation.png
   webhook.png
README.md
```

---

## 🗄 Database Schema

**Table: jobs**

| Column      | Type    | Notes                                   |
|-------------|---------|-----------------------------------------|
| id          | INTEGER | Primary Key, Auto Increment             |
| taskName    | TEXT    | Name of the job                         |
| payload     | TEXT    | JSON string (job details)               |
| priority    | TEXT    | Low / Medium / High                     |
| status      | TEXT    | pending / running / completed           |
| createdAt   | TEXT    | ISO timestamp                           |
| updatedAt   | TEXT    | ISO timestamp                           |
| completedAt | TEXT    | ISO timestamp (nullable, set on finish) |

---

## 🔌 API Documentation

### 1. Create Job
**POST /jobs**  
Body:
```json
{
  "taskName": "Send report",
  "priority": "High",
  "payload": { "email": "hema@example.com" }
}
```
response:
```json
{
  "id": 1,
  "taskName": "Send report",
  "priority": "High",
  "payload": { "email": "hema@example.com" },
  "status": "pending",
  "createdAt": "2026-01-11T14:15:00Z",
  "updatedAt": "2026-01-11T14:15:00Z"
}
```

---

### 2. List Jobs
**GET /jobs**  
Query params: `status`, `priority`  
Example: `/jobs?status=pending&priority=High`  
response:
```json
[
  {
    "id": 1,
    "taskName": "Send report",
    "priority": "High",
    "payload": { "email": "hema@example.com" },
    "status": "pending",
    "createdAt": "2026-01-11T14:15:00Z",
    "updatedAt": "2026-01-11T14:15:00Z"
  }
]
```

---

### 3. Job Detail
**GET /jobs/:id**  
Example: `/jobs/1`  
response:
```json
{
  "id": 1,
  "taskName": "Send report",
  "priority": "High",
  "payload": { "email": "hema@example.com" },
  "status": "pending",
  "createdAt": "2026-01-11T14:15:00Z",
  "updatedAt": "2026-01-11T14:15:00Z"
}
```

---

### 4. Run Job
**POST /run-job/:id**  
Example: `/run-job/1`  
response (immediate):
```json
{ "message": "Job started", "id": 1 }
```
response (after 3 seconds, job completed + webhook triggered):
```json
{
  "jobId": 1,
  "taskName": "Send report",
  "priority": "High",
  "payload": { "email": "hema@example.com" },
  "completedAt": "2026-01-11T14:15:03Z"
}
```

---

### 5. Webhook Test (optional)
**POST /webhook-test**  
Body:
```json
{ "hello": "world" }
```
response:
```json
{ "ok": true, "received": { "hello": "world" } }
```

---

## 📨 Webhook Behavior
When a job completes, backend sends a POST request to your webhook URL (`WEBHOOK_URL` in `.env`).

Example payload:
```json
{
  "jobId": 1,
  "taskName": "Send report",
  "priority": "High",
  "payload": { "email": "hema@example.com" },
  "completedAt": "2026-01-11T14:15:03Z"
}
```

---

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
npm install
echo "PORT=4000" > .env
echo "WEBHOOK_URL=https://webhook.site/<your-id>" >> .env
node server.js
```

### Frontend
```bash
cd frontend
# Open index.html in browser
```

---

## 📸 Screenshots
- Dashboard view  
  `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]`  
- Job creation form  
  `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]`  
- Webhook payload result  
  `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]`  

---

## 🤖 AI Usage Log
- **Tools used:** Microsoft Copilot  
- **Model:** GPT‑5 (Smart Mode)  
- **Prompts:**  
  - “Guide me to build project from scratch”  
  - “server.js code”  
  - “frontend css file code”  
  - “test api’s in postman”  
  - “readme file give me for copy paste”  
- **AI helped with:**  
  - Writing backend logic (Express + SQLite)  
  - Frontend dashboard (HTML + CSS + JS)  
  - Debugging API errors (`%0A` issue)  
  - Documentation (README template + API docs)

---

## ✅ Evaluation Checklist
- Clean architecture & modular backend  
- Usable dashboard UI  
- Correct API logic & status transitions  
- SQLite schema with constraints  
- Webhook integration tested  
- Documentation complete  
```

---

