import type { AnalysisResult } from '../lib/types'
import { STRENGTH_LEVELS } from '../lib/data'

interface Props {
  result: AnalysisResult
}

/** Animated 5-segment strength meter + score badge. */
export function StrengthMeter({ result }: Props): JSX.Element {
  const activeIndex = STRENGTH_LEVELS.findIndex((l) => l.id === result.level.id)

  return (
    <section className="strength-meter" aria-live="polite">
      <div className="strength-meter__head">
        <span
          className={`badge badge--${result.level.id}`}
          style={{ ['--badge-color' as string]: result.level.color }}
        >
          {result.isEmpty ? 'Awaiting input' : result.level.label}
        </span>
        <span className="strength-meter__score">
          <strong>{result.score}</strong>
          <span className="strength-meter__score-max">/100</span>
        </span>
      </div>

      <div className="segments" role="img" aria-label={`Strength: ${result.level.label}`}>
        {STRENGTH_LEVELS.map((level, index) => (
          <span
            key={level.id}
            className={`segment ${!result.isEmpty && index <= activeIndex ? 'segment--on' : ''}`}
            style={{ ['--segment-color' as string]: result.level.color }}
          />
        ))}
      </div>

      <div className="progress" aria-hidden="true">
        <div
          className="progress__fill"
          style={{ width: `${result.score}%`, background: result.level.color }}
        />
      </div>
    </section>
  )
}
