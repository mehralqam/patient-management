# Patient Management — Agent and Developer Rules

This document defines rules that any AI agent or developer MUST follow when working on this codebase. It also serves as an evaluation guide for reviewing whether the implementation meets the assessment requirements.

---

## Scope

These rules apply when modifying or creating:

- `backend/clinic/models.py` — Core data models
- `backend/clinic/views.py` — API views and queryset logic
- `backend/clinic/serializers.py` — Read and write serializers
- `backend/clinic/urls.py` — Patient router
- `backend/config/settings.py` — Django configuration
- `backend/config/urls.py` — Root URL config and auth endpoint
- `backend/clinic/management/commands/seed.py` — Test data seeder
- `frontend/src/components/` — Login, PatientList, PatientModal, ConfirmModal, Modal, Navbar, etc.
- `frontend/src/api/` — API client and patient functions
- `frontend/src/lib/toast.ts` — Toast notification utilities
- `frontend/src/utils/` — Shared utilities (error handling, patient helpers)
- `frontend/src/types/index.ts` — Shared TypeScript interfaces
- `docker-compose.yml`, `backend/Dockerfile`, `backend/entrypoint.sh` — Container setup

---

## Core Concepts

- **Clinic** — A medical practice. Users and patients are scoped to a clinic.
- **User** — A staff member who logs in. Belongs to exactly one clinic via ForeignKey.
- **Patient** — A person receiving care. Belongs to exactly one clinic.
- **Clinician** — A medical professional recorded on appointments. Currently separate from User (no login capability). This is a known architectural gap to be revisited.
- **Clinic scoping** — All patient data returned by the API MUST be filtered to the authenticated user's clinic. This is the core security invariant.

---

## Assessment Requirements Checklist

Use this checklist to verify the implementation meets all assessment criteria.

### Authentication
- [ ] Users can log in with username and password
- [ ] Login returns a token stored client-side (localStorage)
- [ ] All patient API endpoints require authentication (`IsAuthenticated`)
- [ ] A valid token is attached to every API request (`Authorization: Token <token>`)
- [ ] A 401 response clears the token and redirects to `/login`
- [ ] No self-registration — accounts are created via seeding or admin only
- [ ] Logout clears the token and returns the user to `/login`

### Clinic Scoping
- [ ] `PatientViewSet.get_queryset()` filters by `request.user.clinic` — never returns all patients globally
- [ ] `PatientViewSet.perform_create()` assigns `clinic=request.user.clinic` — clinic is never accepted from the client
- [ ] The frontend displays the clinic name to confirm context (header and patient count subtitle)
- [ ] `clinic_name` is returned in the read serializer as a server-resolved field, not passed from the frontend

### Patient CRUD
- [ ] **List** — `GET /api/v1/patients/` returns only the logged-in user's clinic's patients
- [ ] **Create** — `POST /api/v1/patients/` accepts `first_name`, `last_name`, `date_of_birth` only; clinic is assigned server-side
- [ ] **Edit** — `PATCH /api/v1/patients/:id/` updates patient fields
- [ ] **Delete** — `DELETE /api/v1/patients/:id/` removes the patient
- [ ] All four operations are accessible from the UI
- [ ] Navigating away and back reflects mutations immediately (React Query cache invalidation)

### Data Model
- [ ] `Clinic` has `name` and `address`
- [ ] `User` extends `AbstractUser` and has a ForeignKey to `Clinic`
- [ ] `Patient` has `first_name`, `last_name`, `date_of_birth`, ForeignKey to `Clinic`, and `created_at`
- [ ] `Clinician` has `name` and `role`
- [ ] `Appointment` links `Patient` to many `Clinician` records via `AppointmentClinician` through table
- [ ] `AppointmentClinician` stores `role_in_appointment` and enforces unique `(appointment, clinician)`

### Docker
- [ ] `docker compose up --build` starts the full stack (db, backend, frontend, nginx)
- [ ] Backend waits for the database healthcheck before starting
- [ ] Migrations run automatically on container start (`python manage.py migrate`)
- [ ] Seed runs automatically on container start (`python manage.py seed`)
- [ ] The app is accessible at `http://localhost` (port 80 via nginx)
- [ ] Nginx proxies `/api/*` to the backend and serves the React SPA with `try_files` fallback

### Seed Data
- [ ] `python manage.py seed` is idempotent (safe to run multiple times)
- [ ] Creates clinic: **Riverside Medical Clinic**
- [ ] Creates user: `testuser` / `testpass123`, associated with the clinic
- [ ] Creates 5 sample patients associated with the clinic
- [ ] Login form is pre-filled with test credentials (`testuser` / `testpass123`)

