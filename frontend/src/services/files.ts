import { api, handle } from './api'
import type { ApiResponse } from '@/types'

export function updateFile(repoPath: string, filePath: string, content: string, token?: string) {
  return handle<ApiResponse>(api.put('/api/repos/file', { repoPath, filePath, content, token }))
}

export function createFile(repoPath: string, filePath: string, content: string, token?: string) {
  return handle<ApiResponse>(api.post('/api/files/create', { repoPath, filePath, content, token }))
}

export function deleteFile(repoPath: string, filePath: string, token?: string) {
  return handle<ApiResponse>(api.delete('/api/files/delete', { data: { repoPath, filePath, token } }))
}

export function moveFile(repoPath: string, oldPath: string, newPath: string, token?: string) {
  return handle<ApiResponse>(api.put('/api/files/move', { repoPath, oldPath, newPath, token }))
}