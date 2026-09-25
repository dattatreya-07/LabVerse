# LabVerse Deployment & Operations Guide

**Last Updated:** September 25, 2026  
**Target Platform:** Vercel (Edge & Serverless Node.js Runtime)  
**Database (Optional):** Supabase Postgres  

---

## 1. Prerequisites & Environment Setup

LabVerse runs in **Guest Mode** by default out of the box with zero required external services. When deploying for public educational use, you can optionally connect **Groq AI** for live LLM tutoring and **Supabase** for user cloud synchronization.

### Environment Variable Checklist

Configure the following environment variables in your hosting provider's dashboard (**Project Settings $\rightarrow$ Environment Variables**):

| Variable Name | Required | Description | Example / Default |
|---|---|---|---|
| `GROQ_API_KEY` | Optional | Server-side API key for Groq LLM inference. | `gsk_...` |
| `GROQ_MODEL` | Optional | Configurable Groq model ID. | `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Public URL for Supabase instance. | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public anonymous API key for browser client. | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-only administrative key for RLS token validation. | `eyJhbGci...` |
| `MAX_PAYLOAD_BYTES` | Optional | Max request payload size limit. | `102400` (100 KB) |

> [!WARNING]  
> NEVER expose `GROQ_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to client-side bundles (do not prefix with `NEXT_PUBLIC_`).

---

## 2. Database Migration Setup (Supabase)

If deploying with Supabase database support:

1. Open your Supabase Dashboard $\rightarrow$ **SQL Editor**.
2. Copy and execute the reproducible SQL schema from [`supabase/migrations/20260925000000_init_schema.sql`](file:///d:/VLAB/supabase/migrations/20260925000000_init_schema.sql).
3. Verify that Row Level Security (RLS) is active on `profiles`, `experiment_sessions`, `session_observations`, and `fault_logs`.
4. Configure allowed site origins under **Authentication $\rightarrow$ URL Configuration $\rightarrow$ Redirect URLs**.

---

## 3. Vercel Deployment Instructions

### Option A: Automatic Git Integration (Recommended)
1. Push your repository to GitHub.
2. Log into [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your `LabVerse` GitHub repository.
4. Set the Framework Preset to **Next.js**.
5. Add environment variables under **Environment Variables**.
6. Click **Deploy**.

### Option B: Vercel CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Preview Build
vercel

# Deploy Production Build
vercel --prod
```

---

## 4. Operational Monitoring & Rollback Procedures

### Health Check & Smoke Testing
After deployment, verify the live deployment:
- App Shell & Dashboard load cleanly without console errors.
- `/api/session` returns `200 OK` with `{ mode: "GUEST_LOCAL" }` or `{ mode: "AUTHENTICATED_CLOUD" }`.
- `/api/tutor` returns rate-limited, sanitized responses.
- PDF reports generate and download cleanly.

### Rollback Procedure
If a regression occurs in production:
1. Navigate to **Vercel Dashboard $\rightarrow$ Deployments**.
2. Select the previous stable deployment.
3. Click **"Instant Rollback"**.
