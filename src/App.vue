<template>
  <div class="app-wrapper">
    <Sidebar v-if="isAuthenticated" @toggle="sidebarCollapsed = $event" />
    <main class="app-main" :class="{ 'with-sidebar': isAuthenticated, 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Top bar dengan theme toggle -->
      <div v-if="isAuthenticated" class="top-bar">
        <div></div>
        <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Light Mode' : 'Dark Mode'">
          <span v-if="theme === 'dark'" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
          <span class="theme-label">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useTheme } from './composables/useTheme'
import Sidebar from './components/Sidebar.vue'

const { isAuthenticated } = useAuth()
const { theme, toggleTheme } = useTheme()
const sidebarCollapsed = ref(false)
</script>

<style scoped>
.app-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.app-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
  transition: margin-left var(--dur-base) var(--ease-out);
}

.app-main.sidebar-collapsed {
  margin-left: 70px;
}

.app-main:not(.with-sidebar) {
  margin-left: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--dur-fast) var(--ease-out);
}

.theme-toggle:hover {
  background: var(--surface);
  border-color: var(--primary);
}

.theme-toggle:active {
  transform: scale(0.97);
}

.theme-icon {
  font-size: 1.1rem;
}

.theme-label {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
    margin-top: 70px;
  }

  .app-main.sidebar-collapsed {
    margin-left: 0;
  }

  .top-bar {
    padding: 0.75rem 1rem;
  }

  .theme-label {
    display: none;
  }

  .theme-toggle {
    padding: 0.5rem;
  }
}
</style>
