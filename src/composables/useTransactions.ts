import { ref, computed } from 'vue'
import type { Transaction, TransactionInput, FilterState } from '../types'

const API_BASE = 'http://localhost:8000/api'

const transactions = ref<Transaction[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

function applyFiltersAndSort(txns: Transaction[], filters: FilterState | undefined): Transaction[] {
  if (!filters) return [...txns].sort((a, b) => b.date.localeCompare(a.date))
  
  let filtered = [...txns]

  // Search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(t => t.description.toLowerCase().includes(q))
  }

  // Category filter
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    filtered = filtered.filter(t => filters.categoryIds.includes(t.categoryId))
  }

  // Type filter
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(t => filters.types.includes(t.type))
  }

  // Date range
  if (filters.dateFrom) {
    filtered = filtered.filter(t => t.date >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    filtered = filtered.filter(t => t.date <= filters.dateTo!)
  }

  // Sort
  const sorted = filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-asc':
        return a.date.localeCompare(b.date)
      case 'date-desc':
        return b.date.localeCompare(a.date)
      case 'amount-asc':
        return a.amount - b.amount
      case 'amount-desc':
        return b.amount - a.amount
      default:
        return 0
    }
  })

  return sorted
}

export function useTransactions() {
  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  async function fetchTransactions(userId: string | null, filters?: FilterState) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.categoryIds && filters.categoryIds.length > 0) {
        params.append('category_id', filters.categoryIds[0])
      }
      if (filters?.types && filters.types.length > 0) {
        params.append('type', filters.types[0])
      }
      if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters?.dateTo) params.append('date_to', filters.dateTo)
      if (filters?.sortBy) params.append('sort_by', filters.sortBy)

      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`${API_BASE}/transactions${query}`, {
        headers: { 'x-user-id': userId },
      })

      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      
      // Map API response to Transaction type (api uses category_id, we use categoryId)
      transactions.value = data.map((t: any) => ({
        ...t,
        categoryId: t.category_id,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch'
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  function getFiltered(filters: FilterState) {
    return applyFiltersAndSort(transactions.value, filters)
  }

  async function addTransaction(userId: string | null, input: TransactionInput) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          date: input.date,
          description: input.description,
          category_id: input.categoryId,
          type: input.type,
          amount: input.amount,
        }),
      })

      if (!res.ok) throw new Error('Failed to create transaction')
      const data = await res.json()
      
      transactions.value.push({
        ...data,
        categoryId: data.category_id,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTransaction(userId: string | null, id: string, input: TransactionInput) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          date: input.date,
          description: input.description,
          category_id: input.categoryId,
          type: input.type,
          amount: input.amount,
        }),
      })

      if (!res.ok) throw new Error('Failed to update transaction')
      const data = await res.json()
      
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx >= 0) {
        transactions.value[idx] = {
          ...data,
          categoryId: data.category_id,
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(userId: string | null, id: string) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })

      if (!res.ok) throw new Error('Failed to delete transaction')
      
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    loading,
    error,
    totalIncome,
    totalExpense,
    balance,
    fetchTransactions,
    getFiltered,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
