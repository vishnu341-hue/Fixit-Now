import { motion } from 'framer-motion';
import { Bell, MapPin, Search } from 'lucide-react';

const Header = ({ showSearch = true, showNotifications = true }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass px-6 py-4 flex flex-col gap-4 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-electric border border-primary/20">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Location</p>
            <p className="text-sm font-semibold text-white/90">San Francisco, CA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showNotifications && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 relative"
            >
              <Bell size={20} className="text-white/70" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-electric rounded-full border-2 border-[#161618]" />
            </motion.button>
          )}
        </div>
      </div>

      {showSearch && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search for services..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all"
          />
        </motion.div>
      )}
    </header>
  );
};

export default Header;
