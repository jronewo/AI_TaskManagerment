import { apiUrl, safeFetch, parseBody } from './client'

export async function getUserProfile(userId) {
  const res = await safeFetch(apiUrl(`api/Users/${userId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi lấy hồ sơ người dùng.')
  return data
}

export async function updateProfile(userId, { name, avatar }) {
  const res = await safeFetch(apiUrl(`api/Users/${userId}/profile`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, avatar })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật hồ sơ.')
  return data
}

export async function uploadAvatar(userId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await safeFetch(apiUrl(`api/Users/${userId}/avatar`), {
    method: 'POST',
    body: formData
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải ảnh lên.')
  return data
}

export async function uploadImage(file, folder = 'taskgenie/comments') {
  const formData = new FormData()
  formData.append('file', file)

  const res = await safeFetch(apiUrl(`api/Users/upload-image?folder=${encodeURIComponent(folder)}`), {
    method: 'POST',
    body: formData
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi upload ảnh.')
  return data
}

export async function getTaskComments(taskId) {
  const res = await safeFetch(apiUrl(`api/TaskComments/task/${taskId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi lấy bình luận.')
  return Array.isArray(data) ? data : []
}

export async function addTaskComment({ taskId, userId, content, imageUrl }) {
  const res = await safeFetch(apiUrl('api/TaskComments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, userId, content, imageUrl })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi thêm bình luận.')
  return data
}

export async function deleteTaskComment(commentId) {
  const res = await safeFetch(apiUrl(`api/TaskComments/${commentId}`), {
    method: 'DELETE'
  })
  if (!res.ok) {
    const data = await parseBody(res)
    throw new Error(data.message || 'Lỗi xóa bình luận.')
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  const res = await safeFetch(apiUrl(`api/Users/${userId}/change-password`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi đổi mật khẩu.')
  return data
}
