# LabVerse Security Architecture, API Audit & Data Privacy Manual

**Last Updated:** September 25, 2026  
**Document Version:** 1.0.0  
**Target Deployment:** Public Educational Virtual Laboratory Platform  

---

## 1. Executive Summary & Threat Model

LabVerse is engineered for public educational access with a **Zero-Trust & Guest-First Defense-in-Depth Architecture**. The platform supports both unauthenticated **Guest Mode** (where 100% of telemetry and sessions remain in local browser `localStorage`) and authenticated **Cloud Sync** via Supabase Postgres.

### Threat Vector Mitigations

| Threat Vector | Severity | Architectural Defense |
|---|---|---|
| **Unauthorized Session Access (IDOR)** | High | Supabase **Row Level Security (RLS)** enforces `auth.uid() = user_id` on all tables. Client-supplied `user_id` values are strictly ignored. |
| **Client Measurement / Report Tampering** | High | Server-side verification engine (`src/lib/simulation/verifier.ts`) re-evaluates physical MNA solver equations before certifying reports or persisting data. |
| **AI Resource Abuse / DoS** | High | Sliding window rate limiting (`src/lib/security/rate-limiter.ts`) enforces 20 req/min per IP on `/api/tutor` and request size limits (<100KB body). |
| **Prompt Injection Attacks** | Medium | Multi-stage regex filtering (`src/lib/security/input-sanitizer.ts`) flags unsafe LLM system prompt override instructions. |
| **Student Data Leakage / PII** | Critical | Zero student real names or school IDs required. All text transmitted to Groq AI is scrubbed via `scrubPII()` before sending. |
| **Cross-Site Scripting (XSS)** | High | HTML/Script tag stripping, React auto-escaping, and CSP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`). |

---

## 2. API Route Classification & Security Policy

| Route | Classification | Auth Required | Input Validation & Limits | Protection Measures |
|---|---|---|---|---|
| `POST /api/tutor` | Public / Guest | No (Guest allowed) | Max 1000 char question; Max 100KB body payload | Sliding window rate limit (20 req/min/IP), HTML sanitization, Prompt injection detection, PII scrubbing, Security headers. |
| `GET /api/session` | Guest / Authenticated | Optional (Bearer Token) | Bounded pagination (`limit` capped at 50) | Returns local guest indicator if unauthenticated; uses server-derived `user.id` when token provided. |
| `POST /api/session` | Guest / Authenticated | Optional (Bearer Token) | Physics simulation re-verification | Verifies simulation calculations server-side; upserts to Supabase RLS table if authenticated. |

---

## 3. Database Schema & Row Level Security (RLS) Policies

Database migration scripts are stored reproducibly in `supabase/migrations/20260925000000_init_schema.sql`.

### Table Summary & RLS Matrix

1. **`public.profiles`**
   - **Columns:** `id (uuid, PK)`, `display_name`, `role ('student' | 'educator' | 'admin')`, `created_at`, `updated_at`.
   - **RLS Policy:** Users can SELECT or UPDATE only where `auth.uid() = id`.

2. **`public.experiment_sessions`**
   - **Columns:** `id (uuid, PK)`, `user_id (uuid, FK profiles)`, `session_id`, `experiment_id`, `schema_version`, `mode`, `parameters (jsonb)`, `components (jsonb)`, `connections (jsonb)`, `last_result (jsonb)`.
   - **RLS Policy:** Users can SELECT, INSERT, UPDATE, DELETE only where `auth.uid() = user_id`.

3. **`public.session_observations`**
   - **Columns:** `id (uuid, PK)`, `session_id (uuid, FK)`, `user_id (uuid, FK)`, `run_index`, `parameters (jsonb)`, `measurements (jsonb)`, `theoretical_values (jsonb)`, `faults_active`, `timestamp`.
   - **RLS Policy:** Users can SELECT, INSERT, DELETE only where `auth.uid() = user_id`.

4. **`public.fault_logs`**
   - **Columns:** `id (uuid, PK)`, `session_id (uuid, FK)`, `user_id (uuid, FK)`, `fault_id`, `action`, `details`, `timestamp`.
   - **RLS Policy:** Users can SELECT, INSERT only where `auth.uid() = user_id`.

5. **`public.experiment_definitions` & `public.knowledge_documents`**
   - **RLS Policy:** Public read-only (`USING (true)`). Writes restricted to admin service key.

---

## 4. Privacy Policy & Student Data Minimization

1. **Zero Mandatory PII:** LabVerse does not collect or require student names, school identifiers, birth dates, or phone numbers.
2. **Local Browser Storage:** In Guest Mode, all session telemetry and observation logs are stored exclusively in the browser's `localStorage` (`labverse_session_v3_*`).
3. **Third-Party AI Inference Disclosures:** When asking questions in the AI Tutor panel, only sanitized apparatus physics measurements and sanitized questions are transmitted to Groq. Email addresses, phone numbers, and SSNs are automatically redacted via `scrubPII()`.
4. **Data Purge Path:** Students can purge all local browser telemetry at any time by clicking **"Privacy & Student Data Security"** $\rightarrow$ **"Purge All Local Data"**.

---

## 5. Security & Verification Audit Results

- **TypeScript Type Safety:** `npx tsc --noEmit` $\rightarrow$ **0 errors**
- **Security Unit Test Suite:** `npx tsx src/lib/security/security.test.ts` $\rightarrow$ **6/6 passed**
- **Simulation Test Suite:** `npx tsx src/lib/simulation/engine.test.ts` $\rightarrow$ **6/6 passed**
- **MNA DC Solver Test Suite:** `npx tsx src/lib/simulation/circuits/dc-solver.test.ts` $\rightarrow$ **5/5 passed**
- **RAG Knowledge Test Suite:** `npx tsx src/lib/ai/rag.test.ts` $\rightarrow$ **5/5 passed**
- **Circuit Document Engine Tests:** `npx tsx src/lib/circuit/circuit-document.test.ts` $\rightarrow$ **6/6 passed**
- **Session & Schema Test Suite:** `npx tsx src/lib/session/session.test.ts` $\rightarrow$ **4/4 passed**
- **Production Next.js Build:** `npm run build` $\rightarrow$ **0 errors, static & dynamic routes compiled cleanly**