### Frontend
- [ ] Root `/` redirects to `/login`
- [ ] `/login` — login form with dev credentials pre-filled
- [ ] `/patients` — protected list page with clinic name, patient table, Add/Edit/Delete (all via modals)
- [ ] Create/Edit handled via `PatientModal` (no separate routes)
- [ ] Delete confirmation handled via `ConfirmModal` (no browser confirm dialog)
- [ ] Toast notifications for success/error feedback
- [ ] Responsive design — works on mobile and desktop
- [ ] Unauthenticated access to patient routes redirects to `/login` via 401 interceptor

### CI
- [ ] GitHub Actions runs on push/PR to `main`
- [ ] Backend job: spins up PostgreSQL, installs deps, runs `ruff check .`, then `python manage.py test`
- [ ] Frontend job: installs deps, runs `tsc --noEmit`, then `npm run lint`

---

## Critical Rules

### Clinic Scoping is Non-Negotiable
The queryset in `PatientViewSet` MUST always filter by `request.user.clinic`. Never return all patients regardless of clinic. Never accept a clinic ID from the client on create or update.

### No Client-Side Authorization
Access control is enforced by the backend. The frontend reflects what the backend returns. Do not add or rely on client-side permission checks as a security gate.

### Serializer Split Must Be Maintained
- `PatientSerializer` — read operations; includes `clinic_name`, nested `appointments`
- `PatientWriteSerializer` — write operations; only `first_name`, `last_name`, `date_of_birth`

Never add `clinic` as a writable field on `PatientWriteSerializer`.

### Token Auth is the Only Auth Method
Do not add session auth, JWT, or OAuth. DRF `TokenAuthentication` via `rest_framework.authtoken` is the implementation.

### No Signup Flow
Registration is out of scope. Accounts are created via `manage.py seed` or the Django admin. Do not add a registration endpoint or frontend signup page.

### Seed Must Stay Idempotent
The seed command runs every time Docker starts. It MUST use `get_or_create` for all records. It must never raise on repeat runs or duplicate data.

---

## Architecture

```
nginx (:80)
  ├── /api/*  →  backend:8000  (Django + Gunicorn)
  │                 ├── /api/v1/auth/login/   (login_view → {token, clinic_name})
  │                 └── /api/v1/patients/     (PatientViewSet — clinic-scoped, paginated)
  └── /*      →  frontend:80   (React SPA via nginx proxy)

Database: PostgreSQL 15
  └── Tables: auth_user, clinic_user, clinic_clinic,
              clinic_patient, clinic_clinician,
              clinic_appointment, clinic_appointmentclinician,
              authtoken_token
```

---

## Scope Decisions (Intentional, Not Gaps)

- **`Clinician` is not `User`** — Clinicians are staff records attached to appointments. Users are login accounts scoped to a clinic. These are deliberately separate models. The merge of Clinician into User is future scope, not an oversight. Do not conflate them.

## Known Gaps (Do Not Fix Without Explicit Instruction)

- **No patient-level access control** — Any user at the clinic can edit or delete any patient. There is no per-record ownership within a clinic.
- **`SECRET_KEY` has a dev fallback** — Reads from env; the hardcoded fallback is for local development only. Must use a strong secret in any real deployment.

---

## Deliberate Decisions (Not Mistakes)

- **No signup** — assessment scope is login + patient management only. Accounts created via `manage.py seed` or Django admin.
- **`Clinician` separate from `User`** — clinicians on appointments are staff records; login accounts are scoped to a clinic. Two different concepts, kept separate by design.
- **Token auth over JWT** — DRF `authtoken` is simpler, stateless enough for a SPA, and avoids refresh token complexity that is out of scope here.
- **Pagination** — `PageNumberPagination` with page size 10. Visible in the UI once you add more than 10 patients.

---

## References

- Models: `backend/clinic/models.py`
- Views: `backend/clinic/views.py`
- Serializers: `backend/clinic/serializers.py`
- Root URLs: `backend/config/urls.py`
- Seed command: `backend/clinic/management/commands/seed.py`
- Docker entrypoint: `backend/entrypoint.sh`
- API client: `frontend/src/api/client.ts`
- Patient API: `frontend/src/api/patients.ts`
- Types: `frontend/src/types/index.ts`
- Toast utilities: `frontend/src/lib/toast.ts`
- Error utilities: `frontend/src/utils/error.ts`
- CI pipeline: `.github/workflows/ci.yml`
