import React, { useState, useEffect } from 'react';
import { auth, AuthUser } from '../services/authService';
import { storage } from '../services/storageService';
import {
  X,
  User,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  ChevronLeft,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

type AuthMode = 'signin' | 'signup' | 'awaiting_confirmation';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-sync cloud records when user becomes authenticated and modal is open
  useEffect(() => {
    if (currentUser && isOpen) {
      storage.syncWithCloud().catch((err) => {
        console.warn('Auto cloud sync notice:', err);
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Validation helpers
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  // Reset form errors when switching tabs
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setInfoMessage(null);
  };

  // Sign In Handler
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await auth.signIn(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      setPassword('');
      setConfirmPassword('');
      storage.syncWithCloud();
    } else {
      if (res.requiresVerification) {
        setMode('awaiting_confirmation');
        setResendCooldown(60);
        setInfoMessage('Your email is not confirmed yet. Please click the confirmation link sent to your inbox.');
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await auth.signUp(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.requiresVerification) {
        setMode('awaiting_confirmation');
        setResendCooldown(60);
      } else {
        setPassword('');
        setConfirmPassword('');
        storage.syncWithCloud();
      }
    } else {
      setError(res.error || 'Sign-up failed.');
    }
  };

  // Check if session has been verified
  const handleCheckVerification = async () => {
    setIsCheckingSession(true);
    setError(null);
    setInfoMessage(null);

    const hasSession = await auth.checkSession();
    if (hasSession) {
      setIsCheckingSession(false);
      setInfoMessage('Email verified successfully! Syncing your records...');
      await storage.syncWithCloud();
      return;
    }

    // Try signing in directly if password was kept in memory
    if (email && password) {
      const res = await auth.signIn(email, password);
      setIsCheckingSession(false);
      if (res.success) {
        setInfoMessage('Email confirmed! Welcome to Muhasabah.');
        await storage.syncWithCloud();
      } else {
        setError('Confirmation pending. Please click the button inside your email, then try again.');
      }
    } else {
      setIsCheckingSession(false);
      // Switch to sign in so they can enter password
      handleSwitchMode('signin');
      setInfoMessage('If you clicked the email confirmation link, enter your password to complete sign-in.');
    }
  };

  // Resend Confirmation Email
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    const res = await auth.resendConfirmationEmail(email);
    setIsSubmitting(false);

    if (res.success) {
      setResendCooldown(60);
      setInfoMessage('A fresh confirmation link has been dispatched to your email.');
    } else {
      setError(res.error || 'Failed to resend confirmation email. Please wait a moment.');
    }
  };

  // Manual Sync Button Handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    setError(null);
    setInfoMessage(null);
    const res = await storage.syncWithCloud();
    setIsSyncing(false);

    if (res.success) {
      setInfoMessage(`Cloud sync complete! (${res.syncedCount || 0} records reconciled)`);
    } else {
      setError(res.error || 'Sync failed. Please verify your connection.');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    handleSwitchMode('signin');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#111827] p-6 sm:p-8 shadow-2xl text-[#F9FAFB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sacred Gold hairline banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 rounded-t-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          /* =========================================================================
             1. AUTHENTICATED ACCOUNT & CLOUD SYNC VIEW
             ========================================================================= */
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] border border-emerald-400/30 text-white shadow-lg shadow-emerald-950/40">
              <User className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 id="auth-modal-title" className="font-cinzel text-lg font-bold text-[#F9FAFB]">
                Your Account
              </h3>
              <p className="text-xs text-[#10B981] font-mono break-all">
                {currentUser.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified & Cloud Protected
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0B1120]/70 p-4 text-xs text-[#9CA3AF] leading-relaxed text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span>
                Your daily accounting logs and bedtime protections are protected by Supabase Row-Level Security, isolated strictly to your account.
              </span>
            </div>

            {infoMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-[#10B981] flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Records'}</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : mode === 'awaiting_confirmation' ? (
          /* =========================================================================
             2. CHECK INBOX / EMAIL CONFIRMATION NOTICE BOX
             ========================================================================= */
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#10B981] border border-emerald-400/30 text-white shadow-lg shadow-emerald-950/40">
                <MailCheck className="w-7 h-7" />
              </div>
              <h3 id="auth-modal-title" className="font-cinzel text-xl font-bold text-[#F9FAFB]">
                Check Your Inbox
              </h3>
              <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
                A verification email has been sent to confirm your new account.
              </p>
            </div>

            {/* Email Address Pill with change link */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-white/[0.08]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-xs font-mono text-[#F9FAFB] truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-[11px] text-[#9CA3AF] hover:text-[#10B981] transition-colors cursor-pointer shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            {/* Spiritual Guidance Box */}
            <div className="rounded-2xl border border-emerald-500/25 bg-[#0B1120]/80 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Next Steps to Activate
              </h4>
              <div className="space-y-2 text-xs text-[#9CA3AF] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    1
                  </span>
                  <span>Open your email inbox and locate the message from <strong>Supabase / Muhasabah</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    2
                  </span>
                  <span>Click the <strong className="text-white">"Confirm your mail"</strong> button.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    3
                  </span>
                  <span>Once confirmed, click the button below to complete activation!</span>
                </div>
              </div>
            </div>

            {infoMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={isCheckingSession}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSession ? 'animate-spin' : ''}`} />
                <span>{isCheckingSession ? 'Checking Activation...' : "I've Confirmed My Email"}</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] cursor-pointer"
                >
                  Return to Sign In
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-[11px] text-[#9CA3AF]">
                    Resend link in <span className="font-mono text-amber-400 font-semibold">{resendCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isSubmitting}
                    className="text-xs text-[#10B981] hover:underline font-medium cursor-pointer"
                  >
                    Resend Email
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             3. SIGN IN / SIGN UP MODES
             ========================================================================= */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 id="auth-modal-title" className="font-cinzel text-xl font-bold text-[#F9FAFB]">
                {mode === 'signin' ? 'Sign In to Muhasabah' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {mode === 'signin'
                  ? 'Access your saved reflections and sync across devices.'
                  : 'Start your cloud-backed spiritual accountability ledger.'}
              </p>
            </div>

            {/* Segmented Mode Switcher: Sign In vs Create Account */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#0B1120]/80 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
                }`}
              >
                Create Account
              </button>
            </div>

            {infoMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              noValidate
              autoComplete="off"
              onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
              className="space-y-3.5"
            >
              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (mode === 'signin') {
                          handleSignIn();
                        } else if (mode === 'signup') {
                          handleSignUp();
                        }
                      }
                    }}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 pl-10 pr-3 py-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-[#F9FAFB] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (mode === 'signin') {
                          handleSignIn();
                        } else if (mode === 'signup') {
                          handleSignUp();
                        }
                      }
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 pl-10 pr-10 py-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className={`text-[10px] mt-1 ${isPasswordValid ? 'text-emerald-400' : 'text-[#9CA3AF]'}`}>
                    • Minimum 6 characters required
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#F9FAFB] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSignUp();
                        }
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0B1120]/70 pl-10 pr-10 py-2.5 text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/40 focus:border-emerald-500/50 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && !doPasswordsMatch && (
                    <p className="text-[10px] text-rose-400 mt-1">
                      • Passwords do not match
                    </p>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting || (mode === 'signup' && (!isPasswordValid || !doPasswordsMatch))}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 transition-all shadow-md active:scale-98 disabled:opacity-40 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Please wait...'
                    : mode === 'signin'
                    ? 'Sign In with Password'
                    : 'Create Account & Send Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Switch Link */}
            <div className="text-center pt-1">
              {mode === 'signin' ? (
                <p className="text-xs text-[#9CA3AF]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="text-[#10B981] hover:underline font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#9CA3AF]">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="text-[#10B981] hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.08] text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-[#9CA3AF] hover:text-[#F9FAFB] cursor-pointer transition-colors"
              >
                Continue in Guest Mode (Offline Only)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
