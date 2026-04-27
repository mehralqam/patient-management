# Patient Management System

A full-stack clinic patient management application. Staff log in with their clinic credentials and manage the patient list for their clinic.

Built with Django REST Framework, React + TypeScript, PostgreSQL, and Docker.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 19 + TypeScript + Vite |
| Database | PostgreSQL 15 |
| Styling | Tailwind CSS v4 + lucide-react |
| Auth | DRF Token Authentication |
| Infra | Docker Compose + Nginx |

---

## Features

- Token-based login scoped to a clinic
- Patient list showing all patients belonging to the logged-in user's clinic
- Create, edit, and delete patients (via modals, not separate pages)
- Delete confirmation modal (no browser dialogs)
- Toast notifications for success/error feedback
- Responsive design — works on mobile and desktop
- Appointment and clinician data model (with M2M through table)
- Auto-runs migrations and seeds test data on Docker startup
- CI pipeline for backend tests and frontend type checking

---

## Getting Started

### Docker (recommended)

Requires Docker and Docker Compose.

```bash
cp .env.example .env   # edit values if needed
docker compose up --build
```

The app will be available at [http://localhost](http://localhost).

On first start the container will:
1. Run all Django migrations
2. Seed a test clinic, user, and sample patients
3. Start the application server

### Local Development

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure your local .env or export env vars (see Environment Variables below)
python manage.py migrate
python manage.py seed
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8000`, so the backend must be running.

---

## Test Credentials

The seed command creates a test account automatically:

| | |
|---|---|
| Username | `testuser` |
| Password | `testpass123` |
| Clinic | Riverside Medical Clinic |

The login form is pre-filled with these credentials so you can sign in immediately after seeding.

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in values.

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_DB` | Database name | `patientdb` |
| `POSTGRES_USER` | Postgres username | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password | `postgres` |
| `DB_HOST` | Database host | `db` (Docker) / `localhost` (local) |
| `SECRET_KEY` | Django secret key | — must be set |

---

## Running Tests

**With Docker running:**

```bash
docker compose exec backend python manage.py test
docker compose exec backend python manage.py test --verbosity=2
```

**Without Docker (requires local Postgres):**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py test
```

**Frontend type check:**

```bash
cd frontend && npx tsc --noEmit
```

---

## Project Structure

```
patient-management/
├── backend/
│   ├── clinic/                 # Main Django app
│   │   ├── models.py           # Clinic, User, Patient, Clinician, Appointment
│   │   ├── views.py            # PatientViewSet (clinic-scoped)
│   │   ├── serializers.py      # Read + Write serializers
│   │   ├── urls.py             # Patient router
│   │   └── management/
│   │       └── commands/
│   │           └── seed.py     # Test data seeder
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py             # Auth + clinic routes
│   ├── entrypoint.sh           # migrate → seed → gunicorn
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client + patient API functions
│   │   ├── components/         # Login, PatientList, PatientModal, ConfirmModal, etc.
│   │   ├── lib/                # Toast notifications
│   │   ├── utils/              # Shared utilities (error handling, patient helpers)
│   │   └── types/              # Shared TypeScript interfaces
│   ├── Dockerfile
│   └── vite.config.ts
├── nginx/
│   └── nginx.conf              # Proxy /api/ to backend, serve SPA
└── docker-compose.yml
```

---

## Data Model

```
Clinic
  └── User (login, belongs to clinic)
  └── Patient (belongs to clinic)
        └── Appointment
              └── Clinician (M2M via AppointmentClinician)
```

- One user belongs to one clinic
- Patients are scoped to a clinic — users only see their clinic's patients
- Clinicians are recorded on appointments with a per-appointment role

---

## API

Base URL: `/api/v1/`

All endpoints except login require a token header:
```
Authorization: Token <token>
```

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login/` | Obtain auth token |
| `GET` | `/patients/` | List clinic patients |
| `POST` | `/patients/` | Create patient |
| `GET` | `/patients/:id/` | Get patient detail |
| `PATCH` | `/patients/:id/` | Update patient |
| `DELETE` | `/patients/:id/` | Delete patient |

---

## CI

GitHub Actions runs on push and PRs to `main`:

- **Backend** — runs Django tests against a PostgreSQL service container
- **Frontend** — TypeScript type check (`tsc --noEmit`)
