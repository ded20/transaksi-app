import { ref, computed } from 'vue'
import type { Transaction, TransactionInput, Category } from '../types'

const API_BASE = 'http://localhost:8000/api'

export function useApi(userId: string | null) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function apiCall<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    try {
      loading.value = true
      error.value = null

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (userId) {
        options.headers = {
          ...options.headers,
          'x-user-id': userId,
        }
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(`${API_BASE}${path}`, options)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return await response.json() as T
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Auth
  async function register(username: string, password: string) {
    return apiCall('POST', '/auth/register', { username, password })
  }

  async function login(username: string, password: string) {
    return apiCall('POST', '/auth/login', { username, password })
  }

  async function logout() {
    return apiCall('POST', '/auth/logout', {})
  }

  // Categories
  async function getCategories(): Promise<Category[]> {
    if (!userId) return []
    return apiCall('GET', '/categories')
  }

  async function createCategory(name: string, color: string): Promise<Category> {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('POST', '/categories', { name, color })
  }

  async function updateCategory(id: string, name: string, color: string): Promise<Category> {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('PUT', `/categories/${id}`, { name, color })
  }

  async function deleteCategory(id: string) {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('DELETE', `/categories/${id}`)
  }

  // Transactions
  async function getTransactions(filters?: {
    search?: string
    categoryId?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    sortBy?: string
  }): Promise<Transaction[]> {
    if (!userId) return []
    
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.categoryId) params.append('category_id', filters.categoryId)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters?.dateTo) params.append('date_to', filters.dateTo)
    if (filters?.sortBy) params.append('sort_by', filters.sortBy)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiCall('GET', `/transactions${query}`)
  }

  async function createTransaction(input: TransactionInput): Promise<Transaction> {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('POST', '/transactions', input)
  }

  async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('PUT', `/transactions/${id}`, input)
  }

  async function deleteTransaction(id: string) {
    if (!userId) throw new Error('Not authenticated')
    return apiCall('DELETE', `/transactions/${id}`)
  }

  return {
    loading,
    error,
    register,
    login,
    logout,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
