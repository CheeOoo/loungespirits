<script setup>
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, required: false } })
</script>

<template>
  <div :class="cn('flex items-center px-5', props.class)">
    <slot />
  </div>
</template>
