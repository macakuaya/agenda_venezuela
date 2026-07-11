import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'agenda-vzla:interested'

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function write(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore (private mode / storage full)
  }
}

/**
 * Tracks which events the user marked as "Me interesa", persisted per device
 * in localStorage. Syncs across tabs/components via a custom event.
 */
export function useInterested() {
  const [ids, setIds] = useState<Set<string>>(read)

  useEffect(() => {
    const sync = () => setIds(read())
    window.addEventListener('interested-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('interested-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isInterested = useCallback((id: string) => ids.has(id), [ids])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      write(next)
      window.dispatchEvent(new Event('interested-changed'))
      return next
    })
  }, [])

  return { isInterested, toggle }
}
