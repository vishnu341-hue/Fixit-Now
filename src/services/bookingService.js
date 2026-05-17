import { supabase } from '../lib/supabaseClient'

export const getUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      service_name,
      booking_date,
      booking_time,
      notes,
      created_at
    `,
    )
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export const createBooking = async ({
  userId,
  serviceId,
  serviceName,
  bookingDate,
  bookingTime,
  notes = '',
}) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      service_id: serviceId,
      service_name: serviceName,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes,
      status: 'pending',
    })
    .select(
      `
      id,
      status,
      service_name,
      booking_date,
      booking_time,
      notes,
      created_at
    `,
    )
    .maybeSingle()

  if (error) throw error
  return data
}
