-- ====================================================================
-- 005_challenges.sql - Challenge Attempts Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.challenge_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    score NUMERIC NOT NULL DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_user ON public.challenge_attempts(user_id);

ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge attempts"
    ON public.challenge_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge attempts"
    ON public.challenge_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
