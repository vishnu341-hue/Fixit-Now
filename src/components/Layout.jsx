import { useState } from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl ring-1 ring-white/5">
      <Header />
      
      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default Layout;
