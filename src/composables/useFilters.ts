import { ref, computed } from 'vue'
import type { FilterState, SortBy, TransactionType } from '../types'

const STORAGE_KEY = 'transaksi-app:filters'

function loadFilters(): FilterState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const defaults: FilterState = {
      search: '',
      categoryIds: [],
      types: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'date-desc',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }
  try {
    return JSON.parse(raw) as FilterState
  } catch {
    return {
      search: '',
      categoryIds: [],
      types: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'date-desc',
    }
  }
}

const filters = ref<FilterState>(loadFilters())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters.value))
}

export function useFilters() {
  const isFiltered = computed(
    () =>
      filters.value.search.length > 0 ||
      filters.value.categoryIds.length > 0 ||
      filters.value.types.length > 0 ||
      filters.value.dateFrom ||
      filters.value.dateTo
  )

  function setSearch(query: string) {
    filters.value.search = query
    persist()
  }

  function toggleCategory(categoryId: string) {
    const idx = filters.value.categoryIds.indexOf(categoryId)
    if (idx === -1) {
      filters.value.categoryIds.push(categoryId)
    } else {
      filters.value.categoryIds.splice(idx, 1)
    }
    persist()
  }

  function setCategories(categoryIds: string[]) {
    filters.value.categoryIds = categoryIds
    persist()
  }

  function toggleType(type: TransactionType) {
    const idx = filters.value.types.indexOf(type)
    if (idx === -1) {
      filters.value.types.push(type)
    } else {
      filters.value.types.splice(idx, 1)
    }
    persist()
  }

  function setTypes(types: TransactionType[]) {
    filters.value.types = types
    persist()
  }

  function setDateRange(from: string | null, to: string | null) {
    filters.value.dateFrom = from
    filters.value.dateTo = to
    persist()
  }

  function setSortBy(sort: SortBy) {
    filters.value.sortBy = sort
    persist()
  }

  function reset() {
    filters.value = {
      search: '',
      categoryIds: [],
      types: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'date-desc',
    }
    persist()
  }

  return {
    filters,
    isFiltered,
    setSearch,
    toggleCategory,
    setCategories,
    toggleType,
    setTypes,
    setDateRange,
    setSortBy,
    reset,
  }
}
