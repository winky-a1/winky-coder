import { repositoryAPI } from './api'
import type { ApiResponse } from '@/types'

export function importRepo(repoUrl: string, token?: string, branch: string = 'main') {
  return repositoryAPI.importRepo(repoUrl, token || '', branch)
}

export function getFiles(repoPath: string, path: string = '') {
  return repositoryAPI.getFiles(repoPath, path)
}

export function getFileContent(repoPath: string, filePath: string) {
  return repositoryAPI.getFileContent(repoPath, filePath)
}

export function updateFile(repoPath: string, filePath: string, content: string, token?: string) {
  return repositoryAPI.updateFile(repoPath, filePath, content, token || '')
}

export function getBranches(repoUrl: string, token?: string) {
  return repositoryAPI.getBranches(repoUrl, token || '')
}

export function commitChanges(repoPath: string, message: string, files: any[], token?: string) {
  return repositoryAPI.commitChanges(repoPath, message, files, token || '')
}

export function pullChanges(repoPath: string, token?: string) {
  return repositoryAPI.pullChanges(repoPath, token || '')
}