import { apiUrl, safeFetch, parseBody } from './client'

export async function getAllTeams() {
  const res = await safeFetch(apiUrl('api/Teams'))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải nhóm.')
  return Array.isArray(data) ? data : []
}

export async function getMyTeams() {
  const res = await safeFetch(apiUrl('api/Teams/my'))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải nhóm.')
  return Array.isArray(data) ? data : []
}

export async function getTeamById(teamId) {
  const res = await safeFetch(apiUrl(`api/Teams/${teamId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải nhóm.')
  return data
}

export async function createTeam({ name, description, createdBy }) {
  const res = await safeFetch(apiUrl('api/Teams'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, createdBy })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo nhóm.')
  return data
}

export async function addTeamMember(teamId, userId, role = 'MEMBER') {
  const res = await safeFetch(apiUrl(`api/Teams/${teamId}/members`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, userId, role })
  })
  if (!res.ok) {
    const data = await parseBody(res)
    throw new Error(data.message || data || 'Lỗi thêm thành viên.')
  }
  return true
}

export async function removeTeamMember(memberId) {
  const res = await safeFetch(apiUrl(`api/Teams/members/${memberId}`), {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Lỗi xoá thành viên.')
  return true
}

export async function deleteTeam(teamId) {
  const res = await safeFetch(apiUrl(`api/Teams/${teamId}`), {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Lỗi xoá nhóm.')
  return true
}
