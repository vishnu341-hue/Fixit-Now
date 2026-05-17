import { useEffect, useState } from 'react';
import { getUserBookings } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import { ChevronLeft } from 'lucide-react';

const Bookings = ({ onBack }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) {
        setBookings([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const rows = await getUserBookings(user.id);
        setBookings(rows);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [user?.id]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col py-1">
      <header className="mb-8 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white/90">Your Bookings</h2>
      </header>

      <div className={`flex flex-1 flex-col space-y-3 ${!user?.id || (user?.id && !isLoading && bookings.length === 0) ? 'justify-center' : ''}`}>
        {!user?.id ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-surface-lighter px-5 py-12 text-center shadow-soft">
            <h3 className="text-lg font-bold text-white/80">Log in to see bookings</h3>
            <p className="mt-2 text-sm text-white/50">Your bookings will appear here</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-surface-lighter px-5 py-12 text-center shadow-soft">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-electric/20 border-t-primary-electric" />
            <h3 className="text-lg font-bold text-white/80">Loading bookings...</h3>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl bg-red-500/10 p-4 text-center border border-red-500/20">
            <p className="text-sm text-red-400 font-medium">{errorMessage}</p>
          </div>
        ) : null}

        {user?.id && !isLoading && bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-surface-lighter px-5 py-12 text-center shadow-soft">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/20">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white/80">No Booking Yet</h3>
            <p className="mt-2 text-sm text-white/50">You haven't scheduled any services yet</p>
          </div>
        ) : null}

        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="rounded-3xl border border-white/10 bg-surface-lighter px-5 py-4 shadow-soft"
          >
            <p className="text-sm font-bold text-white/90">
              {booking.service_name ?? 'Service'}
            </p>
            <p className="mt-1 text-xs text-white/65">
              {booking.booking_date && booking.booking_time
                ? `${booking.booking_date} at ${booking.booking_time}`
                : 'Schedule pending'}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-primary-electric">
              {booking.status}
            </p>
            {booking.notes ? (
              <p className="mt-1 text-xs text-white/55">{booking.notes}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

export default Bookings;
