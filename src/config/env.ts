export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  VOICE_SERVER_URL: import.meta.env.VITE_VOICE_SERVER_URL || 'http://localhost:4000',
  WEBRTC_URL: import.meta.env.VITE_WEBRTC_URL || 'http://localhost:3000',
} as const