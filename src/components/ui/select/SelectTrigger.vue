<script setup>
import { SelectIcon, SelectTrigger } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({ class: { type: null, required: false } })
</script>

<template>
  <SelectTrigger
    :class="cn(
      'border-input data-[placeholder]:text-muted-foreground flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-[3px] focus:ring-ring/50',
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="size-4 opacity-50 shrink-0" />
    </SelectIcon>
  </SelectTrigger>
</template>
