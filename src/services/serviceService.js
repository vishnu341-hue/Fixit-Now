import { supabase } from '../lib/supabaseClient'

export const DEFAULT_ELECTRICIAN_SERVICES = [
  {
    id: 'fallback-fan-repair',
    name: 'Fan Repair',
    description: 'Ceiling and wall fan troubleshooting, repair, and safe rewiring.',
    category: 'electrician',
    keywords: ['fan', 'repair', 'electrician'],
    isFallback: true,
  },
  {
    id: 'fallback-tube-light-fixing',
    name: 'Tube Light Fixing',
    description: 'Tube light fitting, starter/choke replacement, and wiring fixes.',
    category: 'electrician',
    keywords: ['tube light', 'light fixing', 'electrician'],
    isFallback: true,
  },
]

export const getServices = async ({ search } = {}) => {
  let query = supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })

  const trimmedSearch = search?.trim()

  if (trimmedSearch) {
    query = query.or(
      `name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`,
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export const getElectricianServices = async () => {
  try {
    const rows = await getServices({ search: 'electric' })
    const electricianRows = rows.filter((service) =>
      (service.category ?? '').toLowerCase().includes('electric'),
    )

    if (electricianRows.length > 0) {
      return electricianRows
    }

    return DEFAULT_ELECTRICIAN_SERVICES
  } catch {
    return DEFAULT_ELECTRICIAN_SERVICES
  }
}
