import { api, handle } from './api'
import type { ApiResponse } from '@/types'

export function importRepo(repoUrl: string, token?: string, branch: string = 'main') {
  return handle<ApiResponse>(api.post('/api/repos/import', { repoUrl, token, branch }))
}

export function getRepoFiles(repoPath: string, path: string) {
  return handle<ApiResponse>(api.get('/api/repos/files', { params: { repoPath, path } }))
}

export function getFileContent(repoPath: string, filePath: string) {
  return handle<ApiResponse>(api.get('/api/repos/file', { params: { repoPath, filePath } }))
}