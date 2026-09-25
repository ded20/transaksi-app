export type TransactionType = 'income' | 'expense'
export type ViewMode = 'list' | 'analytics'
export type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export interface Category {
  id: string
  name: string
  color: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  date: string
  description: string
  categoryId: string
  type: TransactionType
  amount: number
}

export type TransactionInput = Omit<Transaction, 'id'>

export interface FilterState {
  search: string
  categoryIds: string[]
  types: TransactionType[]
  dateFrom: string | null
  dateTo: string | null
  sortBy: SortBy
}

export interface AnalyticsSnapshot {
  totalTransactions: number
  averageAmount: number
  largestTransaction: Transaction | null
  categoryBreakdown: Array<{ categoryId: string; categoryName: string; amount: number; percentage: number }>
  monthlyTrend: Array<{ month: string; income: number; expense: number; balance: number }>
  topCategory: Category | null
}

export type { Ref } from 'vue'
