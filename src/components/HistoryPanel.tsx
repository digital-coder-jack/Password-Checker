import type { HistoryEntry } from '../lib/types'
import { Icon } from './Icon'

interface Props {
  entries: HistoryEntry[]
  onRemove: (id: string) => void
  onClear: () => void
}

/** Compares previously-saved password analyses (masked, metadata only). */
export function HistoryPanel({ entries, onRemove, onClear }: Props): JSX.Element {
  return (
    <section className="card history" aria-labelledby="history-title">
      <header className="card__header">
        <h2 id="history-title">
          <Icon name="copy" size={20} /> History &amp; Comparison
        </h2>
        {entries.length > 0 && (
          <button type="button" className="text-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="history__empty">
          Saved analyses appear here so you can compare passwords side by side. Only masked
          values and scores are stored — never the real password.
        </p>
      ) : (
        <ul className="history__list">
          {entries.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="history-item__main">
                <code className="history-item__masked">{entry.masked}</code>
                <span className={`badge badge--${entry.level}`}>{entry.levelLabel}</span>
              </div>
              <div className="history-item__meta">
                <span>{entry.score}/100</span>
                <span>{entry.entropy.toFixed(0)} bits</span>
                <span>{entry.length} chars</span>
              </div>
              <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={() => onRemove(entry.id)}
                aria-label="Remove entry"
                title="Remove"
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
