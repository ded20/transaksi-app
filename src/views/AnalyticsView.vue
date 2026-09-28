<template>
  <div class="view-container">
    <h1>Analitik</h1>
    <p class="subtitle">Laporan keuangan dan insights</p>
    
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="card">
        <h3>Total Income</h3>
        <p class="amount income">{{ formatCurrency(snapshot.totalIncome) }}</p>
      </div>
      <div class="card">
        <h3>Total Expense</h3>
        <p class="amount expense">{{ formatCurrency(snapshot.totalExpense) }}</p>
      </div>
      <div class="card">
        <h3>Balance</h3>
        <p class="amount" :class="snapshot.balance >= 0 ? 'positive' : 'negative'">
          {{ formatCurrency(snapshot.balance) }}
        </p>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="breakdown-section">
      <h2>Pengeluaran per Kategori</h2>
      <div v-if="snapshot.categoryBreakdown.length > 0" class="breakdown-list">
        <div v-for="item in snapshot.categoryBreakdown" :key="item.categoryId" class="breakdown-item">
          <div class="breakdown-header">
            <span class="category-name">{{ item.categoryName }}</span>
            <span class="percentage">{{ item.percentage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
          </div>
          <p class="amount">{{ formatCurrency(item.total) }}</p>
        </div>
      </div>
      <p v-else class="empty-state">Tidak ada data pengeluaran</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTransactions } from '../composables/useTransactions'
import { useCategories } from '../composables/useCategories'
import { useAnalytics } from '../composables/useAnalytics'

const { currentUser } = useAuth()
const { transactions, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { snapshot } = useAnalytics(transactions, categories)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  if (currentUser.value?.id) {
    await fetchCategories(currentUser.value.id)
    await fetchTransactions(currentUser.value.id)
  }
})
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--text-muted);
  margin: 0 0 2rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.amount.income {
  color: #4CAF50;
}

.amount.expense {
  color: #F44336;
}

.amount.positive {
  color: #4CAF50;
}

.amount.negative {
  color: #F44336;
}

.breakdown-section {
  background: var(--surface);
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.breakdown-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.breakdown-item {
  padding: 1rem;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 600;
  color: var(--text);
}

.percentage {
  font-weight: 600;
  color: var(--primary);
}

.progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  transition: width 0.3s ease-out;
}

.breakdown-item .amount {
  font-size: 1rem;
  margin: 0;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  margin: 0;
}

@media (max-width: 768px) {
  .view-container {
    padding: 1rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .breakdown-section {
    padding: 1rem;
  }
}
</style>
