import type { AnalysisResult } from '../lib/types'

interface Props {
  result: AnalysisResult
}

/** Shows estimated crack time across the four attack scenarios. */
export function CrackTimePanel({ result }: Props): JSX.Element {
  const rows: { label: string; value: string; hint: string }[] = [
    {
      label: 'Online (throttled)',
      value: result.crackTime.display.onlineThrottled,
      hint: '100 guesses/sec — typical rate-limited login',
    },
    {
      label: 'Online (no limit)',
      value: result.crackTime.display.onlineUnthrottled,
      hint: '10k guesses/sec',
    },
    {
      label: 'Offline (slow hash)',
      value: result.crackTime.display.offlineSlowHash,
      hint: 'bcrypt / argon2 — 10k/sec',
    },
    {
      label: 'Offline (fast hash)',
      value: result.crackTime.display.offlineFastHash,
      hint: 'MD5/SHA1 on GPU — 100B/sec',
    },
  ]

  return (
    <div className="crack-panel">
      <h3 className="crack-panel__title">Estimated time to crack</h3>
      <ul className="crack-panel__list">
        {rows.map((row) => (
          <li key={row.label} className="crack-row" title={row.hint}>
            <span className="crack-row__label">{row.label}</span>
            <span className="crack-row__value">{result.isEmpty ? '—' : row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
