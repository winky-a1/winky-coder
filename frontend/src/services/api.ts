import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({ baseURL })

export function handle<T>(p: Promise<any>) {
  return p.then(res => res.data as T).catch((e) => ({ success: false, error: e.message }))
}