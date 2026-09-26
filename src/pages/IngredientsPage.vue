<script setup>
import { ref } from 'vue'
import { Plus, Pencil } from 'lucide-vue-next'
import { useDrinks } from '@/composables/useDrinks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import IngredientFormDialog from '@/components/IngredientFormDialog.vue'

const { ingredientsByCategory, loading, loadError } = useDrinks()

const formOpen = ref(false)
const editingIngredient = ref(null)

function openAdd() {
  editingIngredient.value = null
  formOpen.value = true
}

function openEdit(ing) {
  editingIngredient.value = ing
  formOpen.value = true
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-lg font-semibold">Ingredients</h2>
        <p class="text-sm text-muted-foreground">Everything used across your recipes.</p>
      </div>
      <Button class="gap-1.5" @click="openAdd">
        <Plus class="size-4" /> Add ingredient
      </Button>
    </div>

    <p v-if="loadError" class="text-sm text-destructive">{{ loadError }}</p>
    <p v-else-if="loading" class="text-sm text-muted-foreground">Loading ingredients...</p>

    <div v-else v-for="(items, category) in ingredientsByCategory" :key="category" class="mb-8">
      <h3 class="text-sm font-medium text-muted-foreground capitalize mb-3">{{ category }}</h3>
      <div class="grid sm:grid-cols-2 gap-3">
        <button
          v-for="ing in items"
          :key="ing.id"
          type="button"
          class="group text-left border rounded-lg p-3 flex items-start justify-between gap-2 hover:bg-accent/50 transition-colors"
          @click="openEdit(ing)"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm">{{ ing.name }}</span>
              <Badge variant="outline" class="text-[10px] px-1.5 py-0 font-normal">
                {{ ing.unit === 'count' ? 'count' : ing.unit }}
              </Badge>
            </div>
            <p v-if="ing.description" class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {{ ing.description }}
            </p>
          </div>
          <Pencil class="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </button>
      </div>
    </div>

    <IngredientFormDialog v-model:open="formOpen" :editing-ingredient="editingIngredient" />
  </main>
</template>
