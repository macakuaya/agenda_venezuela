// Design tokens for Agenda Venezuela.
// These map 1:1 to CSS custom properties applied on :root.
// The /design-system page edits these live and can export them.

export interface TokenDef {
  /** CSS variable name without the leading "--". */
  key: string
  /** Human label shown in the design-system editor. */
  label: string
  /** Group used to organize the editor. */
  group: 'Color' | 'Tipografía' | 'Forma' | 'Espaciado'
  /** Input type for the editor. */
  type: 'color' | 'text' | 'size'
  /** Default value. */
  value: string
}

// Starting point: solid black buttons + Helvetica (per brief).
export const defaultTokens: TokenDef[] = [
  { key: 'color-bg', label: 'Fondo', group: 'Color', type: 'color', value: '#ffffff' },
  { key: 'color-surface', label: 'Superficie (tarjetas)', group: 'Color', type: 'color', value: '#ffffff' },
  { key: 'color-text', label: 'Texto', group: 'Color', type: 'color', value: '#0a0a0a' },
  { key: 'color-muted', label: 'Texto suave', group: 'Color', type: 'color', value: '#6b6b6b' },
  { key: 'color-accent', label: 'Acento (botones)', group: 'Color', type: 'color', value: '#000000' },
  { key: 'color-accent-text', label: 'Texto sobre acento', group: 'Color', type: 'color', value: '#ffffff' },
  { key: 'color-border', label: 'Bordes', group: 'Color', type: 'color', value: '#e6e6e6' },

  { key: 'font-family', label: 'Tipografía', group: 'Tipografía', type: 'text', value: 'Helvetica, Arial, sans-serif' },

  { key: 'radius-card', label: 'Radio de tarjeta', group: 'Forma', type: 'size', value: '16px' },
  { key: 'radius-button', label: 'Radio de botón', group: 'Forma', type: 'size', value: '10px' },
  { key: 'shadow-card', label: 'Sombra de tarjeta', group: 'Forma', type: 'text', value: '0 1px 2px rgba(0,0,0,0.06)' },

  { key: 'space-card', label: 'Padding de tarjeta', group: 'Espaciado', type: 'size', value: '16px' },
  { key: 'max-card-width', label: 'Ancho máx. tarjeta', group: 'Espaciado', type: 'size', value: '500px' },
]

export const TOKENS_STORAGE_KEY = 'agenda-vzla:tokens'
