const ADMIN_ENDPOINT = '/.netlify/functions/admin'
const PIN_KEY = 'agenda-vzla:clarisa-pin'

interface AdminResponse {
  ok?: boolean
  error?: string
  imageUrl?: string
}

export function getStoredAdminPin(): string | null {
  const value = sessionStorage.getItem(PIN_KEY)
  if (!value || value === 'true') {
    if (value === 'true') sessionStorage.removeItem(PIN_KEY)
    return null
  }
  return value
}

export function storeAdminPin(pin: string): void {
  sessionStorage.setItem(PIN_KEY, pin)
}

export function clearAdminPin(): void {
  sessionStorage.removeItem(PIN_KEY)
}

export async function adminRequest(
  action: string,
  payload: Record<string, unknown> = {},
  explicitPin?: string,
): Promise<AdminResponse> {
  const pin = explicitPin ?? getStoredAdminPin()
  if (!pin) throw new Error('La sesión del panel expiró. Vuelve a escribir el PIN.')

  const response = await fetch(ADMIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Clarisa-Pin': pin,
    },
    body: JSON.stringify({ action, ...payload }),
  })

  const result = (await response.json().catch(() => ({}))) as AdminResponse
  if (!response.ok || result.ok !== true) {
    if (response.status === 401) clearAdminPin()
    throw new Error(
      result.error ?? 'El backend de administración no está disponible.',
    )
  }

  return result
}

export async function verifyAdminPin(pin: string): Promise<void> {
  await adminRequest('verify', {}, pin)
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  return btoa(binary)
}
