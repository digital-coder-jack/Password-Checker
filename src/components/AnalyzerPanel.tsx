import { useEffect, useRef, useState } from 'react'
import type { AnalysisResult, BreachResult, HistoryEntry } from '../lib/types'
import { checkBreach } from '../lib/breach'
import { generatePdfReport } from '../lib/pdf'
import { maskPassword, uid } from '../lib/format'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { Icon } from './Icon'
import { StrengthMeter } from './StrengthMeter'
import { CriteriaGrid } from './CriteriaGrid'
import { MetricsRow } from './MetricsRow'
import { CrackTimePanel } from './CrackTimePanel'
import { SuggestionList } from './SuggestionList'
import { BreachStatus } from './BreachStatus'

interface Props {
  password: string
  onPasswordChange: (value: string) => void
  result: AnalysisResult
  onSaveToHistory: (entry: HistoryEntry) => void
}

/** The main strength-analysis card. */
export function AnalyzerPanel({
  password,
  onPasswordChange,
  result,
  onSaveToHistory,
}: Props): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [breachEnabled, setBreachEnabled] = useState(false)
  const [breach, setBreach] = useState<BreachResult>({ status: 'idle', count: 0, message: '' })
  const [saved, setSaved] = useState(false)

  // Debounce the network breach lookup so we don't hit the API on every keystroke.
  const debouncedPassword = useDebouncedValue(password, 600)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    if (!breachEnabled || !debouncedPassword) {
      setBreach({ status: 'idle', count: 0, message: '' })
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setBreach({ status: 'checking', count: 0, message: '' })
    checkBreach(debouncedPassword, controller.signal).then((res) => {
      if (!controller.signal.aborted) setBreach(res)
    })
    return () => controller.abort()
  }, [debouncedPassword, breachEnabled])

  const handleSave = (): void => {
    if (result.isEmpty) return
    const entry: HistoryEntry = {
      id: uid(),
      masked: maskPassword(result.password),
      score: result.score,
      level: result.level.id,
      levelLabel: result.level.label,
      entropy: result.entropy,
      length: result.composition.length,
      createdAt: Date.now(),
    }
    onSaveToHistory(entry)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  return (
    <section className="card analyzer" aria-labelledby="analyzer-title">
      <header className="card__header">
        <h2 id="analyzer-title">
          <Icon name="shield" size={20} /> Strength Analysis
        </h2>
        <span className="card__sub">Real-time · 100% on-device</span>
      </header>

      <div className="field">
        <label htmlFor="password-input">Enter a password to test</label>
        <div className="input-row">
          <input
            id="password-input"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Type or paste a password…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            // The input is React-controlled; the value lives only in state and
            // is never persisted, logged, or transmitted.
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            title={visible ? 'Hide password' : 'Show password'}
          >
            <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>
      </div>

      <StrengthMeter result={result} />
      <MetricsRow result={result} />
      <CriteriaGrid result={result} />

      <div className="analyzer__split">
        <CrackTimePanel result={result} />
        <SuggestionList result={result} />
      </div>

      <BreachStatus breach={breach} enabled={breachEnabled} onToggle={setBreachEnabled} />

      <div className="analyzer__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleSave}
          disabled={result.isEmpty}
        >
          <Icon name={saved ? 'check' : 'copy'} size={16} />
          {saved ? 'Saved to history' : 'Save to history'}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => generatePdfReport(result)}
          disabled={result.isEmpty}
        >
          <Icon name="download" size={16} />
          Download PDF report
        </button>
      </div>
    </section>
  )
}
