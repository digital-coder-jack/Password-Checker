import { useCallback, useEffect, useState } from 'react'
import type { HistoryEntry } from '../lib/types'

const STORAGE_KEY = 'securepass-history'
const MAX_ENTRIES = 10

/**
 * Persisted password-comparison history.
 *
 * IMPORTANT: only MASKED representations and metadata (score, entropy, length)
 * are ever stored — never the raw password. Storage stays in this browser's
 * localStorage and can be cleared at any time.
 */
export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      /* storage may be unavailable (private mode) — fail silently */
    }
  }, [entries])

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES))
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, addEntry, removeEntry, clear }
}
