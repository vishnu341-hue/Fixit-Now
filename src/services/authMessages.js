const DEFAULT_AUTH_ERROR_MESSAGE =
  'Authentication failed. Please try again in a moment.'

const ERROR_MESSAGE_RULES = [
  {
    test: (message) => message.includes('invalid login credentials'),
    message: 'Incorrect email or password. Please try again.',
  },
  {
    test: (message) => message.includes('email not confirmed'),
    message: 'Please verify your email address before logging in.',
  },
  {
    test: (message) =>
      message.includes('already registered') ||
      message.includes('user already registered'),
    message: 'An account with this email already exists. Please log in instead.',
  },
  {
    test: (message) =>
      message.includes('password should be at least') ||
      message.includes('password is too weak'),
    message: 'Password is too weak. Please use at least 6 characters.',
  },
  {
    test: (message) =>
      message.includes('provider is not enabled') ||
      message.includes('unsupported provider'),
    message:
      'Login provider is not configured yet. Please check your Supabase Dashboard Providers settings.',
  },
  {
    test: (message) =>
      message.includes('unsupported phone provider') ||
      message.includes('phone_provider_disabled') ||
      message.includes('phone provider is not enabled'),
    message:
      'Phone Authentication is not enabled in the Supabase Dashboard. Please enable the "Phone" provider in Authentication > Providers.',
  },
  {
    test: (message) =>
      message.includes('unexpected failure') ||
      message.includes('unexpected_failure'),
    message:
      'SMS sending failed (500 Unexpected failure). This usually indicates that the SMS provider (e.g. Twilio) is not configured, or has invalid/expired API credentials in the Supabase Dashboard. Please verify your SMS settings.',
  },
  {
    test: (message) =>
      message.includes('invalid phone number') ||
      message.includes('invalid format'),
    message:
      'Invalid phone number. Please check the format. It must start with "+" followed by the country code and digits (e.g., +919876543210).',
  },
  {
    test: (message) =>
      message.includes('invalid token') ||
      message.includes('token is invalid') ||
      message.includes('otp incorrect') ||
      message.includes('invalid otp') ||
      message.includes('expired'),
    message:
      'The OTP code you entered is invalid or has expired. Please try again.',
  },
  {
    test: (message) =>
      message.includes('redirect_uri_mismatch') ||
      message.includes('invalid redirect url'),
    message:
      'Google login redirect is misconfigured. Please contact support or try again later.',
  },
  {
    test: (message) => message.includes('failed to fetch'),
    message: 'Network error. Please check your connection and try again.',
  },
]

export const getAuthErrorMessage = (error) => {
  const rawMessage = String(error?.message ?? error ?? '').trim()
  if (!rawMessage) return DEFAULT_AUTH_ERROR_MESSAGE

  const normalizedMessage = rawMessage.toLowerCase()
  const matchedRule = ERROR_MESSAGE_RULES.find(({ test }) =>
    test(normalizedMessage),
  )

  return matchedRule?.message ?? rawMessage
}

export const getOAuthCallbackMessage = (urlString) => {
  const url = new URL(urlString)
  const queryParams = url.searchParams
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))

  const errorDescription =
    queryParams.get('error_description') || hashParams.get('error_description')

  if (errorDescription) {
    const decodedDescription = decodeURIComponent(errorDescription)
    return getAuthErrorMessage({ message: decodedDescription })
  }

  return null
}
