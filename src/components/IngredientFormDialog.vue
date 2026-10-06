<script setup>
import { ref, watch, computed } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Trash2, ChevronsUpDown, X } from 'lucide-vue-next'
import { useDrinks } from '@/composables/useDrinks'
import { UNIT_TYPES } from '@/lib/units'

const props = defineProps({
  editingIngredient: { type: Object, default: null },
})
const open = defineModel('open', { type: Boolean, default: false })

const { addIngredient, updateIngredient, removeIngredient, ingredients, ingName, ingSubstituteIds, setIngredientSubstitutes } =
  useDrinks()

const CATEGORY_OPTIONS = ['spirit', 'liqueur', 'mixer', 'bitters', 'garnish', 'other']

const isEditing = computed(() => !!props.editingIngredient)

// ingredients other than the one being edited, grouped by category — same
// shape as ingredientsByCategory, used for the substitute picker below
const otherIngredientsByCategory = computed(() => {
  const groups = {}
  for (const ing of ingredients.value) {
    if (ing.id === props.editingIngredient?.id) continue
    groups[ing.category] = groups[ing.category] || []
    groups[ing.category].push(ing)
  }
  return groups
})

const form = ref({ name: '', category: 'spirit', description: '', unit: 'ml' })
const substituteIds = ref([])
const errors = ref([])
const saving = ref(false)

function toggleSubstitute(id) {
  substituteIds.value = substituteIds.value.includes(id)
    ? substituteIds.value.filter((x) => x !== id)
    : [...substituteIds.value, id]
}

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
      substituteIds.value = ingSubstituteIds(i.id)
    } else if (open.value) {
      form.value = { name: '', category: 'spirit', description: '', unit: 'ml' }
      substituteIds.value = []
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
    let ingredientId
    if (isEditing.value) {
      await updateIngredient(props.editingIngredient.id, payload)
      ingredientId = props.editingIngredient.id
    } else {
      const created = await addIngredient(payload)
      ingredientId = created.id
    }
    await setIngredientSubstitutes(ingredientId, substituteIds.value)
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
              <SelectItem v-for="u in UNIT_TYPES" :key="u.value" :value="u.value">
                {{ u.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground mt-1.5">
            Amounts on this ingredient will be entered as a plain number in this unit — no need to type "ml" or "dashes" yourself.
          </p>
        </div>

        <div>
          <label class="text-sm font-medium mb-1 block">Substitutes</label>
          <Popover>
            <PopoverTrigger>
              <Button variant="outline" class="w-full justify-between gap-2 font-normal">
                <span class="text-muted-foreground">
                  {{ substituteIds.length ? `${substituteIds.length} selected` : 'None selected' }}
                </span>
                <ChevronsUpDown class="size-4 text-muted-foreground shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-80 max-h-80 overflow-y-auto">
              <p class="text-xs text-muted-foreground mb-3">
                Ingredients that can stand in for this one, and vice versa.
              </p>
              <div v-for="(items, category) in otherIngredientsByCategory" :key="category" class="mb-4 last:mb-0">
                <p class="text-xs font-medium mb-2 text-muted-foreground capitalize">{{ category }}</p>
                <label
                  v-for="ing in items"
                  :key="ing.id"
                  class="flex items-center gap-2 py-1 cursor-pointer text-sm"
                >
                  <Checkbox
                    :model-value="substituteIds.includes(ing.id)"
                    @update:model-value="toggleSubstitute(ing.id)"
                  />
                  <span>{{ ing.name }}</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>
          <div v-if="substituteIds.length" class="flex flex-wrap gap-1.5 mt-2">
            <Badge
              v-for="id in substituteIds"
              :key="id"
              variant="secondary"
              class="gap-1 cursor-pointer text-xs font-normal"
              @click="toggleSubstitute(id)"
            >
              {{ ingName(id) }}
              <X class="size-3" />
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-1.5">
            Substitutes are symmetric — marking one here also lists this ingredient as a substitute for it.
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
