import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Fan, Lightbulb } from 'lucide-react';
import { getElectricianServices } from '../services/serviceService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';

const iconByName = {
  fan: Fan,
  light: Lightbulb,
};

const getTomorrowDate = () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().split('T')[0];
};

const ElectricianServices = ({ onBack }) => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadElectricianServices = async () => {
      setIsLoading(true);
      try {
        const rows = await getElectricianServices();
        setServices(rows);
      } catch (error) {
        console.error('Failed to load electrician services:', error.message);
        setStatusMessage('Unable to load live services right now. Showing available options.');
      } finally {
        setIsLoading(false);
      }
    };

    loadElectricianServices();
  }, []);

  const electricianServices = useMemo(() => services, [services]);

  const handleBook = async (service) => {
    if (!user?.id) {
      setStatusMessage('Log in to place a booking.');
      return;
    }

    if (!service.id || String(service.id).startsWith('fallback-')) {
      setStatusMessage('Booking is temporarily unavailable. Please try again shortly.');
      return;
    }

    try {
      const bookingDate = getTomorrowDate();
      const bookingTime = '11:00 AM';

      await createBooking({
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        bookingDate,
        bookingTime,
        notes: `Booked ${service.name}`,
      });
      setStatusMessage(`Booking created for ${service.name}.`);
    } catch (error) {
      console.error('Failed to create booking:', error.message);
      setStatusMessage('Could not create booking right now. Please try again shortly.');
    }
  };

  return (
    <div className="py-1">
      <header className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <h2 className="text-2xl font-bold text-white/90">Electrician Services</h2>
        <p className="mt-1 text-sm text-white/55">Choose a service to continue your booking.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 gap-3"
      >
        {isLoading ? <p className="text-sm text-white/65">Loading services...</p> : null}

        {electricianServices.map((service, index) => {
          const Icon =
            iconByName[(service.name ?? '').toLowerCase().includes('fan') ? 'fan' : 'light'];

          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => handleBook(service)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface-lighter via-surface to-surface-darker p-5 text-left shadow-soft transition"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl transition-colors group-hover:bg-primary-electric/20" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary-electric">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-white/95">{service.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{service.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
      {statusMessage ? (
        <p className="mt-4 text-sm text-primary-electric">{statusMessage}</p>
      ) : null}
    </div>
  );
};

export default ElectricianServices;
