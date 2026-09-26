<script setup>
import { ref } from 'vue'
import { Pencil } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DrinkFormDialog from '@/components/DrinkFormDialog.vue'

const props = defineProps({
  drink: { type: Object, default: null },
  ingName: { type: Function, required: true },
  showMissing: { type: Boolean, default: false },
})
const open = defineModel('open', { type: Boolean, default: false })

const editOpen = ref(false)

function startEdit() {
  open.value = false
  editOpen.value = true
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="drink" class="p-0 gap-0">
      <div class="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
        <img
          :src="drink.image || '/img/sample.png'"
          :alt="drink.name"
          class="w-full h-full object-cover"
        />
        <Button
          variant="secondary"
          size="sm"
          class="absolute bottom-3 right-3 gap-1.5"
          @click="startEdit"
        >
          <Pencil class="size-3.5" /> Edit
        </Button>
      </div>

      <div class="p-6">
        <div class="min-h-14">
          <DialogTitle class="line-clamp-2">{{ drink.name }}</DialogTitle>
          <DialogDescription>{{ drink.glass }}<template v-if="drink.method"> · {{ drink.method }}</template></DialogDescription>
        </div>

        <div v-if="drink.tags?.length" class="flex flex-wrap gap-1 mt-3">
          <Badge v-for="tag in drink.tags" :key="tag" variant="secondary" class="text-[10px] px-1.5 py-0 font-normal">
            {{ tag }}
          </Badge>
        </div>

        <p v-if="drink.description" class="text-sm text-muted-foreground mt-3 mb-1">
          {{ drink.description }}
        </p>

        <p class="text-sm font-medium mt-5 mb-2">Ingredients</p>
        <ul class="text-sm space-y-1 mb-5">
          <li
            v-for="ing in drink.ingredients"
            :key="ing.id"
            :class="showMissing && drink.missing?.includes(ing.id) ? 'text-destructive' : 'text-muted-foreground'"
          >
            {{ ing.amount }} {{ ingName(ing.id) }}
          </li>
        </ul>

        <p class="text-sm font-medium mb-2">Method</p>
        <ol class="text-sm text-muted-foreground list-decimal list-inside space-y-1.5">
          <li v-for="(step, i) in drink.instructions" :key="i">{{ step }}</li>
        </ol>
      </div>
    </DialogContent>
  </Dialog>

  <DrinkFormDialog v-model:open="editOpen" :editing-drink="drink" />
</template>
