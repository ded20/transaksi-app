<template>
  <div class="view-container">
    <h1>Dashboard</h1>
    <p class="subtitle">Ringkasan keuangan Anda</p>
    
    <section class="summary">
      <div class="card card-income">
        <span class="card-icon">↓</span>
        <div class="card-body">
          <span class="label">Pemasukan</span>
          <span class="value">{{ formatCurrency(totalIncome) }}</span>
        </div>
      </div>
      <div class="card card-expense">
        <span class="card-icon">↑</span>
        <div class="card-body">
          <span class="label">Pengeluaran</span>
          <span class="value">{{ formatCurrency(totalExpense) }}</span>
        </div>
      </div>
      <div class="card card-balance" :class="balanceClass">
        <span class="card-icon">⚖</span>
        <div class="card-body">
          <span class="label">Saldo</span>
          <span class="value">{{ formatCurrency(balance) }}</span>
        </div>
      </div>
    </section>

    <div class="action-buttons">
      <RouterLink to="/transactions" class="btn btn-primary">
        📊 Lihat Transaksi
      </RouterLink>
      <RouterLink to="/analytics" class="btn btn-secondary">
        📈 Analitik Detail
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTransactions } from '../composables/useTransactions'

const { transactions, totalIncome, totalExpense, balance } = useTransactions()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const balanceClass = computed(() => (balance.value >= 0 ? 'positive' : 'negative'))
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

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  animation: slideUp var(--dur-base) var(--ease-out);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.card-income .card-icon {
  background: var(--success-soft);
  color: var(--success);
}

.card-expense .card-icon {
  background: var(--danger-soft);
  color: var(--danger);
}

.card-balance .card-icon {
  background: var(--primary-soft);
  color: var(--primary);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
}

.card-balance.positive .value {
  color: var(--success);
}

.card-balance.negative .value {
  color: var(--danger);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--dur-fast) var(--ease-out);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--surface-muted);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface);
}

.btn:active {
  transform: scale(0.97);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
