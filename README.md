# TriageOS

**AI-assisted hospital triage operations dashboard**

Fast patient intake, clearer priorities, and real-time doctor availability in one place.

---

## The idea

In busy care environments, important information is often split across different systems or screens.  
Patient intake, urgency, and provider availability are not always easy to see together, and that slows things down when time matters most.

**TriageOS** brings everything into one unified dashboard so staff can move faster and make clearer decisions.

---

## What it does

- Secure nurse login with JWT authentication  
- Add, update, and remove patient intake records  
- View a live patient queue with clinical details  
- Generate AI-assisted triage guidance  
- Track doctor availability in real time  
- Add and remove doctors from the roster  
- View dashboard summary metrics  
- Auto-load demo data for quick testing  

---

## AI-assisted triage output

Each patient can include:

- Priority  
- Main concern  
- Reasoning  
- Recommended action  
- Suggested specialty  
- Confidence score  

---

## Tech stack

### Frontend
- Next.js  
- React  
- Custom CSS  

### Backend
- Spring Boot (Java 17)  
- Maven  
- Spring Data JPA  
- H2 (in-memory database)  

### Data
- CSV-based demo dataset loader  
- In-memory doctor roster (resets on restart)  

---

## How it works

1. Patient intake is created  
2. Triage service runs  
3. AI-assisted logic generates guidance  
4. Rule-based fallback supports the flow  
5. Result is attached to the patient record  
6. Dashboard updates in real time  

---

## Project structure

### `frontend/`
- dashboard UI  
- doctors page  
- nurse login  
- shared components  

### `backend/`
REST APIs for:
- patients  
- doctors  
- dashboard metrics  
- triage  
- authentication  

---

## Core API endpoints

Most routes require a Bearer JWT.

### Nurse auth
- `POST /api/auth/nurse/login` — login and receive JWT  
- `GET /api/auth/nurse/me` — get current nurse  

### Patients
- `GET /patients` — list patients  
- `POST /patients` — create patient  
- `GET /patients/{id}` — get patient  
- `PUT /patients/{id}` — update patient  
- `DELETE /patients/{id}` — remove patient  
- `POST /patients/{id}/triage` — run triage  

### Doctors
- `GET /doctors` — list doctors  
- `POST /doctors` — add doctor  
- `PATCH /doctors/{id}/status` — update availability  
- `DELETE /doctors/{id}` — remove doctor  

### Dashboard
- `GET /dashboard/summary` — metrics  

---

## Optional admin route

If `triageos.admin.nurse-create-key` is set in `.env`:

- `POST /api/admin/nurses`

Header:
```
X-Admin-Key: <your key>
```

Body:
```json
{
  "username": "example",
  "password": "example",
  "displayName": "Example Nurse"
}
```

If not set, this endpoint returns `404`.

---

## Local setup

### 1. Environment files

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

---

### 2. Demo login

- Username: `10004567`  
- Password: `nurse`  

Login at:  
http://localhost:3000/nurse-login  

---

### 3. Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend:  
http://localhost:8080  

---

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:  
http://localhost:3000  

---

## Demo notes

- Patients and nurses use H2 in-memory storage  
- Doctor roster is in-memory (resets on restart)  
- Demo data is auto-loaded  

---

## Why We built this

TriageOS was built to explore how AI-assisted workflows can support faster decision-making in hospital operations, especially during patient intake and staff coordination.

---