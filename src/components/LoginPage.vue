<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const { error, loading, login, register } = useAuth()

const canSubmit = computed(() => {
  if (isLogin.value) {
    return username.value.trim().length >= 3 && password.value.length >= 6
  }
  return username.value.trim().length >= 3 && password.value.length >= 6 && password.value === passwordConfirm.value
})

async function handleSubmit() {
  try {
    if (isLogin.value) {
      await login(username.value.trim(), password.value)
    } else {
      await register(username.value.trim(), password.value)
    }
    // Success — router guard will redirect to /home
    router.push('/home')
  } catch (err) {
    // Error already set in useAuth, will display below
    console.error(err)
  }
}

function toggleMode() {
  isLogin.value = !isLogin.value
  username.value = ''
  password.value = ''
  passwordConfirm.value = ''
  error.value = null
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <span class="login-icon">💰</span>
        <h1>Daftar Transaksi</h1>
        <p class="login-subtitle">Kelola keuangan dengan mudah</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Minimal 3 karakter"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Minimal 6 karakter"
            class="form-input"
            required
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="password-confirm">Konfirmasi Password</label>
          <input
            id="password-confirm"
            v-model="passwordConfirm"
            type="password"
            placeholder="Ulangi password"
            class="form-input"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? 'Loading...' : isLogin ? 'Masuk' : 'Daftar' }}
        </button>
      </form>

      <div class="login-toggle">
        <span class="toggle-text">
          {{ isLogin ? 'Belum punya akun?' : 'Sudah punya akun?' }}
        </span>
        <button
          type="button"
          class="toggle-btn"
          @click="toggleMode"
        >
          {{ isLogin ? 'Daftar sekarang' : 'Masuk di sini' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg);
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem 2rem;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  animation: slideUp var(--dur-modal) var(--ease-out);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.login-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.login-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.login-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.form-input {
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--surface-muted);
  color: var(--text);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.form-input:focus {
  outline: none;
  background: var(--surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.error-message {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid var(--danger);
}

.btn-submit {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.toggle-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color var(--dur-fast) var(--ease-out);
  padding: 0;
}

@media (hover: hover) and (pointer: fine) {
  .toggle-btn:hover {
    color: var(--primary-hover);
  }
}
</style>
