<script setup>
import { computed } from 'vue'

const STEPS = [0, 25, 50, 75, 100]

const props = defineProps({
  modelValue: { type: Number, default: 100 },
})
const emit = defineEmits(['update:modelValue'])

const stepIndex = computed(() => {
  const idx = STEPS.indexOf(props.modelValue)
  return idx === -1 ? STEPS.length - 1 : idx
})

function onInput(e) {
  const idx = Number(e.target.value)
  emit('update:modelValue', STEPS[idx])
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-1.5">
      <span class="text-xs text-muted-foreground">Fill level</span>
      <span class="text-sm font-medium">{{ modelValue }}%</span>
    </div>

    <div class="relative pt-1 pb-4">
      <!-- tick marks -->
      <div class="absolute top-0 left-0 right-0 flex justify-between px-[2px]">
        <span
          v-for="(step, i) in STEPS"
          :key="step"
          class="w-px h-2 bg-border"
          :class="i <= stepIndex && 'bg-primary'"
        />
      </div>

      <input
        type="range"
        min="0"
        :max="STEPS.length - 1"
        step="1"
        :value="stepIndex"
        @input="onInput"
        class="w-full mt-2 accent-primary cursor-pointer"
      />

      <div class="flex justify-between mt-1">
        <span v-for="step in STEPS" :key="step" class="text-[10px] text-muted-foreground">
          {{ step }}%
        </span>
      </div>
    </div>
  </div>
</template>
