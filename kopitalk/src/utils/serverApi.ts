export interface ProcessTurnResult {
  status: string
  processed_data?: any
  raw_gemini_response?: string
}

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:8000'

export async function submitEsp32Image(esp32Id: string, image: Blob): Promise<{ status: string; message: string }>{
  const url = `${SERVER_BASE}/esp32/submit-image?esp32_id=${encodeURIComponent(esp32Id)}`
  const res = await fetch(url, { method: 'POST', body: image })
  if (!res.ok) throw new Error(`submit-image failed: ${res.status}`)
  return res.json()
}

export async function processTurn(esp32Id: string, gameSessionId: string, characterImage: File): Promise<ProcessTurnResult> {
  const url = `${SERVER_BASE}/admin/process-turn?esp32_id=${encodeURIComponent(esp32Id)}&game_session_id=${encodeURIComponent(gameSessionId)}`
  const form = new FormData()
  form.append('character_image', characterImage)
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`process-turn failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function getAdminStatus() {
  const res = await fetch(`${SERVER_BASE}/admin/status`)
  if (!res.ok) throw new Error(`admin/status failed: ${res.status}`)
  return res.json()
}
