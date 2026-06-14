import type { BreachResult } from '../lib/types'
import { Icon } from './Icon'

interface Props {
  breach: BreachResult
  enabled: boolean
  onToggle: (value: boolean) => void
}

/** Displays the optional Have I Been Pwned breach-check status. */
export function BreachStatus({ breach, enabled, onToggle }: Props): JSX.Element {
  return (
    <div className="breach">
      <label className="breach__toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>Check against known breaches (Have I Been Pwned)</span>
      </label>

      {enabled && breach.status !== 'idle' && (
        <div className={`breach__result breach__result--${breach.status}`} role="status">
          {breach.status === 'checking' && (
            <>
              <Icon name="spinner" size={16} className="spin" />
              <span>Checking securely…</span>
            </>
          )}
          {breach.status === 'safe' && (
            <>
              <Icon name="check" size={16} />
              <span>{breach.message}</span>
            </>
          )}
          {breach.status === 'breached' && (
            <>
              <Icon name="alert" size={16} />
              <span>{breach.message}</span>
            </>
          )}
          {breach.status === 'error' && (
            <>
              <Icon name="info" size={16} />
              <span>{breach.message}</span>
            </>
          )}
        </div>
      )}

      {enabled && (
        <p className="breach__privacy">
          Privacy-safe: only the first 5 characters of your password&rsquo;s SHA-1 hash are
          sent (k-anonymity). The password itself never leaves your device.
        </p>
      )}
    </div>
  )
}
