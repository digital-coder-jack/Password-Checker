/**
 * Small presentation helpers shared across components.
 */

/**
 * Masks a password for display/storage: keeps the first and last character,
 * replaces the middle with dots. The raw password is NEVER persisted.
 */
export function maskPassword(password: string): string {
  if (!password) return ''
  if (password.length <= 2) return '•'.repeat(password.length)
  const dots = '•'.repeat(Math.min(password.length - 2, 12))
  return `${password[0]}${dots}${password[password.length - 1]}`
}

/** Generates a reasonably-unique id without external deps. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
