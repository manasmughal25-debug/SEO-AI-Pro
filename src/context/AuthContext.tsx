import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { navigate } from '../utils/router';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  pendingEmailForVerification: string | null;
  latestDevVerificationCode: string | null;
  clearError: () => void;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ 
    success: boolean; 
    requiresPasswordSetup?: boolean; 
    isGoogleAccount?: boolean;
    email?: string; 
    fullName?: string; 
    message?: string; 
    error?: string;
  }>;
  signup: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    verificationCode?: string;
    dualAuthEnabled?: boolean;
    message?: string;
  }>;
  enablePasswordForGoogleAccount: (email: string, password: string, confirmPassword: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string;
  }>;
  setPasswordInProfile: (password: string, confirmPassword: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string;
  }>;
  sendProfileEmailVerification: () => Promise<{ 
    success: boolean; 
    error?: string; 
    verificationCode?: string; 
    message?: string;
  }>;
  verifyProfileEmail: (code: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string;
  }>;
  loginWithGoogle: (email?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (code: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email?: string) => Promise<{ success: boolean; error?: string; verificationCode?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; resetToken?: string; resetLink?: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'crawllens_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailForVerification, setPendingEmailForVerification] = useState<string | null>(null);
  const [latestDevVerificationCode, setLatestDevVerificationCode] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check existing session on boot
  useEffect(() => {
    async function checkSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (email: string, password: string = '', rememberMe: boolean = false) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        return { 
          success: false, 
          error: errorMsg,
          isGoogleAccount: !!data.isGoogleAccount,
          requiresPasswordSetup: !!data.requiresPasswordSetup,
          email: data.email || email,
          fullName: data.fullName
        };
      }

      // Check if user is an existing Google user who hasn't set an email password yet
      if (data.requiresPasswordSetup) {
        return {
          success: false,
          requiresPasswordSetup: true,
          email: data.email,
          fullName: data.fullName,
          message: data.message
        };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Connection error while logging in.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const enablePasswordForGoogleAccount = async (email: string, password: string, confirmPassword: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/enable-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Failed to set password.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      const msg = err.message || 'Network error while setting password.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signup = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed. Please check inputs.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);

      // If this was an existing Google user, their email was already verified!
      if (data.dualAuthEnabled) {
        return { 
          success: true, 
          dualAuthEnabled: true,
          message: data.message 
        };
      }

      setPendingEmailForVerification(email);
      if (data.verificationCode) {
        setLatestDevVerificationCode(data.verificationCode);
      }
      return { 
        success: true, 
        verificationCode: data.verificationCode 
      };
    } catch (err: any) {
      const msg = err.message || 'Network error during registration.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (googleEmail?: string, fullName?: string) => {
    setError(null);
    try {
      const email = googleEmail || 'manasmughal25@gmail.com';
      const name = fullName || 'Google User';
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: name, avatar })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Google login failed.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error communicating with Google authentication.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (code: string, emailOverride?: string) => {
    setError(null);
    const targetEmail = emailOverride || pendingEmailForVerification || user?.email;
    if (!targetEmail) {
      return { success: false, error: 'No email address found to verify.' };
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code })
      });

      const data = await res.json();
      if (!res.ok) {
        const err = data.error || 'Verification failed.';
        setError(err);
        return { success: false, error: err };
      }

      if (data.user) {
        setUser(data.user);
      } else if (user) {
        setUser({ ...user, emailVerified: true });
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error during email verification.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const resendVerificationCode = async (emailOverride?: string) => {
    const targetEmail = emailOverride || pendingEmailForVerification || user?.email;
    if (!targetEmail) {
      return { success: false, error: 'Email address is missing.' };
    }

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      if (data.verificationCode) {
        setLatestDevVerificationCode(data.verificationCode);
      }
      return { success: true, verificationCode: data.verificationCode };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data.error || 'Failed to process password reset.';
        setError(err);
        return { success: false, error: err };
      }
      return { 
        success: true, 
        resetToken: data.resetToken, 
        resetLink: data.resetLink 
      };
    } catch (err: any) {
      const msg = err.message || 'Connection error during password reset request.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (tokenStr: string, newPassword: string, confirmPassword: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenStr, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data.error || 'Failed to reset password.';
        setError(err);
        return { success: false, error: err };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error while resetting password.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const setPasswordInProfile = async (password: string, confirmPassword: string) => {
    setError(null);
    if (!token) {
      return { success: false, error: 'Authentication required. Please log in.' };
    }
    try {
      const res = await fetch('/api/auth/profile/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password.' };
      }
      if (data.user) {
        setUser(data.user);
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while updating password.' };
    }
  };

  const sendProfileEmailVerification = async () => {
    setError(null);
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const res = await fetch('/api/auth/profile/send-verification', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      if (data.verificationCode) {
        setLatestDevVerificationCode(data.verificationCode);
      }
      return { success: true, verificationCode: data.verificationCode, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const verifyProfileEmail = async (code: string) => {
    setError(null);
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const res = await fetch('/api/auth/profile/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      if (data.user) {
        setUser(data.user);
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Logout error', err);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        pendingEmailForVerification,
        latestDevVerificationCode,
        clearError,
        login,
        signup,
        enablePasswordForGoogleAccount,
        setPasswordInProfile,
        sendProfileEmailVerification,
        verifyProfileEmail,
        loginWithGoogle,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
