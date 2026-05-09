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
      'Google login is not configured yet. Please use email login for now.',
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
