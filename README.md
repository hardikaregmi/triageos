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
- 🧑‍⚕️ Nurse login flow (demo mode)  
- 📋 Patient queue dashboard with expandable clinical details  
- ➕ Add / remove patient intake records  
- 🧠 AI-assisted triage output:
  - Priority  
  - Concern  
  - Reasoning  
  - Recommended action  
  - Specialty  
  - Confidence score  
- 👨‍⚕️ Doctor roster with live availability controls  
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
- In-memory repositories (demo-friendly)  

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/patients` | List all patients |
| POST   | `/patients` | Create patient intake |
| DELETE | `/patients/{id}` | Remove patient |
| POST   | `/patients/{id}/triage` | Run/update triage |
| GET    | `/doctors` | List doctors |
| PATCH  | `/doctors/{id}/status` | Update availability |
| GET    | `/dashboard/summary` | Dashboard metrics |

---

## 🖥️ Local Setup

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
