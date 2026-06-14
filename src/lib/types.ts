/**
 * Shared type definitions for the password analysis engine.
 * Keeping all domain types in one place keeps the lib modules decoupled.
 */

/** Five-level strength scale required by the product spec. */
export type StrengthLevelId =
  | 'very-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'very-strong'

export interface StrengthLevel {
  id: StrengthLevelId
  label: string
  /** Inclusive lower bound of the 0-100 score range for this level. */
  min: number
  /** CSS custom-property color token used by the UI. */
  color: string
}

/** Boolean composition flags describing which character classes are present. */
export interface CharacterComposition {
  length: number
  hasLowercase: boolean
  hasUppercase: boolean
  hasNumbers: boolean
  hasSymbols: boolean
  /** Count of unique characters used. */
  uniqueChars: number
  /** Size of the effective character pool (used for entropy). */
  poolSize: number
}

/** A single detected weakness or pattern. */
export interface Detection {
  id: string
  /** Short human label, e.g. "Sequential pattern". */
  label: string
  /** Whether this detection is a problem (true) or a positive trait (false). */
  isWeakness: boolean
  /** Detail/suggestion shown to the user. */
  detail: string
}

/** Crack-time estimate across several realistic attack scenarios. */
export interface CrackTimeEstimate {
  /** Scenario -> seconds-to-crack (average, assuming half the keyspace). */
  scenarios: {
    onlineThrottled: number
    onlineUnthrottled: number
    offlineSlowHash: number
    offlineFastHash: number
  }
  /** Pre-formatted human strings for each scenario. */
  display: {
    onlineThrottled: string
    onlineUnthrottled: string
    offlineSlowHash: string
    offlineFastHash: string
  }
  /** The headline scenario used in the summary (offline fast hash, worst case). */
  headline: string
}

/** The complete result of analysing one password. */
export interface AnalysisResult {
  password: string
  score: number
  level: StrengthLevel
  entropy: number
  composition: CharacterComposition
  detections: Detection[]
  suggestions: string[]
  crackTime: CrackTimeEstimate
  /** True if the supplied password is empty. */
  isEmpty: boolean
}

/** Options for the password generator. */
export interface GeneratorOptions {
  length: number
  includeLowercase: boolean
  includeUppercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  /** Exclude visually ambiguous characters (O/0, l/1, etc.). */
  excludeAmbiguous: boolean
}

/** Result of a Have I Been Pwned k-anonymity breach lookup. */
export interface BreachResult {
  status: 'idle' | 'checking' | 'safe' | 'breached' | 'error'
  /** Number of times the password appeared in known breaches. */
  count: number
  message: string
}

/** A saved entry for the password history comparison feature. */
export interface HistoryEntry {
  id: string
  /** Masked representation — the real password is never stored. */
  masked: string
  score: number
  level: StrengthLevelId
  levelLabel: string
  entropy: number
  length: number
  createdAt: number
}
