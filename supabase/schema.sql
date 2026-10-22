-- ==============================================================================
-- MUHASABAH: COMPLETE SUPABASE DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS)
-- Inspired by the teachings of Shaykh Nurjan Mirahmadi
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Daily Accounting Records Table (daily_logs)
-- Stores the nightly self-accounting for the 5 Gateways, Prophetic Connection,
-- spiritual transactions, Istighfar, and reflections.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hijri_date TEXT,
    gateways JSONB NOT NULL DEFAULT '{}'::jsonb,
    prophetic_connection TEXT CHECK (prophetic_connection IN ('stronger', 'weaker')),
    prophetic_connection_note TEXT DEFAULT '',
    transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
    net_energy INTEGER NOT NULL DEFAULT 0,
    balance_status TEXT NOT NULL DEFAULT 'balanced' CHECK (balance_status IN ('surplus', 'balanced', 'deficit')),
    istighfar_count INTEGER NOT NULL DEFAULT 0,
    istighfar_target INTEGER NOT NULL DEFAULT 100,
    breath_rounds INTEGER NOT NULL DEFAULT 0,
    reflection_note TEXT DEFAULT '',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_daily_record UNIQUE (user_id, date)
);

-- ------------------------------------------------------------------------------
-- 3. Bedtime Sunnah Protections Table (bedtime_checks)
-- Tracks the traditional Sunnah bedtime supplications and physical protections.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bedtime_checks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    wudu_done BOOLEAN NOT NULL DEFAULT false,
    salatul_wudu_done BOOLEAN NOT NULL DEFAULT false,
    falaq_count INTEGER NOT NULL DEFAULT 0,
    nas_count INTEGER NOT NULL DEFAULT 0,
    ikhlas_count INTEGER NOT NULL DEFAULT 0,
    right_side_posture BOOLEAN NOT NULL DEFAULT false,
    head_covered BOOLEAN NOT NULL DEFAULT false,
    wiped_body BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_bedtime_check UNIQUE (user_id, date)
);

-- ------------------------------------------------------------------------------
-- 4. Custom User Ledger Items Table (user_ledger_items)
-- Allows each user to add personal permanent habits and customize default options.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_ledger_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    category TEXT DEFAULT 'General',
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_item_label UNIQUE (user_id, type, label)
);

-- ------------------------------------------------------------------------------
-- 5. Automatic 'updated_at' Timestamp Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS set_daily_logs_updated_at ON public.daily_logs;
CREATE TRIGGER set_daily_logs_updated_at
    BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bedtime_checks_updated_at ON public.bedtime_checks;
CREATE TRIGGER set_bedtime_checks_updated_at
    BEFORE UPDATE ON public.bedtime_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_ledger_items_updated_at ON public.user_ledger_items;
CREATE TRIGGER set_user_ledger_items_updated_at
    BEFORE UPDATE ON public.user_ledger_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. Enable Row-Level Security (RLS)
-- Strict security: Users can only access their own private spiritual entries.
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bedtime_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ledger_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 7. RLS Policies: daily_logs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own daily_logs" ON public.daily_logs;
CREATE POLICY "Users can view own daily_logs"
    ON public.daily_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily_logs" ON public.daily_logs;
CREATE POLICY "Users can insert own daily_logs"
    ON public.daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily_logs" ON public.daily_logs;
CREATE POLICY "Users can update own daily_logs"
    ON public.daily_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily_logs" ON public.daily_logs;
CREATE POLICY "Users can delete own daily_logs"
    ON public.daily_logs FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. RLS Policies: bedtime_checks
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own bedtime_checks" ON public.bedtime_checks;
CREATE POLICY "Users can view own bedtime_checks"
    ON public.bedtime_checks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bedtime_checks" ON public.bedtime_checks;
CREATE POLICY "Users can insert own bedtime_checks"
    ON public.bedtime_checks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bedtime_checks" ON public.bedtime_checks;
CREATE POLICY "Users can update own bedtime_checks"
    ON public.bedtime_checks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bedtime_checks" ON public.bedtime_checks;
CREATE POLICY "Users can delete own bedtime_checks"
    ON public.bedtime_checks FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. RLS Policies: user_ledger_items
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own ledger items" ON public.user_ledger_items;
CREATE POLICY "Users can view own ledger items"
    ON public.user_ledger_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ledger items" ON public.user_ledger_items;
CREATE POLICY "Users can insert own ledger items"
    ON public.user_ledger_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ledger items" ON public.user_ledger_items;
CREATE POLICY "Users can update own ledger items"
    ON public.user_ledger_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ledger items" ON public.user_ledger_items;
CREATE POLICY "Users can delete own ledger items"
    ON public.user_ledger_items FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date 
    ON public.daily_logs (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_bedtime_checks_user_date 
    ON public.bedtime_checks (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_ledger_items_user_order 
    ON public.user_ledger_items (user_id, sort_order ASC, created_at ASC);
