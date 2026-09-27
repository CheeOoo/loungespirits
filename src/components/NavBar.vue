<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Plus, Menu } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import DrinkFormDialog from '@/components/DrinkFormDialog.vue'
import { cn } from '@/lib/utils'

const route = useRoute()
const addDialogOpen = ref(false)
const mobileNavOpen = ref(false)

const NAV_LINKS = [
  { to: '/', label: 'Browse' },
  { to: '/cabinet', label: 'My Cabinet' },
  { to: '/ingredients', label: 'Ingredients' },
]

function closeMobileNav() {
  mobileNavOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-4 sm:gap-8 min-w-0">
        <!-- Mobile: hamburger menu -->
        <Sheet v-model:open="mobileNavOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="sm:hidden shrink-0" aria-label="Open menu">
              <Menu class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" title="Navigation">
            <nav class="flex flex-col gap-1 mt-6">
              <RouterLink
                v-for="link in NAV_LINKS"
                :key="link.to"
                :to="link.to"
                @click="closeMobileNav"
                :class="cn(
                  'text-sm px-3 py-2 rounded-md transition-colors',
                  route.path === link.to ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                )"
              >
                {{ link.label }}
              </RouterLink>
            </nav>
          </SheetContent>
        </Sheet>

        <div class="flex items-center gap-2 min-w-0">
          <img src="/img/lounge-spirits-logo-w.svg" alt="" class="size-7 sm:size-8 shrink-0" />
          <h1 class="text-lg sm:text-xl font-semibold tracking-tight truncate">Lounge Spirits</h1>
        </div>

        <!-- Desktop: inline nav links -->
        <nav class="hidden sm:flex items-center gap-1">
          <RouterLink
            v-for="link in NAV_LINKS"
            :key="link.to"
            :to="link.to"
            :class="cn(
              'text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap',
              route.path === link.to ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            )"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button variant="outline" size="icon" @click="addDialogOpen = true" aria-label="Add a drink">
          <Plus class="size-4" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  </header>

  <DrinkFormDialog v-model:open="addDialogOpen" />
</template>
