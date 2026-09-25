import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'transaksi-app:theme'
type Theme = 'light' | 'dark'

function loadInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // Default pertama kali dibuka: dark mode
  return 'dark'
}

const theme = ref<Theme>(loadInitialTheme())

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem(STORAGE_KEY, theme.value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value: Theme) {
    theme.value = value
  }

  return { theme, toggleTheme, setTheme }
}
