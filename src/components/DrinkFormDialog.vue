<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, X, Trash2 } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import IngredientCombobox from '@/components/IngredientCombobox.vue'
import { useDrinks } from '@/composables/useDrinks'

const props = defineProps({
  // pass an existing drink to edit it; omit/null to add a new one
  editingDrink: { type: Object, default: null },
})
const open = defineModel('open', { type: Boolean, default: false })

const { ingredients, drinks, allTags, addDrink, updateDrink, removeDrink } = useDrinks()

const GLASS_OPTIONS = ['Coupe', 'Highball', 'Lowball', 'Rocks', 'Shot', 'Martini', 'Collins']
const METHOD_OPTIONS = ['Shaken', 'Stirred', 'Built', 'Muddled', 'Layered', 'Blended']

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyForm = () => ({
  name: '',
  glass: '',
  method: '',
  image: '',
  description: '',
  tags: [],
  ingredientRows: [{ ingredientId: '', amount: '' }],
  instructions: [''],
})

const form = ref(emptyForm())
const newTagInput = ref('')
const errors = ref([])

watch(
  () => [props.editingDrink, open.value],
  () => {
    if (open.value && props.editingDrink) {
      const d = props.editingDrink
      form.value = {
        name: d.name || '',
        glass: d.glass || '',
        method: d.method || '',
        image: d.image || '',
        description: d.description || '',
        tags: [...(d.tags || [])],
        ingredientRows: d.ingredients?.length
          ? d.ingredients.map((i) => ({ ingredientId: i.id, amount: i.amount }))
          : [{ ingredientId: '', amount: '' }],
        instructions: d.instructions?.length ? [...d.instructions] : [''],
      }
    } else if (open.value && !props.editingDrink) {
      form.value = emptyForm()
    }
    errors.value = []
  },
  { immediate: true },
)

function toggleTag(tag) {
  const i = form.value.tags.indexOf(tag)
  if (i === -1) form.value.tags.push(tag)
  else form.value.tags.splice(i, 1)
}

function addNewTag() {
  const t = newTagInput.value.trim()
  if (t && !form.value.tags.includes(t)) {
    form.value.tags.push(t)
  }
  newTagInput.value = ''
}

function addIngredientRow() {
  form.value.ingredientRows.push({ ingredientId: '', amount: '' })
}

function removeIngredientRow(index) {
  form.value.ingredientRows.splice(index, 1)
  if (form.value.ingredientRows.length === 0) {
    form.value.ingredientRows.push({ ingredientId: '', amount: '' })
  }
}

function addInstructionLine() {
  form.value.instructions.push('')
}

function removeInstructionLine(index) {
  form.value.instructions.splice(index, 1)
  if (form.value.instructions.length === 0) {
    form.value.instructions.push('')
  }
}

const isEditing = computed(() => !!props.editingDrink)

function validate() {
  const errs = []
  if (!form.value.name.trim()) errs.push('Name is required.')
  if (!form.value.glass) errs.push('Glass is required.')
  const validRows = form.value.ingredientRows.filter((r) => r.ingredientId && r.amount.trim())
  if (validRows.length === 0) errs.push('At least one ingredient with an amount is required.')
  const validSteps = form.value.instructions.filter((s) => s.trim())
  if (validSteps.length === 0) errs.push('At least one instruction step is required.')
  errors.value = errs
  return errs.length === 0
}

const saving = ref(false)

