import { computed, unref } from 'vue'
import type { Transaction, Category, AnalyticsSnapshot, Ref } from '../types'

export function useAnalytics(transactions: Ref<Transaction[]> | Transaction[], categories: Ref<Category[]> | Category[]) {
  const categoryMap = computed(() => {
    const map = new Map<string, Category>()
    const cats = unref(categories)
    cats.forEach(c => map.set(c.id, c))
    return map
  })

  const snapshot = computed((): AnalyticsSnapshot => {
    const txns = unref(transactions)
    if (txns.length === 0) {
      return {
        totalTransactions: 0,
        averageAmount: 0,
        largestTransaction: null,
        categoryBreakdown: [],
        monthlyTrend: [],
        topCategory: null,
      }
    }

    const totalTxns = txns.length
    const totalAmount = txns.reduce((sum, t) => sum + t.amount, 0)
    const average = totalAmount / totalTxns

    const largest = [...txns].sort((a, b) => b.amount - a.amount)[0]

    // Category breakdown (expenses only)
    const expenses = txns.filter(t => t.type === 'expense')
    const categorySpend = new Map<string, number>()
    expenses.forEach(t => {
      categorySpend.set(t.categoryId, (categorySpend.get(t.categoryId) || 0) + t.amount)
    })

    const totalExpense = Array.from(categorySpend.values()).reduce((a, b) => a + b, 0)
    const categoryBreakdown = Array.from(categorySpend.entries())
      .map(([catId, amount]) => ({
        categoryId: catId,
        categoryName: categoryMap.value.get(catId)?.name || 'Unknown',
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const topCat = categoryBreakdown[0]
    const topCategory = topCat ? categoryMap.value.get(topCat.categoryId) || null : null

    // Monthly trend
    const monthlyMap = new Map<string, { income: number; expense: number }>()
    txns.forEach(t => {
      const month = t.date.slice(0, 7) // yyyy-mm
      const entry = monthlyMap.get(month) || { income: 0, expense: 0 }
      if (t.type === 'income') entry.income += t.amount
      else entry.expense += t.amount
      monthlyMap.set(month, entry)
    })

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }))

    return {
      totalTransactions: totalTxns,
      averageAmount: Math.round(average),
      largestTransaction: largest,
      categoryBreakdown,
      monthlyTrend,
      topCategory,
    }
  })

  return { snapshot }
}
