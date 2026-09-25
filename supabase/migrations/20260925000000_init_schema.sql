-- ====================================================================
-- LabVerse Virtual Laboratory Platform - Schema Migration v1.0.0
-- Security: Row Level Security (RLS) Enabled on All User Tables
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Student Researcher',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EXPERIMENT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.experiment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    schema_version TEXT NOT NULL DEFAULT '1.0.0',
    mode TEXT NOT NULL DEFAULT 'GUIDED',
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_result JSONB,
    completed_steps INT[] DEFAULT ARRAY[1],
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SESSION OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.session_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.experiment_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    run_index INT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
    theoretical_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    faults_active TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FAULT DIAGNOSTICS LOG TABLE
CREATE TABLE IF NOT EXISTS public.fault_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.experiment_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fault_id TEXT NOT NULL,
    fault_title TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INJECTED', 'REPAIRED', 'DIAGNOSED')),
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. READ-ONLY AUTHORITATIVE EXPERIMENT DEFINITIONS
CREATE TABLE IF NOT EXISTS public.experiment_definitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. READ-ONLY GROUNDED KNOWLEDGE CORPUS
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES public.experiment_definitions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    provenance TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_exp ON public.experiment_sessions(user_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_observations_session ON public.session_observations(session_id);
CREATE INDEX IF NOT EXISTS idx_observations_user_time ON public.session_observations(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fault_logs_session ON public.fault_logs(session_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fault_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- RLS: Profiles (Users can read/update only their own profile)
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS: Experiment Sessions (Users manage only their own sessions)
CREATE POLICY "Users can read own sessions"
    ON public.experiment_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON public.experiment_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON public.experiment_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON public.experiment_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- RLS: Session Observations (Users manage only their own observations)
CREATE POLICY "Users can read own observations"
    ON public.session_observations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own observations"
    ON public.session_observations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own observations"
    ON public.session_observations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS: Fault Logs (Users manage only their own fault logs)
CREATE POLICY "Users can read own fault logs"
    ON public.fault_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fault logs"
    ON public.fault_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS: Public Read-Only for Experiment Definitions & Knowledge Corpus
CREATE POLICY "Public read experiment definitions"
    ON public.experiment_definitions FOR SELECT
    USING (true);

CREATE POLICY "Public read knowledge documents"
    ON public.knowledge_documents FOR SELECT
    USING (true);
