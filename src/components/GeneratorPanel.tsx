import { useCallback, useEffect, useState } from 'react'
import type { GeneratorOptions } from '../lib/types'
import { DEFAULT_GENERATOR_OPTIONS, generatePassword } from '../lib/generator'
import { Icon } from './Icon'

interface Props {
  /** Pushes a generated password into the analyzer for inspection. */
  onUsePassword: (password: string) => void
}

interface ToggleDef {
  key: keyof Omit<GeneratorOptions, 'length'>
  label: string
}

const TOGGLES: ToggleDef[] = [
  { key: 'includeLowercase', label: 'Lowercase' },
  { key: 'includeUppercase', label: 'Uppercase' },
  { key: 'includeNumbers', label: 'Numbers' },
  { key: 'includeSymbols', label: 'Symbols' },
  { key: 'excludeAmbiguous', label: 'No ambiguous (O/0, l/1)' },
]

/** Secure password generator with copy + "use this" actions. */
export function GeneratorPanel({ onUsePassword }: Props): JSX.Element {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_GENERATOR_OPTIONS)
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  const regenerate = useCallback(() => {
    setGenerated(generatePassword(options))
    setCopied(false)
  }, [options])

  // Generate one on mount and whenever options change.
  useEffect(() => {
    regenerate()
  }, [regenerate])

  const handleCopy = async (): Promise<void> => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API can fail on insecure contexts — fall back silently.
      setCopied(false)
    }
  }

  const updateToggle = (key: ToggleDef['key'], value: boolean): void => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <section className="card generator" aria-labelledby="generator-title">
      <header className="card__header">
        <h2 id="generator-title">
          <Icon name="refresh" size={20} /> Password Generator
        </h2>
        <span className="card__sub">Cryptographically secure</span>
      </header>

      <div className="generated">
        <output className="generated__value" aria-live="polite">
          {generated}
        </output>
        <div className="generated__actions">
          <button type="button" className="icon-btn" onClick={regenerate} title="Regenerate" aria-label="Regenerate">
            <Icon name="refresh" size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={handleCopy} title="Copy" aria-label="Copy to clipboard">
            <Icon name={copied ? 'check' : 'copy'} size={18} />
          </button>
        </div>
      </div>

      <div className="field">
        <div className="length-head">
          <label htmlFor="length-range">Length</label>
          <span className="length-value">{options.length}</span>
        </div>
        <input
          id="length-range"
          className="range"
          type="range"
          min={8}
          max={64}
          value={options.length}
          onChange={(e) => setOptions((p) => ({ ...p, length: Number(e.target.value) }))}
        />
      </div>

      <div className="toggle-grid">
        {TOGGLES.map((t) => (
          <label key={t.key} className="chip">
            <input
              type="checkbox"
              checked={options[t.key]}
              onChange={(e) => updateToggle(t.key, e.target.checked)}
            />
            {t.label}
          </label>
        ))}
      </div>

      <div className="generator__actions">
        <button type="button" className="btn btn--primary" onClick={() => onUsePassword(generated)}>
          <Icon name="shield" size={16} />
          Test this password
        </button>
      </div>
    </section>
  )
}
