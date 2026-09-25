<template>
  <div class="view-container">
    <h1>Transaksi</h1>
    <p class="subtitle">Kelola daftar transaksi Anda</p>
    
    <div class="content-grid">
      <aside class="form-panel">
        <TransactionForm
          :editing="editing"
          :categories="categories"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </aside>

      <section class="list-panel">
        <FilterBar
          :categories="categories"
          :is-filtered="isFiltered"
          :search="filters.search"
          :selected-categories="filters.categoryIds"
          :selected-types="filters.types"
          :date-from="filters.dateFrom"
          :date-to="filters.dateTo"
          :sort-by="filters.sortBy"
          @update:search="setSearch"
          @update:categories="setCategories"
          @update:types="setTypes"
          @update:dateRange="(from, to) => setDateRange(from, to)"
          @update:sortBy="setSortBy"
          @reset="resetFilters"
        />
        <TransactionList
          :transactions="filteredTransactions"
          :categories="categories"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTransactions } from '../composables/useTransactions'
import { useCategories } from '../composables/useCategories'
import { useFilters } from '../composables/useFilters'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
import FilterBar from '../components/FilterBar.vue'
import type { Transaction, TransactionInput } from '../types'

const { currentUser } = useAuth()
const { transactions, fetchTransactions, getFiltered, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { filters, setSearch, setCategories, setTypes, setDateRange, setSortBy, reset: resetFilters, isFiltered } = useFilters()

const editing = ref<Transaction | null>(null)
const filteredTransactions = computed(() => getFiltered(filters.value))

onMounted(async () => {
  if (currentUser.value?.id) {
    await fetchCategories(currentUser.value.id)
    await fetchTransactions(currentUser.value.id, filters.value)
  }
})

function handleSubmit(input: TransactionInput) {
  if (editing.value) {
    updateTransaction(currentUser.value?.id || null, editing.value.id, input)
    editing.value = null
  } else {
    addTransaction(currentUser.value?.id || null, input)
  }
}

function handleEdit(t: Transaction) {
  editing.value = t
}

function handleCancel() {
  editing.value = null
}

function handleDelete(id: string) {
  if (editing.value?.id === id) editing.value = null
  deleteTransaction(currentUser.value?.id || null, id)
}
</script>

<style scoped>
.view-container {
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--text-muted);
  margin: 0 0 2rem 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
}

.form-panel {
  animation: slideUp var(--dur-base) var(--ease-out);
}

.list-panel {
  animation: slideUp var(--dur-base) var(--ease-out);
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

@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
