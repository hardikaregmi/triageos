# TriageOS

**AI-assisted hospital triage dashboard**

TriageOS helps care teams handle patient intake faster by combining patient queue visibility, urgency guidance, and doctor availability in one clean dashboard.

---

## Why it matters

In busy hospitals, patient information and staff availability are often spread across different systems. That can slow decisions when time matters most.

TriageOS brings those workflows together into one place.

---

## Features

- Secure nurse login with JWT authentication  
- Add, update, and manage patient intake records  
- Live patient queue with key clinical details  
- AI-assisted triage recommendations  
- Real-time doctor availability tracking  
- Dashboard summary metrics  
- Demo data for quick testing  

---

## AI Triage Output

For each patient, the system can generate:

- Priority level  
- Main concern  
- Reasoning  
- Recommended next action  
- Suggested specialty  
- Confidence score  

---

## Tech Stack

**Frontend**
- Next.js  
- React  
- CSS  

**Backend**
- Spring Boot (Java 17)  
- Spring Data JPA  
- Maven  

**Database**
- H2 (in-memory)

---

## Run Locally

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local

---

### Start frontend and backend

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
mvn spring-boot:run
```

Frontend:  
http://localhost:3000  

Backend:  
http://localhost:8080  

---