async function handleSave() {
  if (!validate()) return

  const id = isEditing.value ? props.editingDrink.id : slugify(form.value.name)

  const payload = {
    id,
    name: form.value.name.trim(),
    glass: form.value.glass,
    method: form.value.method || null,
    image: form.value.image.trim() || null,
    description: form.value.description.trim() || null,
    favorite: isEditing.value ? props.editingDrink.favorite : false,
    tags: form.value.tags,
    ingredients: form.value.ingredientRows
      .filter((r) => r.ingredientId && r.amount.trim())
      .map((r) => ({ id: r.ingredientId, amount: r.amount.trim() })),
    instructions: form.value.instructions.map((s) => s.trim()).filter(Boolean),
  }

  saving.value = true
  errors.value = []
  try {
    if (isEditing.value) {
      await updateDrink(id, payload)
    } else {
      // avoid id collisions with existing drinks
      let finalId = id
      let n = 2
      while (drinks.value.some((d) => d.id === finalId)) {
        finalId = `${id}-${n}`
        n++
      }
      payload.id = finalId
      await addDrink(payload)
    }
    open.value = false
  } catch (err) {
    errors.value = [err.message || 'Something went wrong saving this drink. Please try again.']
  } finally {
    saving.value = false
  }
}
async function handleDelete() {
  if (!isEditing.value) return
  const confirmed = window.confirm(`Delete "${props.editingDrink.name}"? This can't be undone.`)
  if (!confirmed) return
  saving.value = true
  try {
    await removeDrink(props.editingDrink.id)
    open.value = false
  } catch (err) {
    errors.value = [err.message || 'Could not delete this drink. Please try again.']
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-xl">
      <DialogTitle>{{ isEditing ? 'Edit Drink' : 'Add a Drink' }}</DialogTitle>
      <DialogDescription>
        {{ isEditing ? 'Update this recipe.' : 'Fill in the details for a new recipe.' }}
      </DialogDescription>

      <div class="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        <!-- Name -->
        <div>
          <label class="text-sm font-medium mb-1 block">Name</label>
          <Input v-model="form.name" placeholder="e.g. Paper Plane" />
        </div>

        <!-- Glass + Method -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium mb-1 block">Glass</label>
            <Select v-model="form.glass">
              <SelectTrigger>
                <SelectValue placeholder="Select glass" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="g in GLASS_OPTIONS" :key="g" :value="g">{{ g }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm font-medium mb-1 block">Method</label>
            <Select v-model="form.method">
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ m }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Image URL -->
        <div>
          <label class="text-sm font-medium mb-1 block">Image link</label>
          <Input v-model="form.image" placeholder="https://..." />
        </div>

        <!-- Description -->
        <div>
          <label class="text-sm font-medium mb-1 block">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="A short description of the drink..."
            class="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <!-- Tags -->
        <div>
          <label class="text-sm font-medium mb-1 block">Tags</label>
          <div v-if="allTags.length" class="flex flex-wrap gap-1.5 mb-2">
            <Badge
              v-for="tag in allTags"
              :key="tag"
              :variant="form.tags.includes(tag) ? 'default' : 'outline'"
              class="cursor-pointer select-none"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </Badge>
          </div>
          <div class="flex gap-2">
            <Input
              v-model="newTagInput"
              placeholder="Add a new tag..."
              @keydown.enter.prevent="addNewTag"
              class="flex-1"
            />
            <Button type="button" variant="outline" @click="addNewTag">Add</Button>
          </div>
          <div v-if="form.tags.filter((t) => !allTags.includes(t)).length" class="flex flex-wrap gap-1.5 mt-2">
            <Badge
              v-for="tag in form.tags.filter((t) => !allTags.includes(t))"
              :key="tag"
              class="gap-1 cursor-pointer"
              @click="toggleTag(tag)"
            >
              {{ tag }}
              <X class="size-3" />
            </Badge>
          </div>
        </div>

        <!-- Ingredients -->
        <div>
          <label class="text-sm font-medium mb-1 block">Ingredients</label>
          <div class="space-y-2">
            <div
              v-for="(row, i) in form.ingredientRows"
              :key="i"
              class="flex gap-2 items-start"
            >
              <div class="flex-1">
                <IngredientCombobox v-model="row.ingredientId" :ingredients="ingredients" />
              </div>
              <Input v-model="row.amount" placeholder="e.g. 50ml" class="w-28 shrink-0" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="shrink-0"
                @click="removeIngredientRow(i)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" class="mt-2 gap-1" @click="addIngredientRow">
            <Plus class="size-3.5" /> Add ingredient
          </Button>
        </div>

        <!-- Instructions -->
        <div>
          <label class="text-sm font-medium mb-1 block">Instructions</label>
          <div class="space-y-2">
            <div
              v-for="(step, i) in form.instructions"
              :key="i"
              class="flex gap-2 items-center"
            >
              <span class="text-xs text-muted-foreground w-4 shrink-0">{{ i + 1 }}.</span>
              <Input v-model="form.instructions[i]" placeholder="Describe this step..." class="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="shrink-0"
                @click="removeInstructionLine(i)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" class="mt-2 gap-1" @click="addInstructionLine">
            <Plus class="size-3.5" /> Add step
          </Button>
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
          <Trash2 class="size-3.5" /> Delete drink
        </Button>
        <div v-else></div>
        <div class="flex gap-2">
          <Button variant="outline" @click="open = false">Cancel</Button>
          <Button @click="handleSave" :disabled="saving">
            {{ saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add drink' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
