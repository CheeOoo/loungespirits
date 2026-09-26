<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import IngredientCombobox from '@/components/IngredientCombobox.vue'
import FillLevelSlider from '@/components/FillLevelSlider.vue'
import { useDrinks } from '@/composables/useDrinks'

const open = defineModel('open', { type: Boolean, default: false })

const { ingredients, availableToAdd, setCabinetItem, ingUnit } = useDrinks()

const selectedId = ref('')
const fillPercent = ref(100)
const quantity = ref(1)
const errors = ref([])
const saving = ref(false)

const selectedUnit = computed(() => (selectedId.value ? ingUnit(selectedId.value) : 'ml'))
const isCount = computed(() => selectedUnit.value === 'count')

watch(open, (isOpen) => {
  if (isOpen) {
    selectedId.value = ''
    fillPercent.value = 100
    quantity.value = 1
    errors.value = []
  }
})

async function handleSave() {
  if (!selectedId.value) {
    errors.value = ['Select an ingredient first.']
    return
  }
  saving.value = true
  errors.value = []
  try {
    await setCabinetItem(
      selectedId.value,
      isCount.value ? { quantity: quantity.value } : { fillPercent: fillPercent.value },
    )
    open.value = false
  } catch (err) {
    errors.value = [err.message || 'Could not add this to your cabinet. Please try again.']
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogTitle>Add to Cabinet</DialogTitle>
      <DialogDescription>Pick what you have and how much is left.</DialogDescription>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-1 block">Ingredient</label>
          <IngredientCombobox v-model="selectedId" :ingredients="availableToAdd" />
          <p v-if="availableToAdd.length === 0" class="text-xs text-muted-foreground mt-1.5">
            Everything's already in your cabinet.
          </p>
        </div>

        <template v-if="selectedId">
          <FillLevelSlider v-if="!isCount" v-model="fillPercent" />
          <div v-else>
            <label class="text-sm font-medium mb-1 block">How many</label>
            <Input v-model.number="quantity" type="number" min="0" step="1" class="w-24" />
          </div>
        </template>

        <ul v-if="errors.length" class="text-sm text-destructive space-y-1">
          <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
        </ul>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button @click="handleSave" :disabled="saving || !selectedId">
          {{ saving ? 'Adding...' : 'Add to cabinet' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
