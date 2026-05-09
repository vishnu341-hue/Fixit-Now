import { createContext, useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getOAuthCallbackMessage } from '../services/authMessages'
import { ensureUserProfile } from '../services/profileService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authMessage, setAuthMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Helper to safely clear loading state with logging
  const clearLoading = useCallback((source) => {
    console.log(`[AuthContext] Clearing loading state from: ${source}`);
    setIsLoading(false);
  }, []);
  
  console.log("--- AUTHPROVIDER RENDER ---");
  console.log("SESSION:", session);
  console.log("USER:", user);
  console.log("CURRENT URL:", window.location.href);
  console.log("LOCAL STORAGE:", { ...localStorage });
  
  // Debug log for context mounting
  useEffect(() => {
    console.log('[AuthContext] Provider mounted');
    console.log('[AuthContext] Current URL:', window.location.href);
  }, []);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser?.id) {
      console.log('[AuthContext] No user ID to load profile');
      setProfile(null)
      return null
    }

    console.log('[AuthContext] Loading profile for:', authUser.id);
    try {
      // We wrap the profile fetch but we DON'T want it to block the main app flow
      const currentProfile = await ensureUserProfile(authUser)
      console.log('[AuthContext] Profile loaded successfully');
      setProfile(currentProfile)
      return currentProfile
    } catch (error) {
      console.error('[AuthContext] Failed to load profile:', error.message)
      // Even if profile fails, we don't throw - we want the app to continue
      setProfile(null)
      return null
    }
  }, [])

  const initialCallbackMessage = useMemo(() => getOAuthCallbackMessage(window.location.href), [])

  useEffect(() => {
    let isMounted = true

    // Set error messages from URL if present
    if (initialCallbackMessage) {
      setAuthMessage(initialCallbackMessage)
    }

    // Global safety timeout - NO MATTER WHAT, clear loading after 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('[AuthContext] Global safety timeout reached! Forcing loading to false.');
        clearLoading('safety-timeout');
      }
    }, 8000);

    // Auto-clear auth message after 3 seconds
    let messageTimer;
    if (authMessage) {
      messageTimer = setTimeout(() => {
        if (isMounted) setAuthMessage('');
      }, 2500);
    }

    // Initialize session
    const initSession = async () => {
      console.log('[AuthContext] Initializing session...');
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthContext] getSession error:', error);
          throw error;
        }

        if (!isMounted) return

          if (initialSession) {
            console.log('[AuthContext] Initial session found');
            setSession(initialSession)
            setUser(initialSession.user)
            
            // Load profile in the background - DO NOT wait for it to finish before clearing loading
            loadProfile(initialSession.user).finally(() => {
              console.log('[AuthContext] Background profile load complete');
            })

            // Clear loading immediately if we have a session
            clearLoading('initSession-with-session');
          } else {
          // If no session yet, check if we are on a callback path
          const isCallback = window.location.pathname === '/auth/callback' || 
                           window.location.hash.includes('access_token=')
          
          if (!isCallback) {
            console.log('[AuthContext] No session and not on callback');
            clearLoading('initSession-no-session');
          } else {
            console.log('[AuthContext] On callback path, waiting for onAuthStateChange to handle login...');
            // We wait a bit for onAuthStateChange, but we have the global timeout as backup
          }
        }
      } catch (error) {
        console.error('[AuthContext] Session init exception:', error)
        if (isMounted) clearLoading('initSession-exception');
      }
    }

    initSession()

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log(`[AuthContext] onAuthStateChange event: ${event}`);
        
        if (!isMounted) return

        setSession(nextSession)
        const nextUser = nextSession?.user ?? null
        setUser(nextUser)

        try {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (nextUser) {
              console.log('[AuthContext] User signed in/updated, loading profile in background...');
              // Load profile but don't block the UI transition
              loadProfile(nextUser).finally(() => {
                console.log('[AuthContext] Background profile load complete from onAuthStateChange');
              })
            }
          } else if (event === 'SIGNED_OUT') {
            setProfile(null)
          }
        } catch (error) {
          console.error('[AuthContext] Auth state change handler error:', error)
        } finally {
          // If we got ANY auth event during initialization, we should probably stop loading
          if (isMounted) clearLoading(`onAuthStateChange-${event}`);
        }
      },
    )

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout);
      if (messageTimer) clearTimeout(messageTimer);
      authListener?.subscription?.unsubscribe()
    }
  }, [loadProfile, initialCallbackMessage])

  // Cleanup URL separately to not block initialization
  useEffect(() => {
    // Only clean up if we are NOT loading and (we have a session OR it's been a while)
    const isCallback = 
      window.location.pathname === '/auth/callback' || 
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('error=')

    if (isCallback && !isLoading) {
      console.log('[AuthContext] Session check complete, cleaning up URL...');
      const timer = setTimeout(() => {
        // Keep the hash if it's not auth related (unlikely here but good practice)
        // For Supabase, we want to clear the auth fragments
        window.history.replaceState({}, document.title, window.location.pathname === '/auth/callback' ? '/' : window.location.pathname)
        console.log('[AuthContext] URL cleaned');
      }, 1000) // Give it a full second to ensure all listeners got the data
      return () => clearTimeout(timer)
    }
  }, [isLoading, session])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      authMessage,
      isLoading,
      setProfile,
      setAuthMessage,
    }),
    [authMessage, isLoading, profile, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
