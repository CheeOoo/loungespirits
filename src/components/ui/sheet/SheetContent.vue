<script setup>
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
  side: { type: String, default: 'left' },
  title: { type: String, default: 'Menu' },
})

const sideClasses = {
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-xs border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-xs border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      :class="cn(
        'bg-background fixed z-50 flex flex-col gap-4 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out overflow-y-auto',
        sideClasses[side],
        props.class,
      )"
    >
      <DialogTitle class="sr-only">{{ title }}</DialogTitle>
      <slot />
      <DialogClose
        class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        <X class="size-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
