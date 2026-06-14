import type { AnalysisResult } from '../lib/types'
import { Icon } from './Icon'

interface Props {
  result: AnalysisResult
}

interface Criterion {
  label: string
  met: boolean
}

/** Grid of the core composition criteria with pass/fail indicators. */
export function CriteriaGrid({ result }: Props): JSX.Element {
  const { composition } = result
  const criteria: Criterion[] = [
    { label: '12+ characters', met: composition.length >= 12 },
    { label: 'Lowercase (a-z)', met: composition.hasLowercase },
    { label: 'Uppercase (A-Z)', met: composition.hasUppercase },
    { label: 'Numbers (0-9)', met: composition.hasNumbers },
    { label: 'Symbols (!@#$)', met: composition.hasSymbols },
    {
      label: 'No repeats/sequences',
      met:
        !result.detections.some(
          (d) => d.id === 'repeat-run' || d.id === 'sequential' || d.id === 'keyboard',
        ) && !result.isEmpty,
    },
  ]

  return (
    <ul className="criteria-grid" aria-label="Password criteria">
      {criteria.map((c) => (
        <li key={c.label} className={`criterion ${c.met ? 'criterion--met' : ''}`}>
          <span className="criterion__icon">
            <Icon name={c.met ? 'check' : 'lock'} size={14} />
          </span>
          {c.label}
        </li>
      ))}
    </ul>
  )
}
