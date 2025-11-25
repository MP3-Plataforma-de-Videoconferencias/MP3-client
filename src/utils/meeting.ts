/**
 * Generates a human-friendly meeting code
 * Format: XXXX-XXXX using uppercase letters and numbers
 */
export function generateMeetingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const block = (): string =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  return `${block()}-${block()}`
}


