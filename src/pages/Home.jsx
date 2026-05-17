import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, MapPin, Search, UserRound, Wrench, Droplets, PlugZap } from 'lucide-react';
import { getServices } from '../services/serviceService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';

const ServiceNeedCard = ({ icon: Icon, title, description, onSelect }) => (
  <motion.div 
    whileHover={{ scale: 1.01, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (!onSelect) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    }}
    role={onSelect ? 'button' : undefined}
    tabIndex={onSelect ? 0 : undefined}
    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface-lighter via-surface to-surface-darker p-4 shadow-soft ${
      onSelect ? 'cursor-pointer' : ''
    }`}
  >
    <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary-electric/20 transition-colors" />
    <div className="relative z-10 flex flex-col gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary-electric transition-colors group-hover:bg-primary/15">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-base font-bold text-white/95">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
        className="w-fit rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold text-primary-electric hover:bg-primary/20"
      >
        Book Now
      </button>
    </div>
  </motion.div>
);

const iconByCategory = {
  electrician: PlugZap,
  plumbing: Droplets,
  appliance: Wrench,
};

const defaultServices = [
  {
    id: 'default-electrician',
    name: 'Electrician',
    description: 'Electrical repairs, installations, and inspections for your home.',
    category: 'electrician',
    keywords: ['electrician', 'wiring', 'switches', 'lights'],
  },
  {
    id: 'default-ac-and-other-appliances',
    name: 'AC and Other Appliances',
    description: 'AC servicing and appliance setup, troubleshooting, and maintenance.',
    category: 'appliance',
    keywords: ['ac', 'air conditioner', 'appliance', 'maintenance'],
  },
  {
    id: 'default-plumber',
    name: 'Plumber',
    description: 'Pipes, leaks, fittings, drainage, and plumbing support.',
    category: 'plumbing',
    keywords: ['plumber', 'pipes', 'leaks', 'drainage'],
  },
];

const getTomorrowDate = () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().split('T')[0];
};

const Home = ({ onOpenProfile, onOpenElectricianServices }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');
  const [showPlumberNotice, setShowPlumberNotice] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadServices = async () => {
      setIsLoadingServices(true);

      try {
        const rows = await getServices();
        setServices(rows);
      } catch (error) {
        console.error('Failed to load services:', error.message);
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const baseServices = useMemo(() => {
    const servicesByName = new Map(
      services.map((service) => [service.name?.trim().toLowerCase(), service])
    );

    return defaultServices.map((fallbackService) => {
      const matchedService = servicesByName.get(fallbackService.name.toLowerCase());
      return matchedService ? { ...fallbackService, ...matchedService } : fallbackService;
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return baseServices;
    }

    const matches = baseServices.filter((service) =>
      [service.name, service.description, ...(service.keywords ?? [])].some((value) =>
        value?.toLowerCase?.().includes(query)
      )
    );

    // Keep cards visible even when a search has no matches.
    return matches.length > 0 ? matches : baseServices;
  }, [searchQuery, baseServices]);

  const orderedServices = useMemo(() => {
    const serviceOrder = {
      electrician: 0,
      'ac and other appliances': 1,
      plumber: 2,
    };

    return [...filteredServices].sort((a, b) => {
      const aOrder = serviceOrder[a.name?.toLowerCase?.()] ?? Number.MAX_SAFE_INTEGER;
      const bOrder = serviceOrder[b.name?.toLowerCase?.()] ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  }, [filteredServices]);

  const handleBookService = async (service) => {
    const isPlumberService =
      service.name?.toLowerCase() === 'plumber' || service.category?.toLowerCase() === 'plumbing';

    if (isPlumberService) {
      setShowPlumberNotice(true);
      return;
    }

    if (service.name?.toLowerCase() === 'electrician' && onOpenElectricianServices) {
      onOpenElectricianServices();
      return;
    }

    if (!service.id || String(service.id).startsWith('default-')) {
      setBookingMessage('This service will be available for booking soon.');
      return;
    }

    if (!user?.id) {
      setBookingMessage('Please log in to create a booking.');
      return;
    }

    try {
      const bookingDate = getTomorrowDate();
      const bookingTime = '10:00 AM';

      await createBooking({
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        bookingDate,
        bookingTime,
        notes: 'Booked from home page',
      });
      setBookingMessage(`${service.name} booking created.`);
    } catch (error) {
      setBookingMessage(error.message);
    }
  };

  return (
    <div className="py-1">
      {/* Header Area */}
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/20 text-primary-electric">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Location</p>
              <p className="text-sm font-semibold text-white/90">San Francisco, CA</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenProfile}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 hover:bg-white/10"
            aria-label="Open profile"
          >
            <UserRound size={20} className="text-white/80" />
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search services you need..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-primary/40 focus:bg-white/10 focus:ring-2 focus:ring-primary/40"
            aria-label="Search electrician services"
          />
        </div>
      </header>

      {/* Promotional Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-6 overflow-hidden rounded-4xl bg-gradient-to-br from-primary to-primary-dark p-5 shadow-[0_18px_40px_-20px_rgba(29,78,216,0.7)]"
      >
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <h3 className="mb-2 text-lg font-bold text-white">20% OFF</h3>
            <p className="mb-4 max-w-[220px] text-sm text-white/80">
              On your first electrical home inspection
            </p>
            <button className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-md">
              Claim Now
            </button>
          </div>
          <div className="hidden rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-right backdrop-blur-sm sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/70">Today only</p>
            <p className="text-sm font-semibold text-white">Save instantly</p>
          </div>
        </div>
        <div className="absolute -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <Zap className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 w-24 h-24" />
      </motion.div>

      {/* Services You Need */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white/90">Services You Need</h3>
        {bookingMessage ? (
          <p className="text-xs text-primary-electric">{bookingMessage}</p>
        ) : null}

        {isLoadingServices ? (
          <div className="rounded-3xl border border-white/10 bg-surface-lighter px-5 py-6 shadow-soft">
            <p className="text-sm font-semibold text-white/85">Loading services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {orderedServices.map((service) => (
              <ServiceNeedCard
                key={service.id}
                icon={iconByCategory[service.category?.toLowerCase?.()] ?? PlugZap}
                title={service.name}
                description={service.description}
                onSelect={() => handleBookService(service)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPlumberNotice ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl border border-primary/25 bg-gradient-to-br from-surface-lighter to-surface px-4 py-3 shadow-[0_16px_40px_-18px_rgba(29,78,216,0.7)] backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white/90">
                Sorry, we are working on this. It will be enabled soon.
              </p>
              <button
                type="button"
                onClick={() => setShowPlumberNotice(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80 transition-colors hover:border-primary/30 hover:bg-primary/15 hover:text-primary-electric"
              >
                Close
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Home;
