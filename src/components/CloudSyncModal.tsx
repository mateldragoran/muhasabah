import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Cloud, Lock, CheckCircle2, AlertCircle, X, Key, Shield, User, Copy } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (isConnected: boolean) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const currentConfig = storage.getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const client = storage.getSupabaseClient();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setCurrentUser(data.user.email);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    const ok = await storage.setSupabaseConfig(url, anonKey);
    setIsSubmitting(false);

    if (ok) {
      onConnectionChange(Boolean(url && anonKey));
      setStatusMsg({ text: url ? 'Supabase connected successfully.' : 'Switched to offline local storage.' });
    } else {
      setStatusMsg({ text: 'Could not connect with provided Supabase parameters. Please verify.', isError: true });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = storage.getSupabaseClient();
    if (!client) {
      setStatusMsg({ text: 'Please connect Supabase Project URL and Key first.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      if (authMode === 'signup') {
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        setStatusMsg({ text: 'Account created! Check your email to confirm registration.' });
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setCurrentUser(email);
        setStatusMsg({ text: 'Signed in successfully. Syncing your records...' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Authentication error', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const client = storage.getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setCurrentUser(null);
      setStatusMsg({ text: 'Signed out.' });
    }
  };

  const sqlSchema = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hijri_date TEXT,
  gateways JSONB NOT NULL DEFAULT '{}'::jsonb,
  prophetic_connection TEXT,
  prophetic_connection_note TEXT,
  transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  net_energy INTEGER NOT NULL DEFAULT 0,
  balance_status TEXT NOT NULL DEFAULT 'balanced',
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

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bedtime_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own bedtime" ON public.bedtime_checks FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bedtime_checks_user_date ON public.bedtime_checks (user_id, date DESC);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#111827] p-6 sm:p-7 shadow-2xl text-[#F9FAFB]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#F9FAFB] p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-[#10B981] border border-emerald-500/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-[#F9FAFB]">
              Cloud Sync & Privacy Settings
            </h3>
            <span className="text-xs text-[#9CA3AF]">
              Supabase PostgreSQL & Row-Level Security
            </span>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs ${
              statusMsg.isError
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-[#10B981]'
            }`}
          >
            {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#0B1120]/70 p-3 text-xs text-[#9CA3AF] flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F9FAFB]">Zero Public Exposure:</strong> With Supabase Row-Level Security (RLS), your spiritual self-reckonings and bedtime entries are cryptographically locked to your authenticated user ID.
          </div>
        </div>

        {/* Current User State if Logged In */}
        {currentUser ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-medium text-[#F9FAFB]">Logged in as {currentUser}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          currentConfig.isConnected && (
            <div className="mb-5 rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#F9FAFB]">
                  {authMode === 'signin' ? 'Sign In to Your Account' : 'Create New Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-[#10B981] hover:underline cursor-pointer"
                >
                  {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-2.5">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:outline-none"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#1F2937]/50 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] py-2.5 text-xs font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          )
        )}

        {/* Supabase Connection Form */}
        <form onSubmit={handleSaveConfig} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#F9FAFB] mb-1">
              Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F9FAFB] mb-1">
              Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 p-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] py-2.5 text-xs font-semibold text-white hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              {isSubmitting ? 'Testing...' : 'Save & Connect'}
            </button>

            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="rounded-xl border border-white/[0.08] bg-[#1F2937]/50 px-3 py-2.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              SQL Schema
            </button>
          </div>
        </form>

        {/* SQL Schema helper */}
        {showSql && (
          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#10B981]">Postgres Schema (RLS)</span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="flex items-center gap-1 text-[11px] text-[#F59E0B] hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0B1120] border border-white/[0.06] text-[10px] text-[#9CA3AF] font-mono overflow-x-auto max-h-40">
              {sqlSchema}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
