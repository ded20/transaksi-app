<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Transaction, TransactionInput, TransactionType, Category } from '../types'

const props = defineProps<{
  editing?: Transaction | null
  categories: Category[]
}>()

const emit = defineEmits<{
  submit: [input: TransactionInput]
  cancel: []
}>()

const defaultForm = (): TransactionInput => ({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  categoryId: props.categories[0]?.id || '',
  type: 'expense' as TransactionType,
  amount: 0,
})

const form = reactive<TransactionInput>(defaultForm())

watch(
  () => props.editing,
  (t) => {
    if (t) {
      form.date = t.date
      form.description = t.description
      form.categoryId = t.categoryId
      form.type = t.type
      form.amount = t.amount
    } else {
      Object.assign(form, defaultForm())
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.description.trim() || !form.categoryId || form.amount <= 0) return
  emit('submit', { ...form })
  if (!props.editing) Object.assign(form, defaultForm())
}

function handleCancel() {
  emit('cancel')
  Object.assign(form, defaultForm())
}

function getCategoryColor(categoryId: string): string {
  return props.categories.find(c => c.id === categoryId)?.color || '#4f7cff'
}
</script>

<template>
  <form class="transaction-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <span class="form-icon">{{ editing ? '✎' : '+' }}</span>
      <h2>{{ editing ? 'Edit Transaksi' : 'Tambah Transaksi' }}</h2>
    </div>

    <div class="field">
      <label for="date">Tanggal</label>
      <input id="date" v-model="form.date" type="date" required />
    </div>

    <div class="field">
      <label for="description">Deskripsi</label>
      <input id="description" v-model="form.description" type="text" placeholder="Contoh: Belanja bulanan" required />
    </div>

    <div class="field">
      <label for="category">Kategori</label>
      <select id="category" v-model="form.categoryId" required class="category-select">
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="field">
      <label for="type">Tipe</label>
      <div class="type-toggle">
        <button
          type="button"
          class="type-btn"
          :class="{ active: form.type === 'income', 'active-income': form.type === 'income' }"
          @click="form.type = 'income'"
        >
          ↓ Pemasukan
        </button>
        <button
          type="button"
          class="type-btn"
          :class="{ active: form.type === 'expense', 'active-expense': form.type === 'expense' }"
          @click="form.type = 'expense'"
        >
          ↑ Pengeluaran
        </button>
      </div>
    </div>

    <div class="field">
      <label for="amount">Jumlah (Rp)</label>
      <input id="amount" v-model.number="form.amount" type="number" min="0" step="1000" required />
    </div>

    <div class="actions">
      <button type="submit" class="btn-primary">{{ editing ? 'Simpan Perubahan' : 'Tambah Transaksi' }}</button>
      <button v-if="editing" type="button" class="btn-secondary" @click="handleCancel">Batal</button>
    </div>
  </form>
</template>

<style scoped>
.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 1.5rem;
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

.form-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.25rem;
}

.form-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.95rem;
  font-weight: 700;
}

.form-header h2 {
  font-size: 1.05rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field input,
.category-select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  background: var(--surface-muted);
  color: var(--text);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.field input:focus,
.category-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
  background: var(--surface);
}

.category-select {
  cursor: pointer;
}

.type-toggle {
  display: flex;
  gap: 0.5rem;
}

.type-btn {
  flex: 1;
  padding: 0.55rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.type-btn:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .type-btn:hover {
    border-color: var(--text-subtle);
  }
}

.type-btn.active-income {
  background: var(--success-soft);
  border-color: var(--success);
  color: var(--success);
}

.type-btn.active-expense {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.65rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.btn-primary {
  flex: 1;
  background: var(--primary);
  color: white;
}

@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover {
    background: var(--primary-hover);
  }
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-secondary {
  background: var(--surface-muted);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

@media (hover: hover) and (pointer: fine) {
  .btn-secondary:hover {
    background: var(--border);
  }
}

.btn-secondary:active {
  transform: scale(0.97);
}
</style>
