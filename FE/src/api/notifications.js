import { apiUrl, safeFetch, parseBody } from './client'

export async function getNotifications(userId) {
  const res = await safeFetch(apiUrl(`api/Notifications/user/${userId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải thông báo.')
  return Array.isArray(data) ? data : []
}

export async function getUnreadCount(userId) {
  const res = await safeFetch(apiUrl(`api/Notifications/user/${userId}/unread-count`))
  const data = await parseBody(res)
  if (!res.ok) return 0
  return data.count || 0
}

export async function markAsRead(notificationId) {
  const res = await safeFetch(apiUrl(`api/Notifications/${notificationId}/read`), {
    method: 'PUT'
  })
  if (!res.ok) throw new Error('Lỗi đánh dấu đã đọc.')
}

export async function markAllAsRead(userId) {
  const res = await safeFetch(apiUrl(`api/Notifications/user/${userId}/read-all`), {
    method: 'PUT'
  })
  if (!res.ok) throw new Error('Lỗi đánh dấu tất cả đã đọc.')
}

export async function deleteNotification(notificationId) {
  const res = await safeFetch(apiUrl(`api/Notifications/${notificationId}`), {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Lỗi xoá thông báo.')
}

export async function getMyTasks() {
  const res = await safeFetch(apiUrl('api/Tasks/my'))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách task.')
  return Array.isArray(data) ? data : []
}

export async function getMyTeams() {
  const res = await safeFetch(apiUrl('api/Teams/my'))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách nhóm.')
  return Array.isArray(data) ? data : []
}
