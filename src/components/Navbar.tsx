import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate, useLocation } from '../utils/router';
import { ConfigGuideModal } from './ConfigGuideModal';
import { 
  Scan, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus, 
  HelpCircle, 
  ShieldCheck, 
  Menu, 
  X,
  AlertCircle,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, enablePasswordForGoogleAccount } = useAuth();
  const { pathname } = useLocation();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Set Password Modal state for existing Google users
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submittingPass, setSubmittingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!user) return;

    if (newPassword.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPassError('Password must include uppercase, lowercase, and numeric characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmittingPass(true);
    const res = await enablePasswordForGoogleAccount(user.email, newPassword, confirmPassword);
    setSubmittingPass(false);

    if (res.success) {
      setPassSuccess('Dual Authentication Activated! You can now log in using either Google or your new password.');
      setTimeout(() => {
        setShowSetPasswordModal(false);
        setPassSuccess('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } else {
      setPassError(res.error || 'Failed to set password.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Scan className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  SEO AI <span className="text-cyan-400">PRO</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">v3.0</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide italic">ADVANCED SEARCH INTELLIGENCE</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === '/dashboard' || pathname === '/'
                    ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                Dashboard
              </button>
            </nav>

            {/* User Profile / Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Dual Auth Status Badges */}
                  {user.authProvider === 'both' ? (
                    <span 
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                      title="Both Google and Email/Password login are active"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Google + Password
                    </span>
                  ) : user.authProvider === 'google' && !user.hasPassword ? (
                    <button
                      onClick={() => setShowSetPasswordModal(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition shadow-sm"
                      title="Set a password to enable Email/Password login alongside Google"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      Enable Password Login
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}

                  {!user.emailVerified && (
                    <button
                      onClick={() => navigate('/verify-email')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Verify Email
                    </button>
                  )}

                  <div 
                    className="flex items-center gap-2.5 pl-2 border-l border-slate-800"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 object-cover"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-200 leading-tight">
                        {user.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => logout()}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition"
                  >
                    <LogIn className="w-4 h-4 text-indigo-400" />
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-md shadow-indigo-600/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-2 text-cyan-400 hover:bg-slate-900 rounded-lg"
                aria-label="Setup guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3">
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              Dashboard
            </button>



            {user ? (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{user.fullName}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>

                {!user.emailVerified && (
                  <button
                    onClick={() => {
                      navigate('/verify-email');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 rounded-lg"
                  >
                    Verify Email Address
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-200 bg-slate-900 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <ConfigGuideModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />

      {/* Set Password Modal for Logged-In Google Users */}
      {showSetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => {
                setShowSetPasswordModal(false);
                setPassError('');
                setPassSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enable Password Login</h3>
                <span className="text-xs text-slate-400 block truncate max-w-[240px]">
                  Account: {user?.email}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Create an email password to activate <strong>dual authentication</strong>. Once set, you can sign in using either Google or your email and password interchangeably!
            </p>

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSetPasswordModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPass}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-600/25"
                >
                  {submittingPass ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span>Enable Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
