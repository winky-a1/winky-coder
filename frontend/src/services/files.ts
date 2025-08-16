import { fileAPI, repositoryAPI } from './api'
import type { ApiResponse } from '@/types'

export function updateFile(repoPath: string, filePath: string, content: string, token?: string) {
  return repositoryAPI.updateFile(repoPath, filePath, content, token || '')
}

export function createFile(repoPath: string, filePath: string, content: string, token?: string) {
  return fileAPI.createFile(repoPath, filePath, content, token || '')
}

export function deleteFile(repoPath: string, filePath: string, token?: string) {
  return fileAPI.deleteFile(repoPath, filePath, token || '')
}

export function moveFile(repoPath: string, oldPath: string, newPath: string, token?: string) {
  return fileAPI.moveFile(repoPath, oldPath, newPath, token || '')
}