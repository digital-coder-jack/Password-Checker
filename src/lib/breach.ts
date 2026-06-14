/**
 * Optional breach detection via the Have I Been Pwned "Pwned Passwords" API.
 *
 * Privacy is preserved using k-anonymity: we compute the SHA-1 of the password
 * locally, send ONLY the first 5 hex characters of that hash, and match the
 * suffix client-side. The full password and full hash never leave the browser.
 *
 * @see https://haveibeenpwned.com/API/v3#PwnedPasswords
 */
import type { BreachResult } from './types'

const API = 'https://api.pwnedpasswords.com/range/'

/** Computes the uppercase hex SHA-1 of a string using the Web Crypto API. */
async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Checks a password against the HIBP range API.
 * Returns a `BreachResult`; never throws (errors are folded into the result).
 */
export async function checkBreach(
  password: string,
  signal?: AbortSignal,
): Promise<BreachResult> {
  if (!password) {
    return { status: 'idle', count: 0, message: '' }
  }

  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    const response = await fetch(`${API}${prefix}`, {
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
      signal,
    })

    if (!response.ok) {
      return { status: 'error', count: 0, message: 'Breach service unavailable.' }
    }

    const body = await response.text()
    // Each line: "<HASH_SUFFIX>:<COUNT>"
    for (const line of body.split('\n')) {
      const [lineSuffix, countStr] = line.trim().split(':')
      if (lineSuffix === suffix) {
        const count = parseInt(countStr, 10) || 0
        return {
          status: 'breached',
          count,
          message: `Found in ${count.toLocaleString()} known data breach${count === 1 ? '' : 'es'}. Do not use this password.`,
        }
      }
    }

    return {
      status: 'safe',
      count: 0,
      message: 'Not found in any known breach. (Absence is not a guarantee of safety.)',
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { status: 'checking', count: 0, message: '' }
    }
    return { status: 'error', count: 0, message: 'Could not reach the breach service.' }
  }
}
