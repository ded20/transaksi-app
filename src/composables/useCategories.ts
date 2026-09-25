import { ref, computed } from 'vue'
import type { Category } from '../types'

const API_BASE = 'http://localhost:8000/api'

const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useCategories() {
  const getCategoryById = (id: string) => categories.value.find(c => c.id === id)

  async function fetchCategories(userId: string | null) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 'x-user-id': userId },
      })
      
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      
      // Map API response (is_default → isDefault)
      categories.value = data.map((c: any) => ({
        ...c,
        isDefault: c.is_default,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch'
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  async function addCategory(userId: string | null, name: string, color: string) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ name, color }),
      })
      
      if (!res.ok) throw new Error('Failed to create category')
      const data = await res.json()
      
      categories.value.push({
        ...data,
        isDefault: data.is_default,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(userId: string | null, id: string, name: string, color: string) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ name, color }),
      })
      
      if (!res.ok) throw new Error('Failed to update category')
      const data = await res.json()
      
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx >= 0) {
        categories.value[idx] = {
          ...data,
          isDefault: data.is_default,
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(userId: string | null, id: string) {
    if (!userId) return
    
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })
      
      if (!res.ok) throw new Error('Failed to delete category')
      
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    getCategoryById,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
