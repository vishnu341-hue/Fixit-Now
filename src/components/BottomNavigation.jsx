import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, User } from 'lucide-react';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'bookings', icon: Calendar, label: 'Your Bookings' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const BottomNavigation = ({ activeTab = 'home', onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[120] bg-gradient-to-t from-background via-background/95 to-transparent px-3 pb-3 pt-2">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="glass flex items-center justify-between rounded-3xl border-white/10 p-2 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.9)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className="group relative flex min-w-[72px] flex-1 flex-col items-center justify-center rounded-2xl px-1.5 py-2 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl border border-primary/20 bg-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                size={20} 
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-primary-electric' : 'text-white/40 group-hover:text-white/60'
                }`} 
              />

              <motion.span
                initial={{ opacity: 0.8, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative z-10 mt-1 text-[9px] font-bold transition-colors duration-300 ${
                  isActive ? 'text-primary-electric' : 'text-white/60 group-hover:text-white/80'
                }`}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
        </div>
      </div>
      <div className="safe-area-bottom h-2" />
    </nav>
  );
};

export default BottomNavigation;
