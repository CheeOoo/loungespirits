import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'cabinet-theme'

// default to dark unless the user has explicitly chosen light before
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const isDark = ref(stored ? stored === 'dark' : true)

watchEffect(() => {
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }
})

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }
  return { isDark, toggleTheme }
}
