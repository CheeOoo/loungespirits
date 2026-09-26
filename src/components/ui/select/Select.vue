<script setup>
import { SelectRoot, useForwardPropsEmits } from 'reka-ui'

const props = defineProps({
  modelValue: { type: String, required: false },
  defaultValue: { type: String, required: false },
})
const emits = defineEmits(['update:modelValue'])
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
