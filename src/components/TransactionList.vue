<script setup lang="ts">
import type { Transaction, Category } from '../types'

defineProps<{
  transactions: Transaction[]
  categories: Category[]
}>()

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [id: string]
}>()

function getCategoryById(id: string, categories: Category[]) {
  return categories.find(c => c.id === id)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function confirmDelete(id: string, description: string) {
  if (confirm(`Hapus transaksi "${description}"?`)) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="transaction-list">
    <div class="list-header">
      <h2>Riwayat Transaksi</h2>
      <span class="count">{{ transactions.length }} transaksi</span>
    </div>

    <div v-if="transactions.length" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Deskripsi</th>
            <th>Kategori</th>
            <th>Tipe</th>
            <th class="text-right">Jumlah</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="row">
          <tr v-for="t in transactions" :key="t.id">
            <td class="text-muted">{{ formatDate(t.date) }}</td>
            <td class="text-strong">{{ t.description }}</td>
            <td>
              <span class="chip" :style="{ '--chip-color': getCategoryById(t.categoryId, categories)?.color || '#4f7cff' } as any">
                {{ getCategoryById(t.categoryId, categories)?.name || 'Unknown' }}
              </span>
            </td>
            <td>
              <span :class="['badge', t.type === 'income' ? 'badge-income' : 'badge-expense']">
                {{ t.type === 'income' ? '↓ Pemasukan' : '↑ Pengeluaran' }}
              </span>
            </td>
            <td class="text-right" :class="t.type === 'income' ? 'amount-income' : 'amount-expense'">
              {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
            </td>
            <td class="text-center">
              <div class="row-actions">
                <button class="btn-icon" title="Edit" @click="emit('edit', t)">✎</button>
                <button class="btn-icon btn-danger" title="Hapus" @click="confirmDelete(t.id, t.description)">🗑</button>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <div v-else class="empty">
      <span class="empty-icon">🗒️</span>
      <p>Belum ada transaksi.</p>
      <span class="empty-sub">Tambahkan transaksi baru lewat form di sebelah kiri.</span>
    </div>
  </div>
</template>

<style scoped>
.transaction-list {
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
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

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.list-header h2 {
  font-size: 1.05rem;
}

.count {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--surface-muted);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

th {
  background: var(--surface-muted);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

tbody tr {
  transition: background var(--dur-fast) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  tbody tr:hover {
    background: var(--surface-muted);
  }
}

tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--text-muted);
}

.text-strong {
  font-weight: 600;
  color: var(--text);
}

.chip {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--chip-color, #4f7cff);
  color: white;
  opacity: 0.85;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-income {
  background: var(--success-soft);
  color: var(--success);
}

.badge-expense {
  background: var(--danger-soft);
  color: var(--danger);
}

.amount-income {
  color: var(--success);
  font-weight: 700;
}

.amount-expense {
  color: var(--danger);
  font-weight: 700;
}

.row-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.btn-icon:active {
  transform: scale(0.9);
}

@media (hover: hover) and (pointer: fine) {
  .btn-icon:hover {
    background: var(--primary-soft);
    border-color: var(--primary);
    color: var(--primary);
  }

  .btn-danger:hover {
    background: var(--danger-soft);
    border-color: var(--danger);
    color: var(--danger);
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 3.5rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
}

.empty p {
  margin: 0;
  font-weight: 600;
  color: var(--text);
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Row enter/exit: transform + opacity only, ease-out, under 200ms */
.row-move,
.row-enter-active,
.row-leave-active {
  transition: transform var(--dur-base) var(--ease-out), opacity var(--dur-base) var(--ease-out);
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.row-leave-active {
  position: relative;
}
</style>
