import { apiUrl, safeFetch, parseBody } from './client'

export async function getProjects() {
  const res = await safeFetch(apiUrl('api/Projects'))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách dự án.')
  return data
}

export async function getProjectById(id) {
  const res = await safeFetch(apiUrl(`api/Projects/${id}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải dự án.')
  return data
}

export async function createProject(projectData) {
  const res = await safeFetch(apiUrl('api/Projects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo dự án.')
  return data
}

export async function updateProject(id, projectData) {
  const res = await safeFetch(apiUrl(`api/Projects/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi cập nhật dự án.')
  }
}

export async function deleteProject(id) {
  const res = await safeFetch(apiUrl(`api/Projects/${id}`), {
    method: 'DELETE'
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi xóa dự án.')
  }
}

export async function addMemberByEmail(projectId, email, role = 'MEMBER') {
  const res = await safeFetch(apiUrl(`api/Projects/${projectId}/members`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }) 
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi thêm thành viên.')
  return data
}

export async function searchUsers(query) {
  const res = await safeFetch(apiUrl(`api/Users/search?email=${encodeURIComponent(query)}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Không tìm thấy user.')
  return data
}
