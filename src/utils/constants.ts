/**
 * Application constants
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SITE_MAP: '/site-map',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  CREATE_MEETING: '/meetings/create',
  MEETING: (id: string) => `/meetings/${id}`,
} as const

/**
 * Auth provider options
 */
export const AUTH_PROVIDERS = {
  MANUAL: 'manual' as const,
  GOOGLE: 'google' as const,
  FACEBOOK: 'facebook' as const,
} as const

