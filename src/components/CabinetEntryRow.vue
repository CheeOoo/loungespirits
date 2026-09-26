<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import FillLevelSlider from '@/components/FillLevelSlider.vue'
import { useDrinks } from '@/composables/useDrinks'

const props = defineProps({
  entry: { type: Object, required: true }, // { id, name, unit, fillPercent, quantity }
})

const { setCabinetItem, removeCabinetItem } = useDrinks()

const isCount = props.entry.unit === 'count'
const localFill = ref(props.entry.fillPercent ?? 100)
const localQty = ref(props.entry.quantity ?? 1)
const open = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    localFill.value = props.entry.fillPercent ?? 100
    localQty.value = props.entry.quantity ?? 1
  }
})

function apply() {
  setCabinetItem(
    props.entry.id,
    isCount ? { quantity: localQty.value } : { fillPercent: localFill.value },
  )
  open.value = false
}

function remove() {
  removeCabinetItem(props.entry.id)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger>
      <button
        type="button"
        class="w-full flex items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-accent/50 transition-colors"
      >
        <span class="text-sm font-medium truncate">{{ entry.name }}</span>
        <span class="text-xs text-muted-foreground shrink-0">
          {{ isCount ? `${entry.quantity ?? 0}` : `${entry.fillPercent ?? 0}%` }}
        </span>
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-72">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium">{{ entry.name }}</p>
        <button
          @click="remove"
          class="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
        >
          <X class="size-3" /> Remove
        </button>
      </div>

      <FillLevelSlider v-if="!isCount" v-model="localFill" />
      <div v-else>
        <label class="text-sm font-medium mb-1 block">How many</label>
        <Input v-model.number="localQty" type="number" min="0" step="1" class="w-24" />
      </div>

      <Button size="sm" class="mt-3 w-full" @click="apply">Update</Button>
    </PopoverContent>
  </Popover>
</template>
