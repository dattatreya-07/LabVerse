-- ====================================================================
-- 003_experiment_sessions.sql - Experiment Sessions Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.experiment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    experiment_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_sessions_user_domain ON public.experiment_sessions(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_exp_sessions_user_updated ON public.experiment_sessions(user_id, updated_at DESC);

ALTER TABLE public.experiment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiment sessions"
    ON public.experiment_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiment sessions"
    ON public.experiment_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiment sessions"
    ON public.experiment_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiment sessions"
    ON public.experiment_sessions FOR DELETE
    USING (auth.uid() = user_id);
