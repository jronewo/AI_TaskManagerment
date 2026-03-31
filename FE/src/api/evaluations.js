import { apiUrl, safeFetch, parseBody } from './client'

export async function createEvaluation(data) {
  const res = await safeFetch(apiUrl('api/Evaluations'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await parseBody(res)
    throw new Error(error.message || 'Lỗi tạo đánh giá.')
  }
  return parseBody(res)
}

export async function getUserEvaluations(userId) {
  const res = await safeFetch(apiUrl(`api/Evaluations/user/${userId}`))
  return parseBody(res)
}
