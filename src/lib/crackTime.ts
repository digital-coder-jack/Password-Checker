import { GUESS_RATES } from './data'
import type { CrackTimeEstimate } from './types'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const YEAR = DAY * 365.25
const CENTURY = YEAR * 100

/**
 * Formats a number of seconds into a friendly human string.
 * Caps at "centuries" magnitude to avoid astronomical, meaningless numbers.
 */
export function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'instantly'
  if (seconds < 1) return 'less than a second'
  if (seconds < MINUTE) return `${Math.round(seconds)} second${plural(seconds)}`
  if (seconds < HOUR) return `${round(seconds / MINUTE)} minute${plural(seconds / MINUTE)}`
  if (seconds < DAY) return `${round(seconds / HOUR)} hour${plural(seconds / HOUR)}`
  if (seconds < YEAR) return `${round(seconds / DAY)} day${plural(seconds / DAY)}`
  if (seconds < CENTURY) return `${round(seconds / YEAR)} year${plural(seconds / YEAR)}`

  const centuries = seconds / CENTURY
  if (centuries < 1e6) return `${formatLargeNumber(centuries)} centuries`
  return 'effectively forever'
}

function round(value: number): number {
  return value < 10 ? Math.round(value * 10) / 10 : Math.round(value)
}

function plural(value: number): string {
  return round(value) === 1 ? '' : 's'
}

/** Compact formatting for very large numbers (thousands → quintillions). */
function formatLargeNumber(n: number): string {
  const units = ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion']
  let value = n
  let unitIndex = 0
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000
    unitIndex += 1
  }
  return `${round(value)}${units[unitIndex]}`
}

/**
 * Estimates crack time from entropy across four realistic attack scenarios.
 *
 * Number of guesses to exhaust the keyspace is 2^entropy; on average an
 * attacker finds the password after trying half of it, hence the /2.
 */
export function estimateCrackTime(entropy: number): CrackTimeEstimate {
  // Use log-space to avoid overflow for large entropy values.
  // guesses = 2^(entropy - 1); seconds = guesses / rate.
  const secondsFor = (rate: number): number => {
    const log2Seconds = entropy - 1 - Math.log2(rate)
    return Math.pow(2, log2Seconds)
  }

  const scenarios = {
    onlineThrottled: secondsFor(GUESS_RATES.onlineThrottled),
    onlineUnthrottled: secondsFor(GUESS_RATES.onlineUnthrottled),
    offlineSlowHash: secondsFor(GUESS_RATES.offlineSlowHash),
    offlineFastHash: secondsFor(GUESS_RATES.offlineFastHash),
  }

  return {
    scenarios,
    display: {
      onlineThrottled: formatSeconds(scenarios.onlineThrottled),
      onlineUnthrottled: formatSeconds(scenarios.onlineUnthrottled),
      offlineSlowHash: formatSeconds(scenarios.offlineSlowHash),
      offlineFastHash: formatSeconds(scenarios.offlineFastHash),
    },
    // Headline uses the worst case (offline fast hash) — the most conservative.
    headline: formatSeconds(scenarios.offlineFastHash),
  }
}
