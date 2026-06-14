import { useMemo, useState } from 'react'
import { analyzePassword } from './lib/analyzer'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import { ThemeToggle } from './components/ThemeToggle'
import { AnalyzerPanel } from './components/AnalyzerPanel'
import { GeneratorPanel } from './components/GeneratorPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { Icon } from './components/Icon'

export default function App(): JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const [password, setPassword] = useState('')
  const { entries, addEntry, removeEntry, clear } = useHistory()

  // Analysis is pure + cheap; memoize so it only recomputes when the password changes.
  const result = useMemo(() => analyzePassword(password), [password])

  return (
    <div className="app">
      {/* Decorative animated gradient blobs */}
      <div className="bg-blobs" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--3" />
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="brand__logo">
            <Icon name="shield" size={22} />
          </span>
          <div className="brand__text">
            <h1>SecurePass Studio</h1>
            <p>Check strength, spot patterns &amp; generate safer passwords.</p>
          </div>
        </div>
        <div className="topbar__right">
          <span className="pill">
            <Icon name="lock" size={14} /> 100% client-side
          </span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="layout">
        <div className="layout__primary">
          <AnalyzerPanel
            password={password}
            onPasswordChange={setPassword}
            result={result}
            onSaveToHistory={addEntry}
          />
        </div>
        <aside className="layout__secondary">
          <GeneratorPanel onUsePassword={setPassword} />
          <HistoryPanel entries={entries} onRemove={removeEntry} onClear={clear} />
        </aside>
      </main>

      <footer className="footer">
        <p>
          Your password is analysed entirely in your browser. Nothing is stored or transmitted
          (except an optional, anonymised breach check you explicitly enable).
        </p>
        <p className="footer__meta">
          SecurePass Studio · Built with React, TypeScript &amp; Vite · Deployed on Vercel
        </p>
      </footer>
    </div>
  )
}
