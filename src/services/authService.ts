/**
 * Authentication Service
 * Supports seamless Guest Mode, local mock authentication, and plug-and-play Supabase
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'muhasaba_auth_user_v1';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initUser();
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

  public async signIn(email: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Mock authentication: instantly creates/resumes session
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return { success: true };
  }

  public async signUp(email: string): Promise<{ success: boolean; error?: string }> {
    return this.signIn(email);
  }

  public signOut() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }
}

export const auth = new AuthService();
