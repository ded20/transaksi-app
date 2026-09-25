<template>
  <div class="categories-container">
    <div class="categories-header">
      <h2>Kategori Transaksi</h2>
      <button class="btn btn-add" @click="showAddForm = true">
        ➕ Tambah Kategori
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" class="category-form-card">
      <h3>{{ editingId ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="cat-name">Nama Kategori</label>
          <input
            id="cat-name"
            v-model="formName"
            type="text"
            placeholder="Contoh: Hobi Baru"
            required
          />
        </div>

        <div class="form-group">
          <label for="cat-color">Warna</label>
          <div class="color-picker">
            <input
              id="cat-color"
              v-model="formColor"
              type="color"
              class="color-input"
            />
            <div class="color-preview" :style="{ backgroundColor: formColor }"></div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editingId ? 'Simpan' : 'Tambah' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="resetForm">
            Batal
          </button>
        </div>
      </form>
    </div>

    <!-- Categories List -->
    <div class="categories-grid">
      <!-- Default Categories -->
      <div class="category-section">
        <h3 class="section-title">Kategori Default</h3>
        <div class="categories-list">
          <div v-for="cat in defaultCategories" :key="cat.id" class="category-item default">
            <div class="cat-color" :style="{ backgroundColor: cat.color }"></div>
            <div class="cat-info">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-badge">Default</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Categories -->
      <div v-if="customCategories.length > 0" class="category-section">
        <h3 class="section-title">Kategori Custom</h3>
        <div class="categories-list">
          <div v-for="cat in customCategories" :key="cat.id" class="category-item custom">
            <div class="cat-color" :style="{ backgroundColor: cat.color }"></div>
            <div class="cat-info">
              <span class="cat-name">{{ cat.name }}</span>
            </div>
            <div class="cat-actions">
              <button
                class="btn-action edit"
                @click="handleEdit(cat)"
                title="Edit"
              >
                ✏️
              </button>
              <button
                class="btn-action delete"
                @click="handleDelete(cat.id)"
                title="Hapus"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="customCategories.length === 0" class="empty-state">
        <p>Belum ada kategori custom</p>
        <button class="btn btn-primary" @click="showAddForm = true">
          Buat Kategori Pertama
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCategories } from '../composables/useCategories'
import type { Category } from '../types'

const { currentUser } = useAuth()
const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategories()

const showAddForm = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formColor = ref('#6D8DFF')

const defaultCategories = computed(() => categories.value.filter(c => c.isDefault))
const customCategories = computed(() => categories.value.filter(c => !c.isDefault))

onMounted(async () => {
  if (currentUser.value?.id) {
    await fetchCategories(currentUser.value.id)
  }
})

function handleSubmit() {
  if (!formName.value.trim()) return

  if (editingId.value) {
    updateCategory(currentUser.value?.id || null, editingId.value, formName.value.trim(), formColor.value)
  } else {
    addCategory(currentUser.value?.id || null, formName.value.trim(), formColor.value)
  }

  resetForm()
}

function handleEdit(cat: Category) {
  editingId.value = cat.id
  formName.value = cat.name
  formColor.value = cat.color
  showAddForm.value = true
}

function handleDelete(id: string) {
  if (confirm('Yakin ingin hapus kategori ini?')) {
    deleteCategory(currentUser.value?.id || null, id)
  }
}

function resetForm() {
  showAddForm.value = false
  editingId.value = null
  formName.value = ''
  formColor.value = '#6D8DFF'
}
</script>

<style scoped>
.categories-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.categories-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.categories-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.btn-add {
  padding: 0.7rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.btn-add:hover {
  background: var(--primary-hover);
}

.btn-add:active {
  transform: scale(0.97);
}

.category-form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  animation: slideDown var(--dur-base) var(--ease-out);
}

.category-form-card h3 {
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--surface-muted);
  color: var(--text);
  box-sizing: border-box;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-input {
  width: 80px;
  height: 50px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: background-color var(--dur-fast) var(--ease-out);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.btn-primary {
  background: var(--primary);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--surface-muted);
  color: var(--text);
  border: 1px solid var(--border);
  flex: 1;
}

.btn-secondary:hover {
  background: var(--surface);
}

.btn:active {
  transform: scale(0.97);
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-section {
  animation: slideUp var(--dur-base) var(--ease-out);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-muted);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all var(--dur-fast) var(--ease-out);
}

.category-item:hover {
  border-color: var(--primary);
  background: var(--surface-muted);
}

.cat-color {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.cat-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cat-name {
  font-weight: 600;
  color: var(--text);
}

.cat-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.cat-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-out);
}

.btn-action:hover {
  background: var(--surface-muted);
}

.btn-action.edit:active,
.btn-action.delete:active {
  transform: scale(0.9);
}

.btn-action.delete:hover {
  background: var(--danger-soft);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--surface);
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .categories-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
  }

  .category-item {
    flex-wrap: wrap;
  }

  .cat-actions {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
