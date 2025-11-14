/**
 * Validation utilities
 */

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Validates age
 * @param age - Age to validate
 * @returns True if age is valid
 */
export function isValidAge(age: number): boolean {
  return age > 0 && age < 150
}

