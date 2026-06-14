import type { StrengthLevel } from './types'

/**
 * A curated list of the most commonly used / leaked passwords.
 * Matched case-insensitively against the full password and its core token.
 * Kept intentionally compact (top offenders) — full breach detection is
 * handled live via the Have I Been Pwned k-anonymity API.
 */
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  '1234567890', 'qwerty', 'qwertyuiop', 'qwerty123', '111111', '000000',
  '123123', 'abc123', 'letmein', 'iloveyou', 'admin', 'admin123', 'welcome',
  'welcome1', 'monkey', 'dragon', 'football', 'baseball', 'shadow', 'master',
  'login', 'freedom', 'whatever', 'superman', 'batman', 'trustno1', 'sunshine',
  'princess', 'starwars', 'passw0rd', 'p@ssw0rd', 'zaq12wsx', 'asdfgh',
  'asdfghjkl', '1q2w3e4r', '1qaz2wsx', 'qazwsx', 'changeme', 'secret',
])

/**
 * Sequential strings used to detect predictable runs.
 * The detector also scans these reversed.
 */
export const SEQUENCES: readonly string[] = [
  'abcdefghijklmnopqrstuvwxyz',
  '01234567890',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '!@#$%^&*()',
]

/**
 * The five strength levels, ordered from weakest to strongest.
 * `min` is the inclusive lower score bound; `color` maps to a CSS token.
 */
export const STRENGTH_LEVELS: readonly StrengthLevel[] = [
  { id: 'very-weak', label: 'Very Weak', min: 0, color: 'var(--level-very-weak)' },
  { id: 'weak', label: 'Weak', min: 25, color: 'var(--level-weak)' },
  { id: 'medium', label: 'Medium', min: 45, color: 'var(--level-medium)' },
  { id: 'strong', label: 'Strong', min: 70, color: 'var(--level-strong)' },
  { id: 'very-strong', label: 'Very Strong', min: 90, color: 'var(--level-very-strong)' },
]

/** Character sets for the generator and pool-size estimation. */
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?~',
} as const

/** Characters that are easy to confuse and are removed when excludeAmbiguous is set. */
export const AMBIGUOUS_CHARS = 'O0oIl1|`\'";:.,{}[]()'

/**
 * Guess rates (guesses per second) for the crack-time scenarios.
 * Values are widely cited industry estimates and intentionally conservative.
 */
export const GUESS_RATES = {
  /** Rate-limited online attack against a login form. */
  onlineThrottled: 100,
  /** Online attack with no throttling. */
  onlineUnthrottled: 1e4,
  /** Offline attack against a slow hash (bcrypt/argon2). */
  offlineSlowHash: 1e4,
  /** Offline attack against a fast hash (MD5/SHA1) on modern GPUs. */
  offlineFastHash: 1e11,
} as const
