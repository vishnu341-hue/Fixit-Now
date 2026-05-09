import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, LogOut, Mail, UserRound, Phone, MapPin } from 'lucide-react';
import {
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  updateUserEmail,
} from '../services/authService';
import { getAuthErrorMessage } from '../services/authMessages';
import { updateUserProfile } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, profile, setProfile, authMessage, setAuthMessage } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Clear local status message after 2.5 seconds
  React.useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Sync fields when profile loads, but only if not currently editing
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setEditableEmail(profile.email || user?.email || '');
    } else if (user?.email && !fullName && !isEditing) {
      setFullName(user.email.split('@')[0]);
      setEditableEmail(user.email);
    }
  }, [profile, user, isEditing]);

  const isAuthenticated = Boolean(user?.id);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthMessage('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signUpWithEmail({ email, password });
      } else {
        await signInWithEmail({ email, password });
      }
      setPassword('');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    console.log("--- STARTING GOOGLE AUTH ---");
    console.log("CURRENT URL:", window.location.href);
    setAuthMessage('');
    setStatusMessage('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      console.log("--- GOOGLE AUTH CALL RETURNED ---");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(error.message || JSON.stringify(error));
      setStatusType('error');
      setStatusMessage(error.message || "Authentication failed");
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setStatusType('error');
      setStatusMessage('Enter your email before requesting a reset link.');
      return;
    }
    try {
      await requestPasswordReset(email);
      setStatusType('success');
      setStatusMessage('Password reset link sent.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(getAuthErrorMessage(error));
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    setStatusMessage('');
    setAuthMessage(''); // Clear any auth messages to avoid confusion

    try {
      // 1. Update Auth Email if changed
      if (editableEmail !== user.email) {
        await updateUserEmail(editableEmail);
      }

      // 2. Update Profiles Table
      const updated = await updateUserProfile(user.id, { 
        full_name: fullName,
        phone: phone,
        address: address,
        email: editableEmail // Also update email in profiles table
      });
      
      setProfile(updated);
      if (editableEmail !== user.email) {
        setAuthMessage('Profile saved. Please check your new email for verification.');
      }
      setIsEditing(false); // Switch back to view mode and show "Edit Profile" button
      
    } catch (error) {
      console.error('Profile update failed:', error);
      setStatusType('error');
      setStatusMessage(`Error: ${error.message || 'Could not update your profile'}`);
      // Keep isEditing(true) so user doesn't lose their changes on failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setStatusMessage('');
    try {
      await signOutUser();
      setStatusType('success');
      setStatusMessage('Logged out.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-start justify-center py-2">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-[1.75rem] border border-white/10 bg-surface/90 p-5 shadow-soft backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="mt-1.5 text-xl font-bold text-white">
            {isAuthenticated
              ? `Hi, ${profile?.full_name ?? user?.email?.split('@')[0] ?? 'there'}`
              : isSignup
                ? 'Create your account'
                : 'Welcome'}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {isAuthenticated
              ? 'Manage your account details and session.'
              : isSignup
                ? 'Sign up to book trusted professionals fast.'
                : 'Log in to explore more'}
          </p>
        </div>

        {isAuthenticated ? (
          <form className="space-y-4" onSubmit={handleProfileUpdate}>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                Email
              </span>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type="email"
                  value={editableEmail}
                  onChange={(event) => setEditableEmail(event.target.value)}
                  disabled={!isEditing}
                  placeholder="your@email.com"
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
                    isEditing ? 'text-white' : 'text-white/60'
                  }`}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                Full Name
              </span>
              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={!isEditing}
                  placeholder="Your full name"
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
                    isEditing ? 'text-white' : 'text-white/60'
                  }`}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                Phone Number
              </span>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
                    isEditing ? 'text-white' : 'text-white/60'
                  }`}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                Location / Address
              </span>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  disabled={!isEditing}
                  placeholder="Street, City, Zip"
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
                    isEditing ? 'text-white' : 'text-white/60'
                  }`}
                />
              </div>
            </label>

            <div className="flex flex-col gap-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile?.full_name || user?.email?.split('@')[0] || '');
                      setPhone(profile?.phone || '');
                      setAddress(profile?.address || '');
                      setEditableEmail(profile?.email || user?.email || '');
                      setStatusMessage('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] rounded-2xl bg-gradient-to-r from-primary to-primary-electric py-3 text-sm font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,229,255,0.95)] hover:opacity-95 transition-opacity disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setStatusMessage('');
                  }}
                  className="w-full rounded-2xl border border-primary/30 bg-primary/10 py-3 text-sm font-bold text-primary-electric hover:bg-primary/20 transition-all"
                >
                  Edit Profile
                </button>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSubmitting || isEditing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors disabled:opacity-60"
            >
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-white/35">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                  Email
                </span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/35">
                  Password
                </span>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                  />
                  <input
                    type="password"
                    placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40"
                  />
                </div>
                {!isSignup && password.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="mt-2 text-xs font-semibold text-primary-electric hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-electric py-3 text-sm font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,229,255,0.95)] hover:opacity-95 transition-opacity disabled:opacity-60"
              >
                {isSignup ? 'Sign Up' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignup((previous) => !previous)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div
              key={statusMessage}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl p-3 text-center text-xs font-medium backdrop-blur-md ${
                statusType === 'error'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  : 'bg-primary/10 text-primary-electric border border-primary/20 shadow-[0_8px_20px_-10px_rgba(0,229,255,0.3)]'
              }`}
            >
              {statusType === 'success' && (
                <CheckCircle2 size={14} className="text-primary-electric" />
              )}
              <span className="leading-relaxed">
                {statusMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
};

export default Profile;
