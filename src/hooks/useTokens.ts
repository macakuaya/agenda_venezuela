import { useCallback, useEffect, useState } from 'react'
import { defaultTokens, TOKENS_STORAGE_KEY, type TokenDef } from '../design/tokens'

type TokenValues = Record<string, string>

function readStored(): TokenValues {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as TokenValues
  } catch {
    return {}
  }
}

/** Merge defaults with any stored overrides. */
function resolveTokens(overrides: TokenValues): TokenDef[] {
  return defaultTokens.map((t) => ({
    ...t,
    value: overrides[t.key] ?? t.value,
  }))
}

function applyToDocument(tokens: TokenDef[]) {
  const root = document.documentElement
  for (const t of tokens) {
    root.style.setProperty(`--${t.key}`, t.value)
  }
}

/**
 * Loads saved tokens and applies them to :root.
 * Also exposes editing helpers used by the design-system page.
 */
export function useTokens() {
  const [tokens, setTokens] = useState<TokenDef[]>(() =>
    resolveTokens(readStored()),
  )

  useEffect(() => {
    applyToDocument(tokens)
  }, [tokens])

  const setToken = useCallback((key: string, value: string) => {
    setTokens((prev) => {
      const next = prev.map((t) => (t.key === key ? { ...t, value } : t))
      const overrides: TokenValues = {}
      for (const t of next) overrides[t.key] = t.value
      try {
        localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(overrides))
      } catch {
        // ignore write errors (e.g. private mode)
      }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(TOKENS_STORAGE_KEY)
    } catch {
      // ignore
    }
    setTokens(resolveTokens({}))
  }, [])

  return { tokens, setToken, reset }
}
