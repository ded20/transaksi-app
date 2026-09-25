import { ref, computed } from 'vue'

const STORAGE_KEY = 'transaksi-app:user'
const API_BASE = 'http://localhost:8000/api'

export interface User {
  id: string
  username: string
  created_at: string
}

function loadUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function persist(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
    // Clear all user data
    localStorage.removeItem('transaksi-app:transactions')
    localStorage.removeItem('transaksi-app:categories')
    localStorage.removeItem('transaksi-app:filters')
  }
}

// Global state (shared across all composable instances)
let currentUserState: User | null = loadUser()
const userStateListeners = new Set<() => void>()

function notifyListeners() {
  userStateListeners.forEach(listener => listener())
}

export function useAuth() {
  const currentUser = ref<User | null>(currentUserState)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)

  // Subscribe to state changes
  const unsubscribe = () => {
    userStateListeners.delete(notifyListeners)
  }

  userStateListeners.add(() => {
    currentUser.value = currentUserState
  })

  async function register(username: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      // Frontend validation dulu
      if (!username || username.trim().length < 3) {
        throw new Error('Username minimal 3 karakter')
      }
      if (!password || password.length < 6) {
        throw new Error('Password minimal 6 karakter')
      }
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registrasi gagal')
      }
      
      const user = data as User
      currentUserState = user
      persist(user)
      notifyListeners()
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registrasi gagal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      // Frontend validation dulu
      if (!username || !password) {
        throw new Error('Username dan password harus diisi')
      }
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal')
      }
      
      const user = data as User
      currentUserState = user
      persist(user)
      notifyListeners()
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login gagal'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    
    try {
      if (currentUserState) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'x-user-id': currentUserState.id },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      currentUserState = null
      persist(null)
      notifyListeners()
      loading.value = false
    }
  }

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
  }
}
