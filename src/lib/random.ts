/**
 * Cryptographically-secure random helpers built on the Web Crypto API.
 * Uses rejection sampling to avoid modulo bias.
 */

/** Returns a uniformly-distributed integer in [0, max). */
export function secureRandomInt(max: number): number {
  if (max <= 0) throw new Error('max must be a positive integer')
  const array = new Uint32Array(1)
  // Largest multiple of `max` that fits in a uint32 — reject anything above
  // it so the distribution stays uniform (no modulo bias).
  const limit = Math.floor(0xffffffff / max) * max
  let value = 0
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= limit)
  return value % max
}

/** Picks a random character from a string using the secure RNG. */
export function secureRandomChar(set: string): string {
  return set[secureRandomInt(set.length)]
}

/** Fisher–Yates shuffle using the secure RNG (mutates and returns the array). */
export function secureShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
