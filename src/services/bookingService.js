import { supabase } from '../lib/supabaseClient'

export const getUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      scheduled_at,
      notes,
      created_at,
      service:services (
        id,
        name,
        description
      )
    `,
    )
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export const createBooking = async ({
  userId,
  serviceId,
  scheduledAt,
  notes = '',
}) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      notes,
      status: 'pending',
    })
    .select(
      `
      id,
      status,
      scheduled_at,
      notes,
      created_at,
      service:services (
        id,
        name,
        description
      )
    `,
    )
    .maybeSingle()

  if (error) throw error
  return data
}
