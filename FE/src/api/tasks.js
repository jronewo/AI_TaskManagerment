import { apiUrl, safeFetch, parseBody } from './client'

export async function getTasksByProject(projectId) {
  const res = await safeFetch(apiUrl(`api/Tasks?projectId=${projectId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi lấy danh sách task.')
  return data
}

export async function getTaskDetail(taskId) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi lấy chi tiết task.')
  return data
}

export const getTaskById = getTaskDetail;

export async function createTask(taskData) {
  const res = await safeFetch(apiUrl('api/Tasks'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo task.')
  return data
}

export async function updateTask(taskId, taskData) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi cập nhật task.')
  }
}

export async function updateTaskSkills(taskId, skillIds) {
  const res = await safeFetch(apiUrl(`api/TaskRequiredSkills/${taskId}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillIds })
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi cập nhật kỹ năng task.')
  }
}

export async function deleteTask(taskId) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}`), {
    method: 'DELETE'
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi xóa task.')
  }
}

export async function updateTaskProgress(taskId, payload) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}/progress`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi cập nhật tiến độ (có thể do dependency chưa Done).')
  }
}

export async function addDependency(taskId, dependsOnTaskId) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}/dependencies`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dependsOnTaskId })
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi thêm dependency.')
  }
}

export async function removeDependency(taskId, dependencyId) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}/dependencies/${dependencyId}`), {
    method: 'DELETE'
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi xóa dependency.')
  }
}

export async function getDependencyGraph(projectId) {
  const res = await safeFetch(apiUrl(`api/Tasks/project/${projectId}/dependency-graph`))
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi lấy biểu đồ phụ thuộc.')
  return data
}

export async function suggestEstimatedTime(taskId) {
  const res = await safeFetch(apiUrl(`api/Tasks/${taskId}/estimate`), {
    method: 'POST'
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi AI gợi ý thời gian.')
  return data
}

// Old TaskLog APIs
export async function getTaskLogs(taskId) {
  const res = await safeFetch(apiUrl(`api/task-progress/${taskId}/logs`), {
    headers: { 'Accept': 'application/json' }
  })
  return await parseBody(res)
}

export async function logTaskActivity(taskId, { progress, note, risk }) {
  const res = await safeFetch(apiUrl(`api/task-progress/${taskId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress, note, risk })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi ghi nhận activity/risk log.')
  return data
}
