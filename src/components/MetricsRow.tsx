import type { AnalysisResult } from '../lib/types'

interface Props {
  result: AnalysisResult
}

/** Compact stat chips: entropy, variety, unique chars, crack time. */
export function MetricsRow({ result }: Props): JSX.Element {
  const variety = [
    result.composition.hasLowercase,
    result.composition.hasUppercase,
    result.composition.hasNumbers,
    result.composition.hasSymbols,
  ].filter(Boolean).length

  const stats: { label: string; value: string }[] = [
    { label: 'Entropy', value: result.isEmpty ? '—' : `${result.entropy.toFixed(0)} bits` },
    { label: 'Variety', value: `${variety}/4` },
    { label: 'Length', value: `${result.composition.length}` },
    { label: 'Unique', value: `${result.composition.uniqueChars}` },
  ]

  return (
    <div className="metrics-row">
      {stats.map((s) => (
        <div key={s.label} className="metric">
          <span className="metric__value">{s.value}</span>
          <span className="metric__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
