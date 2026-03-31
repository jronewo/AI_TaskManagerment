import { apiUrl, safeFetch, parseBody } from './client'

export async function getAiRecommendations(taskId, projectId) {
  const res = await safeFetch(apiUrl('api/task-assignment/recommend'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, projectId })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tải đề xuất AI.')
  return data
}

export async function acceptAiRecommendation(taskId, userId) {
  const res = await safeFetch(apiUrl('api/task-assignment/accept'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, userId })
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi chấp nhận đề xuất.')
  }
}

export async function runRiskAnalysis(taskId) {
  const res = await safeFetch(apiUrl(`api/ai-analysis/${taskId}/risk`), { method: 'POST' })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi phân tích rủi ro.')
  return data
}

export async function generateSummary(taskId) {
  const res = await safeFetch(apiUrl(`api/ai-analysis/${taskId}/summary`), { method: 'POST' })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo tóm tắt.')
  return data
}

export async function classifyTask(taskId) {
  const res = await safeFetch(apiUrl(`api/classification/${taskId}`), { method: 'POST' })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi phân loại task.')
  return data
}

export async function getAssignmentReason(taskDescription, userProfile) {
  const res = await safeFetch(apiUrl('api/text-generation/assignment-reason'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskDescription, userProfile })
  })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi giải thích phân công.')
  return data
}

export async function getProjectWorkloadSuggestion(projectId) {
  const res = await safeFetch(apiUrl(`api/text-generation/workload/${projectId}`), { method: 'POST' })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi tư vấn khối lượng công việc.')
  return data
}

export async function analyzeProjectRisk(projectId) {
  const res = await safeFetch(apiUrl(`api/ai-analysis/project/${projectId}/analyze-all`), { method: 'POST' })
  const data = await parseBody(res)
  if (!res.ok) throw new Error(data.message || 'Lỗi quét rủi ro project.')
  return data
}

