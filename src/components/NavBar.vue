<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Button } from '@/components/ui/button'
import DrinkFormDialog from '@/components/DrinkFormDialog.vue'
import { cn } from '@/lib/utils'

const route = useRoute()
const addDialogOpen = ref(false)

const NAV_LINKS = [
  { to: '/', label: 'Browse' },
  { to: '/cabinet', label: 'My Cabinet' },
  { to: '/ingredients', label: 'Ingredients' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-8">
        <img src="/img/lounge-spirits-logo-w.svg" alt="" class="size-8 shrink-0" />
        <h1 class="text-xl font-semibold tracking-tight">Lounge Spirits</h1>
        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="link in NAV_LINKS"
            :key="link.to"
            :to="link.to"
            :class="cn(
              'text-sm px-3 py-1.5 rounded-md transition-colors',
              route.path === link.to ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            )"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="icon" @click="addDialogOpen = true" aria-label="Add a drink">
          <Plus class="size-4" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  </header>

  <DrinkFormDialog v-model:open="addDialogOpen" />
</template>
