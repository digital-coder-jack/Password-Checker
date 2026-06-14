import { Icon } from './Icon'
import type { Theme } from '../hooks/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
}

/** Accessible dark/light switch. */
export function ThemeToggle({ theme, onToggle }: Props): JSX.Element {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={18} />
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
