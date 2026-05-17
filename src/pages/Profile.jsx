import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, LogOut, Mail, UserRound, Phone, MapPin, LocateFixed, Loader2, X } from 'lucide-react';
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
  const { user, profile, setProfile, setAuthMessage } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const handleClose = () => {
    const homeTab = Array.from(document.querySelectorAll('nav button, button')).find(
      (btn) => btn.textContent && btn.textContent.trim().toLowerCase() === 'home'
    );
    if (homeTab) {
      homeTab.click();
    }
  };
  const [editableEmail, setEditableEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Clear local status message after 2.5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Sync fields when profile loads, but only if not currently editing
  // We use a separate state to track if we've initialized the form to avoid loops
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (profile && !isEditing && !hasInitialized) {
      setTimeout(() => {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
        setEditableEmail(profile.email || user?.email || '');
        setHasInitialized(true);
      }, 0);
    } else if (user?.email && !fullName && !isEditing && !hasInitialized) {
      setTimeout(() => {
        setFullName(user.email.split('@')[0]);
        setEditableEmail(user.email);
        setHasInitialized(true);
      }, 0);
    }
  }, [profile, user, isEditing, hasInitialized, fullName]);

  // Reset initialization when profile changes significantly (e.g. login/logout)
  useEffect(() => {
    if (!profile && !user) {
      setTimeout(() => setHasInitialized(false), 0);
    }
  }, [profile, user]);

  const isAuthenticated = Boolean(user?.id);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthMessage('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signUpWithEmail({ email, password });
        setStatusType('success');
        setStatusMessage('Account created successfully! Please check your email to verify your account.');
        setIsSignupSuccess(true);
      } else {
        await signInWithEmail({ email, password });
        setStatusType('success');
        setStatusMessage('Logged in successfully!');
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatusType('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.display_name) {
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            const road = data.address?.road || '';
            const postalCode = data.address?.postcode || '';
            
            const parts = [road, city, state, postalCode].filter(Boolean);
            const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
            
            setAddress(formattedAddress);
            setStatusType('success');
            setStatusMessage('Location updated.');
          } else {
            setAddress(`${latitude}, ${longitude}`);
            setStatusType('success');
            setStatusMessage('Coordinates fetched.');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setAddress(`${latitude}, ${longitude}`);
          setStatusType('success');
          setStatusMessage('Coordinates fetched.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setStatusType('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatusMessage('Location permission denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            setStatusMessage('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setStatusMessage('Location request timed out.');
            break;
          default:
            setStatusMessage('An unknown error occurred getting location.');
            break;
        }
      },
      { timeout: 10000 }
    );
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
        className="relative w-full rounded-[1.75rem] border border-white/10 bg-surface/90 p-5 shadow-soft backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-all z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="mt-1.5 text-xl font-bold text-white">
            {isAuthenticated
              ? `Hi, ${profile?.full_name ?? user?.email?.split('@')[0] ?? 'there'}`
              : isSignupSuccess
                ? 'Verify Your Email'
                : isSignup
                  ? 'Create your account'
                  : 'Welcome'}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {isAuthenticated
              ? 'Manage your account details and session.'
              : isSignupSuccess
                ? 'Please verify your email address to complete registration.'
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
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm placeholder:text-white/45 transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
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
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm placeholder:text-white/45 transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
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
                  placeholder="+91 98765 43210"
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm placeholder:text-white/45 transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
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
                  className={`w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-12 text-sm placeholder:text-white/45 transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40 ${
                    isEditing ? 'text-white' : 'text-white/60'
                  }`}
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-primary-electric hover:bg-primary/10 transition-colors disabled:opacity-50"
                    title="Use current location"
                  >
                    {isLocating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LocateFixed size={16} />
                    )}
                  </button>
                )}
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
                    className="flex-[2] rounded-2xl bg-gradient-to-r from-primary to-primary-electric py-3 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(0,229,255,0.45)] hover:opacity-95 transition-opacity disabled:opacity-60"
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
        ) : isSignupSuccess ? (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary-electric">
              <CheckCircle2 size={48} className="text-primary-electric animate-pulse" />
            </div>
            <p id="x2m7qp" className="text-sm font-semibold text-white px-2 leading-relaxed">
              Account created successfully! Please check your email to verify your account.
            </p>
            <p id="u5k9ra" className="text-xs text-white/50">
              Check spam folder if you don't see the email.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignupSuccess(false);
                setIsSignup(false); // Switch to login tab
                setEmail(''); // Clear email
              }}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-primary to-primary-electric py-3 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(0,229,255,0.45)] hover:opacity-95 transition-opacity"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-white/35">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Tab Bar to choose login method */}
            <div className="mb-6 flex rounded-2xl bg-background/80 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setStatusMessage('');
                  setIsSignupSuccess(false);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  !isSignup
                    ? 'bg-gradient-to-r from-primary to-primary-electric text-white shadow-soft'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign In
              </button>
              <button
                id="p6x3qm"
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setStatusMessage('');
                  setIsSignupSuccess(false);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  isSignup
                    ? 'bg-gradient-to-r from-primary to-primary-electric text-white shadow-soft'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
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
                    className="w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40"
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
                    className="w-full rounded-2xl border border-white/10 bg-background/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary/40"
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-electric py-3 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(0,229,255,0.45)] hover:opacity-95 transition-opacity disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isSignup ? 'Creating Account...' : 'Logging in...'}
                  </>
                ) : (
                  isSignup ? 'Sign Up' : 'Login'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup((previous) => !previous);
                  setIsSignupSuccess(false);
                }}
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
