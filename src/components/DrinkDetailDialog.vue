<script setup>
import { ref, computed } from 'vue'
import { Pencil, Shuffle } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DrinkFormDialog from '@/components/DrinkFormDialog.vue'
import { getUnitType } from '@/lib/units'

const props = defineProps({
  drink: { type: Object, default: null },
  ingName: { type: Function, required: true },
  ingUnit: { type: Function, required: true },
  showMissing: { type: Boolean, default: false },
})
const open = defineModel('open', { type: Boolean, default: false })

const editOpen = ref(false)

function startEdit() {
  open.value = false
  editOpen.value = true
}

function formatAmount(ing) {
  const unitType = getUnitType(props.ingUnit(ing.id))
  return unitType.hasAmount ? `${ing.amount}${unitType.abbrev}` : unitType.abbrev
}

function statusFor(ing) {
  return props.drink?.statusById?.[ing.id]?.status
}

const usesSubstitute = computed(() => props.showMissing && props.drink?.substitutedCount > 0)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="drink" class="p-0 gap-0 grid-cols-1 auto-rows-min">
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
          <DialogDescription class="flex items-center justify-between gap-2">
            <span>{{ drink.glass }}<template v-if="drink.method"> · {{ drink.method }}</template></span>
            <span v-if="drink.garnishId" class="shrink-0">{{ ingName(drink.garnishId) }}</span>
          </DialogDescription>
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

        <div
          v-if="usesSubstitute"
          class="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 mb-3"
        >
          <Shuffle class="size-3.5 shrink-0 mt-0.5" />
          <span>This version swaps in a possible substitute for something you're missing — it may not taste exactly like the original recipe.</span>
        </div>

        <ul class="text-sm space-y-1 mb-5">
          <li
            v-for="ing in drink.ingredients"
            :key="ing.id"
            :class="{
              'text-destructive': showMissing && statusFor(ing) === 'missing',
              'text-amber-700 dark:text-amber-400': showMissing && statusFor(ing) === 'substitute',
              'text-muted-foreground': !showMissing || statusFor(ing) === 'have' || !statusFor(ing),
            }"
          >
            <template v-if="showMissing && statusFor(ing) === 'substitute'">
              <span class="line-through opacity-60">{{ formatAmount(ing) }} {{ ingName(ing.id) }}</span>
              → {{ ingName(drink.statusById[ing.id].substituteId) }}
              <span class="text-[11px] opacity-80">(possible substitute)</span>
            </template>
            <template v-else>
              {{ formatAmount(ing) }} {{ ingName(ing.id) }}
            </template>
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
