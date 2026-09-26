<script setup>
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <Button variant="ghost" size="icon" @click="toggleTheme" aria-label="Toggle theme">
    <Sun v-if="isDark" class="size-4" />
    <Moon v-else class="size-4" />
  </Button>
</template>
