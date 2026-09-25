-- ====================================================================
-- 006_tutor.sql - AI Tutor Sessions & Messages Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.tutor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tutor_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.tutor_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user ON public.tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_session ON public.tutor_messages(session_id);

ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tutor sessions"
    ON public.tutor_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tutor sessions"
    ON public.tutor_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages from own sessions"
    ON public.tutor_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tutor_sessions ts
            WHERE ts.id = tutor_messages.session_id
            AND ts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into own sessions"
    ON public.tutor_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tutor_sessions ts
            WHERE ts.id = tutor_messages.session_id
            AND ts.user_id = auth.uid()
        )
    );
