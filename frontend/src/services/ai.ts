import { aiAPI } from './api'
import type { ApiResponse, AIRequest } from '@/types'

export function getModels() {
  return aiAPI.getModels()
}

export function sendMessage(body: AIRequest) {
  return aiAPI.sendRequest(body)
}