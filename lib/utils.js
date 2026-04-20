export async function hashFingerprint(fp) {
  // Use SubtleCrypto when available (HTTPS), otherwise fall back to a simple hash
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(fp)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback: djb2 hash (good enough for dedup on HTTP dev)
  let h = 5381
  for (let i = 0; i < fp.length; i++) {
    h = ((h << 5) + h) ^ fp.charCodeAt(i)
    h = h >>> 0
  }
  return h.toString(16).padStart(8, '0') + fp.length.toString(16)
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPublicVoteUrl(electionId) {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  return `${base}/vote/${electionId}`
}

export function getElectionStatus(election) {
  const now = new Date()
  const start = election.start_time ? new Date(election.start_time) : null
  const end = election.end_time ? new Date(election.end_time) : null

  if (end && now > end) return 'ended'
  if (start && now < start) return 'upcoming'
  return 'live'
}
