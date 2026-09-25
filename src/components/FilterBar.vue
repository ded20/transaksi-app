<script setup lang="ts">
import { computed } from 'vue'
import type { Category, SortBy, TransactionType } from '../types'

const props = defineProps<{
  categories: Category[]
  isFiltered: boolean
  search: string
  selectedCategories: string[]
  selectedTypes: TransactionType[]
  dateFrom: string | null
  dateTo: string | null
  sortBy: SortBy
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:categories': [ids: string[]]
  'update:types': [types: TransactionType[]]
  'update:dateRange': [from: string | null, to: string | null]
  'update:sortBy': [sort: SortBy]
  reset: []
}>()

const allTypesSelected = computed(() =>
  props.selectedTypes.length === 2
)

function toggleType(type: TransactionType) {
  const updated = props.selectedTypes.includes(type)
    ? props.selectedTypes.filter(t => t !== type)
    : [...props.selectedTypes, type]
  emit('update:types', updated)
}

function toggleCategory(catId: string) {
  const updated = props.selectedCategories.includes(catId)
    ? props.selectedCategories.filter(id => id !== catId)
    : [...props.selectedCategories, catId]
  emit('update:categories', updated)
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-search">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Cari transaksi..."
        :value="search"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        class="search-input"
      />
    </div>

    <div class="filter-controls">
      <div class="filter-group">
        <label class="filter-label">Tipe</label>
        <div class="filter-buttons">
          <button
            class="filter-btn"
            :class="{ active: allTypesSelected || selectedTypes.length === 0 }"
            @click="emit('update:types', [])"
          >
            Semua
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedTypes.includes('income') }"
            @click="toggleType('income')"
          >
            ↓ Pemasukan
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedTypes.includes('expense') }"
            @click="toggleType('expense')"
          >
            ↑ Pengeluaran
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Kategori</label>
        <div class="filter-tags">
          <button
            class="filter-tag"
            :class="{ active: selectedCategories.length === 0 }"
            @click="emit('update:categories', [])"
          >
            Semua
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="filter-tag"
            :class="{ active: selectedCategories.includes(cat.id) }"
            :style="{ '--tag-color': cat.color } as any"
            @click="toggleCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Rentang Tanggal</label>
        <div class="filter-dates">
          <input
            type="date"
            :value="dateFrom || ''"
            @input="emit('update:dateRange', ($event.target as HTMLInputElement).value || null, dateTo)"
            class="date-input"
            placeholder="Dari"
          />
          <span class="date-separator">–</span>
          <input
            type="date"
            :value="dateTo || ''"
            @input="emit('update:dateRange', dateFrom, ($event.target as HTMLInputElement).value || null)"
            class="date-input"
            placeholder="Sampai"
          />
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Urutkan</label>
        <select
          :value="sortBy"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortBy)"
          class="sort-select"
        >
          <option value="date-desc">Tanggal Terbaru</option>
          <option value="date-asc">Tanggal Tertua</option>
          <option value="amount-desc">Jumlah Terbesar</option>
          <option value="amount-asc">Jumlah Terkecil</option>
        </select>
      </div>

      <button
        v-if="isFiltered"
        class="reset-btn"
        @click="emit('reset')"
      >
        Bersihkan Filter
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.filter-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 1rem;
  line-height: 1;
}

.search-input {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 2.4rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  background: var(--surface-muted);
  color: var(--text);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.search-input:focus {
  outline: none;
  background: var(--surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.filter-buttons,
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-btn,
.filter-tag {
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.filter-btn:active,
.filter-tag:active {
  transform: scale(0.95);
}

@media (hover: hover) and (pointer: fine) {
  .filter-btn:hover,
  .filter-tag:hover {
    border-color: var(--text-subtle);
  }
}

.filter-btn.active,
.filter-tag.active {
  background: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

.filter-tag.active {
  background: var(--tag-color, var(--primary-soft));
  border-color: var(--tag-color, var(--primary));
  color: white;
}

.filter-dates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  background: var(--surface-muted);
  color: var(--text);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.date-input:focus {
  outline: none;
  background: var(--surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.date-separator {
  color: var(--text-muted);
  font-weight: 600;
}

.sort-select {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  background: var(--surface-muted);
  color: var(--text);
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.sort-select:focus {
  outline: none;
  background: var(--surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.reset-btn {
  align-self: flex-start;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.reset-btn:active {
  transform: scale(0.95);
}

@media (hover: hover) and (pointer: fine) {
  .reset-btn:hover {
    background: var(--danger-soft);
  }
}
</style>
