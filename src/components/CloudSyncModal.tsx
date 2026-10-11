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
      setStatusMsg({ text: url ? 'Supabase credentials connected successfully.' : 'Switched to offline local storage.' });
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
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        setCurrentUser(data.user?.email || email);
        setStatusMsg({ text: 'Account created! Please check your email to confirm if email confirmations are enabled.' });
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setCurrentUser(data.user?.email || email);
        setStatusMsg({ text: `Signed in as ${data.user?.email}` });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMsg({ text: error.message || 'Authentication failed', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const client = storage.getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setCurrentUser(null);
      setStatusMsg({ text: 'Signed out. Operating in private local storage.' });
    }
  };

  const sqlSchema = `-- Supabase Schema for Muhasabah
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  net_energy INT DEFAULT 0,
  balance_type TEXT,
  istighfar_count INT DEFAULT 0,
  summary_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS bedtime_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  wudu_done BOOLEAN DEFAULT FALSE,
  salatul_wudu_done BOOLEAN DEFAULT FALSE,
  falaq_count INT DEFAULT 0,
  nas_count INT DEFAULT 0,
  ikhlas_count INT DEFAULT 0,
  right_side_posture BOOLEAN DEFAULT FALSE,
  head_covered BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bedtime_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own logs" ON daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own bedtime" ON bedtime_checks FOR ALL USING (auth.uid() = user_id);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1E2D44] bg-[#0C1524] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F1ECE1]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#064E3B]/30 text-[#059669] border border-[#064E3B]">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-[#F1ECE1]">
              Cloud Sync & Privacy Settings
            </h3>
            <span className="text-xs text-[#94A3B8]">
              Supabase PostgreSQL & Row-Level Security
            </span>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMsg.isError
                ? 'bg-[#E11D48]/15 border border-[#E11D48]/40 text-[#E11D48]'
                : 'bg-[#064E3B]/20 border border-[#059669]/40 text-[#059669]'
            }`}
          >
            {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mb-4 rounded-lg border border-[#1E2D44] bg-[#070D18] p-3 text-xs text-[#94A3B8] flex items-start gap-2">
          <Lock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F1ECE1]">Zero Public Exposure:</strong> With Supabase Row-Level Security (RLS), your spiritual self-reckonings and bedtime entries are cryptographically locked to your authenticated user ID.
          </div>
        </div>

        {/* Current User State if Logged In */}
        {currentUser ? (
          <div className="mb-4 rounded-lg border border-[#064E3B] bg-[#064E3B]/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-medium text-[#F1ECE1]">Logged in as {currentUser}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-[#E11D48] hover:underline"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          currentConfig.isConnected && (
            <div className="mb-5 rounded-lg border border-[#1E2D44] bg-[#070D18] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#F1ECE1]">
                  {authMode === 'signin' ? 'Sign In to Your Account' : 'Create New Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-[#C5A059] hover:underline"
                >
                  {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-[#1E2D44] bg-[#0C1524] px-3 py-2 text-xs text-[#F1ECE1] placeholder-[#94A3B8]/50 focus:border-[#C5A059] focus:outline-none"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-[#1E2D44] bg-[#0C1524] px-3 py-2 text-xs text-[#F1ECE1] placeholder-[#94A3B8]/50 focus:border-[#C5A059] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded bg-[#064E3B] border border-[#059669] py-2 text-xs font-semibold text-[#F1ECE1] hover:bg-[#064E3B]/80 transition-colors"
                >
                  {isSubmitting ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            </div>
          )
        )}

        {/* Supabase URL & Anon Key Configuration */}
        <form onSubmit={handleSaveConfig} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#F1ECE1] mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded border border-[#1E2D44] bg-[#070D18] px-3 py-2 text-xs text-[#F1ECE1] font-mono placeholder-[#94A3B8]/50 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F1ECE1] mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full rounded border border-[#1E2D44] bg-[#070D18] px-3 py-2 text-xs text-[#F1ECE1] font-mono placeholder-[#94A3B8]/50 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="text-xs text-[#94A3B8] hover:text-[#C5A059] underline"
            >
              {showSql ? 'Hide SQL Schema' : 'View Supabase SQL Schema'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-[#C5A059] px-4 py-2 text-xs font-bold text-[#070D18] hover:bg-[#D4AF37] transition-colors"
            >
              {isSubmitting ? 'Testing...' : 'Save & Connect'}
            </button>
          </div>
        </form>

        {/* SQL Schema helper */}
        {showSql && (
          <div className="mt-4 rounded border border-[#1E2D44] bg-[#070D18] p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>Run this in your Supabase SQL Editor:</span>
              <button
                onClick={copySqlToClipboard}
                className="flex items-center gap-1 text-[#C5A059] hover:underline"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="max-h-40 overflow-y-auto font-mono text-[10px] text-[#94A3B8] bg-[#0C1524] p-2 rounded">
              {sqlSchema}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
