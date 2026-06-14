import { COMMON_PASSWORDS, SEQUENCES, STRENGTH_LEVELS } from './data'
import { estimateCrackTime } from './crackTime'
import type {
  AnalysisResult,
  CharacterComposition,
  Detection,
  StrengthLevel,
} from './types'

/** Clamp helper. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Inspects which character classes a password uses and the effective pool size. */
export function analyzeComposition(password: string): CharacterComposition {
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  // Anything that is not alphanumeric counts as a symbol (covers unicode too).
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  let poolSize = 0
  if (hasLowercase) poolSize += 26
  if (hasUppercase) poolSize += 26
  if (hasNumbers) poolSize += 10
  if (hasSymbols) poolSize += 33 // common printable-symbol estimate

  const uniqueChars = new Set(password.split('')).size

  return {
    length: password.length,
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
    uniqueChars,
    poolSize: poolSize || 1,
  }
}

/**
 * Shannon-style entropy estimate: log2(poolSize) * length.
 * This is the standard "search-space" entropy and is kept as a float for
 * accurate crack-time maths (the original rounded too early).
 */
export function calculateEntropy(password: string, poolSize: number): number {
  if (!password) return 0
  return Math.log2(poolSize) * password.length
}

/** Detects 3+ character ascending/descending runs of letters or digits. */
export function hasSequentialRun(password: string): boolean {
  const value = password.toLowerCase()
  let run = 1
  for (let i = 1; i < value.length; i += 1) {
    const prev = value.charCodeAt(i - 1)
    const curr = value.charCodeAt(i)
    const bothAlpha = /[a-z]/.test(value[i - 1]) && /[a-z]/.test(value[i])
    const bothDigit = /[0-9]/.test(value[i - 1]) && /[0-9]/.test(value[i])
    if ((bothAlpha || bothDigit) && Math.abs(curr - prev) === 1) {
      run += 1
      if (run >= 3) return true
    } else {
      run = 1
    }
  }
  return false
}

/** Detects known keyboard / sequence substrings (forward or reversed). */
export function hasKeyboardPattern(password: string): boolean {
  const lower = password.toLowerCase()
  if (lower.length < 3) return false
  return SEQUENCES.some((seq) => {
    const reversed = seq.split('').reverse().join('')
    for (let i = 0; i <= lower.length - 3; i += 1) {
      const chunk = lower.slice(i, i + 3)
      if (seq.includes(chunk) || reversed.includes(chunk)) return true
    }
    return false
  })
}

/** True if the password matches (or is mostly) a known common password. */
export function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return true
  // Also flag if stripping trailing digits/symbols reveals a common base
  // (e.g. "password!" / "qwerty123").
  const base = lower.replace(/[^a-z]/g, '')
  return base.length >= 4 && COMMON_PASSWORDS.has(base)
}

/** Resolves a 0-100 score to its strength level. */
export function getStrengthLevel(score: number): StrengthLevel {
  let level = STRENGTH_LEVELS[0]
  for (const candidate of STRENGTH_LEVELS) {
    if (score >= candidate.min) level = candidate
  }
  return level
}

/**
 * Runs the full analysis pipeline on a password.
 * Pure and synchronous — no I/O, no storage, safe to call on every keystroke.
 */
