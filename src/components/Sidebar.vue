<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <button class="toggle-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'">
        <span class="toggle-icon">{{ isCollapsed ? '▶' : '◀' }}</span>
      </button>
    </div>

    <div v-if="!isCollapsed" class="sidebar-greeting">
      <p class="greeting-user">Halo, <strong>{{ currentUser?.username }}</strong> 👋</p>
    </div>

    <nav class="sidebar-nav">
      <RouterLink 
        to="/home" 
        class="nav-item" 
        :class="{ active: route.name === 'home' }"
        :title="isCollapsed ? 'Home' : ''"
      >
        <span class="nav-icon">🏠</span>
        <span v-if="!isCollapsed" class="nav-label">Home</span>
      </RouterLink>

      <RouterLink 
        to="/transactions" 
        class="nav-item" 
        :class="{ active: route.name === 'transactions' }"
        :title="isCollapsed ? 'Transaksi' : ''"
      >
        <span class="nav-icon">📋</span>
        <span v-if="!isCollapsed" class="nav-label">Transaksi</span>
      </RouterLink>

      <RouterLink 
        to="/analytics" 
        class="nav-item" 
        :class="{ active: route.name === 'analytics' }"
        :title="isCollapsed ? 'Analitik' : ''"
      >
        <span class="nav-icon">📊</span>
        <span v-if="!isCollapsed" class="nav-label">Analitik</span>
      </RouterLink>

      <RouterLink 
        to="/categories" 
        class="nav-item" 
        :class="{ active: route.name === 'categories' }"
        :title="isCollapsed ? 'Kategori' : ''"
      >
        <span class="nav-icon">🏷️</span>
        <span v-if="!isCollapsed" class="nav-label">Kategori</span>
      </RouterLink>

      <RouterLink 
        to="/profile" 
        class="nav-item" 
        :class="{ active: route.name === 'profile' }"
        :title="isCollapsed ? 'Profil' : ''"
      >
        <span class="nav-icon">👤</span>
        <span v-if="!isCollapsed" class="nav-label">Profil</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <button 
        class="logout-btn" 
        @click="handleLogout"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <span class="logout-icon">🚪</span>
        <span v-if="!isCollapsed" class="logout-text">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { currentUser, logout } = useAuth()
const isCollapsed = ref(false)

const emit = defineEmits<{
  toggle: [collapsed: boolean]
}>()

// Emit toggle state setiap kali berubah
watch(isCollapsed, (newVal) => {
  emit('toggle', newVal)
})

async function handleLogout() {
  if (confirm('Yakin ingin logout?')) {
    await logout()
    router.replace('/')
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: width var(--dur-base) var(--ease-out);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--dur-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-weight: 600;
}

.toggle-btn:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

.toggle-btn:active {
  transform: scale(0.9);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-greeting {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  animation: slideDown var(--dur-base) var(--ease-out);
}

.greeting-user {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.greeting-user strong {
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  transition: all var(--dur-fast) var(--ease-out);
  cursor: pointer;
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  padding: 0.7rem;
  justify-content: center;
}

.nav-item:hover {
  background: var(--surface-muted);
  color: var(--text);
}

.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.nav-item:active {
  transform: scale(0.98);
}

.nav-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.logout-btn {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--dur-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--danger);
  font-weight: 600;
}

.sidebar.collapsed .logout-btn {
  padding: 0.7rem;
}

.logout-btn:hover {
  background: var(--danger-soft);
  border-color: var(--danger);
}

.logout-btn:active {
  transform: scale(0.95);
}

.logout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.logout-text {
  white-space: nowrap;
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

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
  }

  .sidebar.collapsed {
    width: 100%;
  }

  .sidebar-header {
    border-bottom: none;
    border-right: 1px solid var(--border);
    padding: 0.75rem;
  }

  .sidebar-greeting {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    padding: 0 0.5rem;
    gap: 0.25rem;
  }

  .nav-label {
    display: none;
  }

  .sidebar-footer {
    border-top: none;
    border-left: 1px solid var(--border);
  }

  .logout-text {
    display: none;
  }
}
</style>
