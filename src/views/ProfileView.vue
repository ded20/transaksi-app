<template>
  <div class="view-container">
    <h1>Profil</h1>
    <p class="subtitle">Pengaturan akun Anda</p>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar">{{ userInitial }}</div>
        <div class="profile-info">
          <h2>{{ currentUser?.username }}</h2>
          <p class="joined">Bergabung sejak {{ formatDate(currentUser?.created_at) }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">{{ totalTransactions }}</span>
          <span class="stat-label">Total Transaksi</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ totalCategories }}</span>
          <span class="stat-label">Kategori</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatCurrency(totalIncome) }}</span>
          <span class="stat-label">Total Pemasukan</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatCurrency(totalExpense) }}</span>
          <span class="stat-label">Total Pengeluaran</span>
        </div>
      </div>

      <div class="action-section">
        <button class="btn btn-danger" @click="handleLogout">
          🚪 Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useTransactions } from '../composables/useTransactions'
import { useCategories } from '../composables/useCategories'

const router = useRouter()
const { currentUser, logout } = useAuth()
const { transactions, totalIncome, totalExpense, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()

const userInitial = computed(() => currentUser.value?.username?.[0].toUpperCase() || '?')
const totalTransactions = computed(() => transactions.value.length)
const totalCategories = computed(() => categories.value.length)

onMounted(async () => {
  if (currentUser.value?.id) {
    await fetchCategories(currentUser.value.id)
    await fetchTransactions(currentUser.value.id)
  }
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateStr))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 800px;
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

.profile-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.joined {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  border: 1px solid var(--border);
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

.action-section {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

.btn:active {
  transform: scale(0.97);
}
</style>