export function analyzePassword(password: string): AnalysisResult {
  const composition = analyzeComposition(password)
  const entropy = calculateEntropy(password, composition.poolSize)
  const crackTime = estimateCrackTime(entropy)

  if (!password) {
    return {
      password,
      score: 0,
      level: STRENGTH_LEVELS[0],
      entropy: 0,
      composition,
      detections: [],
      suggestions: ['Start typing a password to see a live security analysis.'],
      crackTime,
      isEmpty: true,
    }
  }

  const detections: Detection[] = []
  const suggestions: string[] = []

  // ---- Positive composition signals -------------------------------------
  const variety = [
    composition.hasLowercase,
    composition.hasUppercase,
    composition.hasNumbers,
    composition.hasSymbols,
  ].filter(Boolean).length

  // ---- Base score from entropy (the dominant factor) --------------------
  // ~60 bits of entropy maps to a full "entropy score" of 60/100 here.
  let score = clamp((entropy / 75) * 100, 0, 70)

  // Reward length explicitly (capped) and variety.
  score += Math.min(15, Math.max(0, composition.length - 8) * 1.5)
  score += variety * 4

  // ---- Weakness detections (each can carry a penalty) -------------------
  if (composition.length < 8) {
    detections.push(weakness('length', 'Too short', 'Passwords under 8 characters are trivial to brute-force.'))
    suggestions.push('Use at least 12–16 characters.')
    score -= 25
  } else if (composition.length < 12) {
    suggestions.push('Aim for 12+ characters for stronger security.')
  }

  if (variety < 3) {
    detections.push(weakness('variety', 'Low character variety', 'Mix uppercase, lowercase, numbers and symbols.'))
    suggestions.push('Add the missing character types (uppercase, numbers, symbols).')
    score -= 12
  }

  // Low unique-character ratio drains real entropy. The penalty scales with
  // how few distinct characters are used relative to the length.
  const uniqueRatio = composition.length > 0 ? composition.uniqueChars / composition.length : 1
  if (uniqueRatio <= 0.5 && composition.length > 4) {
    detections.push(weakness('repeat-ratio', 'Many repeated characters', 'A small set of repeated characters lowers real entropy.'))
    suggestions.push('Use more distinct characters instead of repeating a few.')
    // Up to -38 as the ratio approaches "all one character".
    score -= Math.round((0.5 - uniqueRatio) * 60) + 8
  }

  if (/(.)\1{2,}/.test(password)) {
    detections.push(weakness('repeat-run', 'Repeated characters', 'Sequences like "aaa" or "111" are easy to guess.'))
    suggestions.push('Avoid repeating the same character three or more times.')
    score -= 12
  }

  if (hasSequentialRun(password)) {
    detections.push(weakness('sequential', 'Sequential pattern', 'Runs like "12345" or "abcde" are predictable.'))
    suggestions.push('Avoid sequential runs such as 1234 or abcd.')
    score -= 12
  }

  if (hasKeyboardPattern(password)) {
    detections.push(weakness('keyboard', 'Keyboard pattern', 'Patterns like "qwerty" or "asdf" are tried first by attackers.'))
    suggestions.push('Avoid keyboard walks like qwerty or asdfgh.')
    score -= 12
  }

  if (/\b(19|20)\d{2}\b/.test(password)) {
    detections.push(weakness('year', 'Contains a year', 'Years (e.g. birth years) are highly predictable.'))
    suggestions.push('Replace recognisable years with unrelated numbers.')
    score -= 6
  }

  if (isCommonPassword(password)) {
    detections.push(weakness('common', 'Common password', 'This appears in well-known password lists.'))
    suggestions.push('Choose something unique — common passwords are cracked instantly.')
    // A common password is catastrophic regardless of other factors.
    score = Math.min(score, 12)
  }

  // ---- Positive detections (shown as reassurance) -----------------------
  if (composition.length >= 16) {
    detections.push(strength('long', 'Great length', '16+ characters dramatically increases the search space.'))
  }
  if (variety === 4) {
    detections.push(strength('full-variety', 'Full character variety', 'Uses lowercase, uppercase, numbers and symbols.'))
  }

  score = clamp(Math.round(score), 0, 100)
  const level = getStrengthLevel(score)

  if (suggestions.length === 0) {
    suggestions.push('Excellent password. Store it in a password manager and never reuse it.')
  }

  return {
    password,
    score,
    level,
    entropy,
    composition,
    detections,
    suggestions,
    crackTime,
    isEmpty: false,
  }
}

function weakness(id: string, label: string, detail: string): Detection {
  return { id, label, detail, isWeakness: true }
}

function strength(id: string, label: string, detail: string): Detection {
  return { id, label, detail, isWeakness: false }
}
