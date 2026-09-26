<script setup>
import { ref, computed } from 'vue'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const props = defineProps({
  ingredients: { type: Array, required: true },
  modelValue: { type: String, default: '' }, // selected ingredient id
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')

const selected = computed(() => props.ingredients.find((i) => i.id === props.modelValue) || null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.ingredients
  return props.ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q),
  )
})

function select(ing) {
  emit('update:modelValue', ing.id)
  open.value = false
  query.value = ''
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger>
      <button
        type="button"
        :class="cn(
          'w-full flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm text-left shadow-xs',
          !selected && 'text-muted-foreground',
        )"
      >
        <span class="truncate">{{ selected ? selected.name : 'Select an ingredient...' }}</span>
        <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-80 p-0">
      <div class="flex items-center border-b px-3">
        <Search class="size-4 shrink-0 opacity-50 mr-2" />
        <input
          v-model="query"
          type="text"
          placeholder="Search ingredients..."
          class="flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div class="max-h-72 overflow-y-auto p-1">
        <p v-if="filtered.length === 0" class="py-4 text-center text-sm text-muted-foreground">
          No ingredient found.
        </p>
        <button
          v-for="ing in filtered"
          :key="ing.id"
          type="button"
          @click="select(ing)"
          class="w-full flex items-start gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Check
            class="size-4 shrink-0 mt-0.5"
            :class="modelValue === ing.id ? 'opacity-100' : 'opacity-0'"
          />
          <span class="flex-1 min-w-0">
            <span class="block font-medium">{{ ing.name }}</span>
            <span v-if="ing.description" class="block text-xs text-muted-foreground line-clamp-2">
              {{ ing.description }}
            </span>
          </span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
