# 🏥 TriageOS  
**AI-assisted hospital triage operations dashboard**  
Fast, structured intake. Clear priorities. Real-time staffing visibility.

---

## 🚨 The Problem
In busy care environments, critical information is scattered:
- Patient intake details live in one place  
- Triage urgency in another  
- Provider availability somewhere else  

This fragmentation slows down decision-making when speed matters most.

---

## 💡 The Solution
**TriageOS** brings everything into one unified operational dashboard:
- Capture patient intake + vitals  
- Generate triage guidance instantly  
- Monitor doctor availability  
- Manage patient queue in real time  

**One screen. Clear decisions.**

---

## ⚙️ What It Does
- 🧑‍⚕️ Nurse login with JWT session (bootstrap demo account from config / `.env`)  
- 📋 Patient queue dashboard with expandable clinical details  
- ➕ Add / remove patient intake records; update a patient with `PUT`  
- 👨‍⚕️ Doctor roster: live availability, **add** / **remove** physicians (roster is in-memory until the backend restarts)  
- 🧠 AI-assisted triage output:
  - Priority  
  - Concern  
  - Reasoning  
  - Recommended action  
  - Specialty  
  - Confidence score  
- ⚡ Auto-loaded demo dataset for instant showcase  

---

## 🧱 Tech Stack

### Frontend
- Next.js  
- React  
- Custom CSS (`frontend/styles/globals.css`)  

### Backend
- Spring Boot (Java 17)  
- Maven  
- Spring Data JPA with **H2** (in-memory DB) for **patients** and **nurse accounts**  
- In-memory **doctor** roster (fast to reset; survives until the JVM restarts)  

### Data
- CSV-based dataset loader (`data/`)  
- Backend utilities for demo imports  

---

## 🏗️ Architecture (High-Level)

- **Frontend (`frontend/`)**  
  UI pages: `dashboard`, `doctors`, `nurse-login`  
  Shared layout + reusable components  

- **Backend (`backend/`)**  
  REST APIs for:
  - Patients  
  - Doctors  
  - Dashboard metrics  
  - Triage service  

### 🔄 Triage Flow
1. Patient intake is submitted  
2. Triage service runs  
   - AI-assisted logic  
   - Rule-based fallback  
3. Result is attached to the patient record  
4. Output is displayed in the dashboard  

---

## 🔌 Core API Endpoints

Most routes require a **Bearer JWT** from nurse login (`Authorization: Bearer <token>`). Exceptions are called out below.

### Nurse auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/nurse/login` | Body: `{ "username", "password" }` — returns JWT (**no auth required**) |
| GET    | `/api/auth/nurse/me` | Current nurse profile (**JWT required**) |

### Patients & triage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/patients` | List all patients |
| POST   | `/patients` | Create patient intake |
| GET    | `/patients/{id}` | Get one patient |
| PUT    | `/patients/{id}` | Update intake |
| DELETE | `/patients/{id}` | Remove patient |
| POST   | `/patients/{id}/triage` | Run/update triage |

### Doctors & dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/doctors` | List doctors |
| POST   | `/doctors` | Add doctor — body: `{ "name", "specialty", "status"? }` (defaults to `available`) |
| PATCH  | `/doctors/{id}/status` | Update availability |
| DELETE | `/doctors/{id}` | Remove doctor from roster |
| GET    | `/dashboard/summary` | Dashboard metrics |

### Optional: create nurse accounts (admin key)

If `triageos.admin.nurse-create-key` is set (repo-root `.env` or `application.properties`), you can register nurses with:

`POST /api/admin/nurses` — header **`X-Admin-Key`**: same value as the configured key; body: `{ "username", "password", "displayName" }`. If the key is unset, this endpoint returns **404**.

---

## 🖥️ Local Setup

**Environment files (recommended)**  
- Copy **`.env.example`** to **`.env`** at the **repository root** so the backend can load secrets and bootstrap values (see `BackendApplication` / `application.properties`).  
- Copy **`frontend/.env.example`** to **`frontend/.env.local`** if you need a non-default API URL (`NEXT_PUBLIC_API_BASE`, default `http://localhost:8080`).

**Default demo nurse** (unless you override in `.env`): username **`10004567`**, password **`nurse`** — sign in at **`http://localhost:3000/nurse-login`** before using the dashboard or doctors pages.

```bash
# 1. Start backend
cd backend
mvn spring-boot:run
# → http://localhost:8080

# 2. Start frontend
cd ../frontend
npm install
npm run dev
# → http://localhost:3000
```
