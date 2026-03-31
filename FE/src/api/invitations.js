import { apiUrl, safeFetch, parseBody } from './client'

export async function getUserInvitations(email) {
  const res = await safeFetch(apiUrl(`api/Invitations/user/${encodeURIComponent(email)}`))
  return parseBody(res)
}

export async function updateInvitationStatus(id, status) {
  const res = await safeFetch(apiUrl(`api/Invitations/${id}/status`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi cập nhật lời mời')
  }
}

export async function createInvitation({ teamId, email, status }) {
  const res = await safeFetch(apiUrl('api/Invitations'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, email, status })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi gửi lời mời.')
  return data
}
