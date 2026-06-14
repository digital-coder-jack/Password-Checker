import { CHARSETS, AMBIGUOUS_CHARS } from './data'
import type { GeneratorOptions } from './types'
import { secureRandomChar, secureShuffle } from './random'

/** Sensible defaults for the generator UI. */
export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
}

/** Removes ambiguous characters from a set when requested. */
function filterAmbiguous(set: string, exclude: boolean): string {
  if (!exclude) return set
  const banned = new Set(AMBIGUOUS_CHARS.split(''))
  return set
    .split('')
    .filter((ch) => !banned.has(ch))
    .join('')
}

/**
 * Generates a cryptographically-strong password.
 *
 * Guarantees that at least one character from every enabled class is present
 * (so the result always satisfies the requested composition), then fills the
 * remainder from the combined pool and shuffles everything.
 */
export function generatePassword(options: GeneratorOptions): string {
  const length = Math.max(4, Math.min(128, Math.floor(options.length)))

  const pools: string[] = []
  if (options.includeLowercase) pools.push(filterAmbiguous(CHARSETS.lower, options.excludeAmbiguous))
  if (options.includeUppercase) pools.push(filterAmbiguous(CHARSETS.upper, options.excludeAmbiguous))
  if (options.includeNumbers) pools.push(filterAmbiguous(CHARSETS.digits, options.excludeAmbiguous))
  if (options.includeSymbols) pools.push(filterAmbiguous(CHARSETS.symbols, options.excludeAmbiguous))

  // Fall back to lowercase if every class was disabled — never return empty.
  if (pools.length === 0) {
    pools.push(CHARSETS.lower)
  }

  const combined = pools.join('')

  // One guaranteed character from each enabled class.
  const required = pools
    .filter((set) => set.length > 0)
    .map((set) => secureRandomChar(set))

  const chars: string[] = [...required]
  while (chars.length < length) {
    chars.push(secureRandomChar(combined))
  }

  return secureShuffle(chars.slice(0, length)).join('')
}
