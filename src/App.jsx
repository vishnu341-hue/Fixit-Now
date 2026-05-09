import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import ElectricianServices from './pages/ElectricianServices';
import BottomNavigation from './components/BottomNavigation';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabaseClient';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { isLoading, user, session, authMessage } = useAuth();

  console.log("--- APP RENDER ---");
  console.log("USER:", user);
  console.log("SESSION:", session);
  console.log("IS LOADING:", isLoading);
  console.log("CURRENT URL:", window.location.href);
  console.log("LOCAL STORAGE:", { ...localStorage });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("APP GET SESSION:", data.session);
    };
    checkSession();

    // Handle redirection from auth callback
    const isCallback = window.location.pathname === '/auth/callback' || 
                      window.location.hash.includes('access_token=');
    
    if (isCallback) {
      console.log("--- IMMEDIATELY AFTER REDIRECT ---");
      console.log("CURRENT URL:", window.location.href);
      setActiveTab('profile');
    }
  }, []);

  useEffect(() => {
    // If we are on the callback path and user is now available, 
    // make sure we are showing the profile tab
    const isCallback = window.location.pathname === '/auth/callback' || 
                      window.location.hash.includes('access_token=');

    if (user?.id && isCallback) {
      setActiveTab('profile');
    }
  }, [user, isLoading]);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            onOpenProfile={() => setActiveTab('profile')}
            onOpenElectricianServices={() => setActiveTab('electrician-services')}
          />
        );
      case 'bookings':
        return <Bookings onBack={() => setActiveTab('home')} />;
      case 'profile':
        return <Profile />;
      case 'electrician-services':
        return <ElectricianServices onBack={() => setActiveTab('home')} />;
      default:
        return (
          <Home
            onOpenProfile={() => setActiveTab('profile')}
            onOpenElectricianServices={() => setActiveTab('electrician-services')}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center p-6 text-center">
          <div className="mb-8 relative">
            <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">Setting things up</h2>
          <p className="text-sm text-white/50 max-w-[280px] mb-8">
            We're preparing your premium experience. This usually takes just a moment.
          </p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="flex flex-col items-center"
          >
            <p className="text-xs text-white/30 mb-4 italic">Taking longer than usual?</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
            >
              Refresh Page
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden border-x border-white/[0.05] bg-gradient-to-b from-surface/75 via-background to-background shadow-[0_24px_60px_-32px_rgba(0,0,0,0.9)] sm:min-h-[100svh] sm:rounded-[2rem] sm:border sm:border-white/10 sm:my-3">
        {/* Main Content Area */}
        <main className="app-scroll flex-1 overflow-y-auto px-4 pt-4 pb-28 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Notification Area */}
        <div className="pointer-events-none absolute bottom-24 left-4 right-4 z-50">
          <AnimatePresence mode="wait">
            {authMessage && (
              <motion.div
                key={authMessage}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="pointer-events-auto flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 p-3 text-center text-xs font-medium text-primary-electric shadow-[0_8px_20px_-10px_rgba(0,229,255,0.3)] backdrop-blur-md"
              >
                <CheckCircle2 size={14} className="text-primary-electric" />
                <span className="leading-relaxed">{authMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Global Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
          <div className="absolute -left-[20%] -top-[10%] h-[45%] w-[70%] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute -right-[20%] bottom-[5%] h-[40%] w-[60%] rounded-full bg-primary-electric/10 blur-[100px]" />
          <div className="absolute left-[20%] top-[36%] h-[36%] w-[36%] rounded-full bg-purple-500/8 blur-[120px]" />
        </div>
      </div>

      {/* Safe Area Top Support (iOS) */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-background/80 backdrop-blur-md z-[100]" />
    </div>
  );
};

export default App;
