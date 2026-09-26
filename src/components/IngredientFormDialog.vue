<script setup>
import { ref, watch, computed } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-vue-next'
import { useDrinks } from '@/composables/useDrinks'

const props = defineProps({
  editingIngredient: { type: Object, default: null },
})
const open = defineModel('open', { type: Boolean, default: false })

const { addIngredient, updateIngredient, removeIngredient } = useDrinks()

const CATEGORY_OPTIONS = ['spirit', 'liqueur', 'mixer', 'bitters', 'garnish', 'other']
const UNIT_OPTIONS = [
  { value: 'ml', label: 'Millilitres (measured, shows a fill level)' },
  { value: 'count', label: 'Count (discrete items, e.g. limes, mint)' },
]

const isEditing = computed(() => !!props.editingIngredient)

const form = ref({ name: '', category: 'spirit', description: '', unit: 'ml' })
const errors = ref([])
const saving = ref(false)

watch(
  () => [props.editingIngredient, open.value],
  () => {
    if (open.value && props.editingIngredient) {
      const i = props.editingIngredient
      form.value = {
        name: i.name || '',
        category: i.category || 'spirit',
        description: i.description || '',
        unit: i.unit || 'ml',
      }
    } else if (open.value) {
      form.value = { name: '', category: 'spirit', description: '', unit: 'ml' }
    }
    errors.value = []
  },
  { immediate: true },
)

async function handleSave() {
  if (!form.value.name.trim()) {
    errors.value = ['Name is required.']
    return
  }
  if (form.value.description.length > 100) {
    errors.value = ['Description must be 100 characters or fewer.']
    return
  }
  saving.value = true
  errors.value = []
  try {
    const payload = {
      name: form.value.name.trim(),
      category: form.value.category,
      description: form.value.description.trim() || null,
      unit: form.value.unit,
    }
    if (isEditing.value) {
      await updateIngredient(props.editingIngredient.id, payload)
    } else {
      await addIngredient(payload)
    }
    open.value = false
  } catch (err) {
    errors.value = [err.message || 'Something went wrong. Please try again.']
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!isEditing.value) return
  const confirmed = window.confirm(
    `Delete "${props.editingIngredient.name}"? This removes it from any cabinet entry too.`,
  )
  if (!confirmed) return
  saving.value = true
  try {
    await removeIngredient(props.editingIngredient.id)
    open.value = false
  } catch (err) {
    errors.value = [err.message || 'Could not delete this ingredient.']
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogTitle>{{ isEditing ? 'Edit Ingredient' : 'Add an Ingredient' }}</DialogTitle>
      <DialogDescription>
        {{ isEditing ? 'Update this ingredient.' : 'Add a new ingredient to use in recipes and your cabinet.' }}
      </DialogDescription>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-1 block">Name</label>
          <Input v-model="form.name" placeholder="e.g. Dry Gin" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1 block">Category</label>
          <Select v-model="form.category">
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c" :value="c" class="capitalize">
                {{ c }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="text-sm font-medium mb-1 block">Measurement</label>
          <Select v-model="form.unit">
            <SelectTrigger>
              <SelectValue placeholder="Select measurement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in UNIT_OPTIONS" :key="u.value" :value="u.value">
                {{ u.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground mt-1.5">
            Measured ingredients get a fill-level slider in your cabinet; count ingredients get a plain number.
          </p>
        </div>

        <div>
          <label class="text-sm font-medium mb-1 block">
            Description
            <span class="text-muted-foreground font-normal">({{ form.description.length }}/100)</span>
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            maxlength="100"
            placeholder="A short description..."
            class="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <ul v-if="errors.length" class="text-sm text-destructive space-y-1">
          <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
        </ul>
      </div>

      <div class="flex items-center justify-between gap-2 pt-2">
        <Button
          v-if="isEditing"
          variant="ghost"
          class="text-destructive hover:text-destructive gap-1.5"
          :disabled="saving"
          @click="handleDelete"
        >
          <Trash2 class="size-3.5" /> Delete
        </Button>
        <div v-else></div>
        <div class="flex gap-2">
          <Button variant="outline" @click="open = false">Cancel</Button>
          <Button @click="handleSave" :disabled="saving">
            {{ saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add ingredient' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
