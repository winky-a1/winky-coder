import { api, handle } from './api'
import type { ApiResponse, AIRequest } from '@/types'

export function getModels() {
  return handle<ApiResponse>(api.get('/api/ai/models'))
}

export function aiChat(body: AIRequest) {
  return handle<ApiResponse>(api.post('/api/ai/chat', body))
}