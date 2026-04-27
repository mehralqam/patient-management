# Patient Management — Claude Instructions

## Commands

```bash
# Backend
cd backend && python manage.py test          # run all tests
cd backend && python manage.py migrate       # apply migrations
cd backend && python manage.py seed          # seed test data (idempotent)
cd backend && python manage.py makemigrations # generate migrations after model changes

# Frontend
cd frontend && npm run dev                   # dev server (port 5173, proxies /api → 8000)
cd frontend && npx tsc --noEmit             # typecheck

# Docker
docker compose up --build                   # full stack at http://localhost
```

## Architecture

- **Clinic scoping is the core invariant.** `PatientViewSet.get_queryset()` MUST always filter by `request.user.clinic`. Never return all patients globally.
- `perform_create` assigns `clinic=request.user.clinic`. The client never sends a clinic ID.
- Separate read/write serializers: `PatientSerializer` (with nested appointments + `clinic_name`) and `PatientWriteSerializer` (only `first_name`, `last_name`, `date_of_birth`). Never add `clinic` as a writable field.
- Custom `login_view` (not `obtain_auth_token`) — returns `{token, clinic_name}` so the frontend can show clinic name even when the patient list is empty.
- `clinic_name` is stored in `localStorage` at login and cleared on logout/401.

## Key Patterns

- **Form state in PatientModal:** uses `edits` (partial state) merged over `existing` data — no `useEffect` for initialising controlled inputs.
- **React Query:** query key is `['patients', page]` — always include `page` when invalidating or querying patients.
- **Pagination:** DRF `PageNumberPagination`, page size 10. API returns `{count, next, previous, results:[]}`. Frontend manages `page` state in `PatientList`.
- **Auth flow:** token in `localStorage` → `Authorization: Token <token>` header on every request → 401 interceptor clears token + `clinic_name` and redirects to `/login`.
- **Route guards:** `PrivateRoute` in `App.tsx` checks `localStorage.getItem('token')` and redirects to `/login` if absent.
- **Toast notifications:** Use `toasts` from `frontend/src/lib/toast.ts` for success/error feedback. Centralized messages for consistency.
- **API error extraction:** Use `extractApiError` from `frontend/src/utils/error.ts` to parse DRF validation errors.
- **Modals:** Create/edit uses `PatientModal`, delete confirmation uses `ConfirmModal`. No separate routes for forms.

## Code Style

**Django (backend)**
- Type hints on every function and method signature.
- All view methods and serializer fields must be explicitly typed — no implicit `Any`.
- PEP 8 strictly. Max line length 100.

**React / TypeScript (frontend)**
- Functional components only — no class components.
- No `any` in TypeScript. Use proper types or `unknown` with a guard.
- Use `import type` for type-only imports.
- Axios errors are `AxiosError<Record<string, string[]>>` — extract DRF field errors from `error.response.data`, not `error.message`.
- Tailwind v4 via `@tailwindcss/vite` — no `postcss.config.js` needed.

## Architecture Rules

- All HTTP calls MUST go through `frontend/src/api/` — never call `axios` or `fetch` directly inside a component.
- Every Django ViewSet that returns patient data MUST override `get_queryset` to scope by `request.user.clinic`.
- Every Django queryset that serializes nested data MUST use `select_related` or `prefetch_related` — no lazy loading in serializers.
- After any model change, run `makemigrations` and commit the migration file.
- `unique_together` is deprecated — use `UniqueConstraint` in `Meta.constraints`.
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` all read from env vars. Do not hardcode them.
- `DB_PORT` reads from env — default is `5432` (internal Docker port).

## Do Not

- Never use `localStorage` outside `frontend/src/api/client.ts` (auth interceptor) and `frontend/src/components/Login.tsx` (on login). `sessionStorage` is used only for the logout toast flag.
- Never use raw SQL (`cursor.execute`) without a comment explaining why the ORM cannot handle it.
- Never add a clinic ID as a writable field on any serializer — clinic is always assigned server-side from `request.user.clinic`.
- Never call `setForm` or sync state from an effect when initialising a controlled form from fetched data — use the derived state pattern (`edits` merged over `existing`).
- Never add session auth, JWT, or OAuth — token auth only.
- Never add a signup endpoint or registration page — out of scope.
- Never use `window.confirm()` or `window.alert()` — use `ConfirmModal` for confirmations and `toasts` for notifications.

## Testing Conventions

- Backend: use Django `TestCase` for unit tests, `APITestCase` for integration tests.
- Test behaviour, not implementation — assert on HTTP status codes and response data, not on internal function calls.
- Every new ViewSet action that touches patient data needs a corresponding test in `ClinicIsolationTest` verifying a user from Clinic A cannot access Clinic B's data.
- Frontend: TypeScript type check (`tsc --noEmit`) is the minimum. If adding component tests, use React Testing Library — test what the user sees, not component internals.

## Scope Decisions (Intentional, Not Gaps)

- **`Clinician` is not `User`** — Clinicians are staff records on appointments. Users are login accounts scoped to a clinic. These are separate by design. Do not merge without explicit instruction.

## Known Gaps (Do Not Fix Without Being Asked)

- No signup flow — accounts created via `manage.py seed` or Django admin only.
- No per-patient ownership within a clinic — any user at the clinic can edit/delete any patient.

## Test Credentials

Username: `testuser` / Password: `testpass123` (pre-filled on login page after seeding)
