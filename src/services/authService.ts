/**
 * Authentication Service
 * Connected to live Supabase Authentication with session persistence,
 * Email/Password credentials, and Email Confirmation verification.
 */

import { supabase } from './supabaseClient';
import { storage } from './storageService';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'muhasaba_auth_user_v1';

function formatAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please verify and try again.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email has not been confirmed yet. Please check your inbox for the confirmation link.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many requests. Please wait a minute before requesting another email.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  return msg;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initUser();
    this.setupSupabaseListener();
  }

  private initUser() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private setupSupabaseListener() {
    // Check initial active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.setUserFromSupabase(session.user);
      } else {
        // If Supabase has no active session, purge any ghost user from localStorage!
        if (this.currentUser) {
          this.currentUser = null;
          localStorage.removeItem(AUTH_STORAGE_KEY);
          this.notify();
        }
      }
    });

    // Listen to real-time auth state changes (e.g. when user clicks confirmation link in email)
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.setUserFromSupabase(session.user);
        if (event === 'SIGNED_IN') {
          storage.syncWithCloud();
        }
      } else {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        storage.clearUserCache();
        this.notify();
      }
    });
  }

  private setUserFromSupabase(user: User) {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0],
      createdAt: user.created_at,
    };
    this.currentUser = authUser;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch {}
    this.notify();
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isGuest(): boolean {
    return this.currentUser === null;
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  /**
   * Check if an active session exists (useful after user clicks email confirmation button)
   */
  public async checkSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.setUserFromSupabase(session.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Email and Password Sign-in
   */
  public async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; requiresVerification?: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
        return {
          success: false,
          requiresVerification: isUnconfirmed,
          error: formatAuthError(error.message),
        };
      }

      if (data.session?.user) {
        this.setUserFromSupabase(data.session.user);
        return { success: true };
      }

      return { success: false, error: 'No active session established.' };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err.message || 'Authentication failed.') };
    }
  }

  /**
   * Email and Password Sign-up
   * Returns requiresVerification: true if Supabase requires email link confirmation.
   */
  public async signUp(
    email: string,
    password: string
  ): Promise<{ success: boolean; requiresVerification?: boolean; error?: string; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        return { success: false, error: formatAuthError(error.message) };
      }

      // If Supabase immediately returned a session (confirm email disabled)
      if (data.session?.user) {
        this.setUserFromSupabase(data.session.user);
        return { success: true, requiresVerification: false };
      }

      // Email confirmation required (Supabase sent confirmation link email)
      return {
        success: true,
        requiresVerification: true,
        message: 'A confirmation link has been sent to your email.',
      };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err.message || 'Sign-up failed.') };
    }
  }

  /**
   * Resend signup confirmation email
   */
  public async resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email is required to resend confirmation.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        return { success: false, error: formatAuthError(error.message) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err.message || 'Failed to resend confirmation email.') };
    }
  }

  /**
   * Sign Out
   */
  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    storage.clearUserCache();
    this.notify();
  }
}

export const auth = new AuthService();
