import type { AnalysisResult } from '../lib/types'
import { Icon } from './Icon'

interface Props {
  result: AnalysisResult
}

/** Renders detected weaknesses/strengths and actionable suggestions. */
export function SuggestionList({ result }: Props): JSX.Element {
  return (
    <div className="suggestions">
      {result.detections.length > 0 && (
        <ul className="detections">
          {result.detections.map((d) => (
            <li
              key={d.id}
              className={`detection ${d.isWeakness ? 'detection--bad' : 'detection--good'}`}
            >
              <Icon name={d.isWeakness ? 'alert' : 'check'} size={15} />
              <span>
                <strong>{d.label}.</strong> {d.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ul className="tips">
        {result.suggestions.map((tip) => (
          <li key={tip} className="tip">
            <Icon name="info" size={15} />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
