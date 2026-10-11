import React, { useState } from 'react';
import { auth, AuthUser } from '../services/authService';
import { X, User, LogOut, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = mode === 'signin' ? await auth.signIn(email) : await auth.signUp(email);
    setIsSubmitting(false);

    if (res.success) {
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleSignOut = () => {
    auth.signOut();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#E8DFD0] bg-[#FFFFFF] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C5A059]/40 via-[#C5A059] to-[#C5A059]/40 rounded-t-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-xl border border-[#E8DFD0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF7F2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          /* Profile & Sign Out View */
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B]">
              <User className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 id="auth-modal-title" className="font-cinzel text-lg font-bold text-[#1E293B]">
                Your Account
              </h3>
              <p className="text-xs text-[#64748B] font-mono">
                {currentUser.email}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8DFD0] bg-[#FAF7F2] p-4 text-xs text-[#64748B] leading-relaxed text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
              <span>
                Your accounting records, energy balances, and bedtime logs are securely synchronized with this account.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD0] text-xs font-semibold text-[#1E293B] hover:bg-[#F5EFE6] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 id="auth-modal-title" className="font-cinzel text-xl font-bold text-[#1E293B]">
                {mode === 'signin' ? 'Sign In' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {mode === 'signin'
                  ? 'Access your saved accounting history across devices.'
                  : 'Save your daily ledger and history permanently.'}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] pl-10 pr-3 py-2.5 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] pl-10 pr-3 py-2.5 text-xs text-[#1E293B] placeholder-[#64748B]/50 focus:border-[#064E3B] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#064E3B] text-xs font-bold text-white hover:bg-[#043B2C] transition-all shadow-sm active:scale-98 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 border-t border-[#E8DFD0] text-center space-y-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-[#064E3B] font-semibold hover:underline"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] text-[#64748B] hover:text-[#1E293B]"
                >
                  Continue as Guest without signing in
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
