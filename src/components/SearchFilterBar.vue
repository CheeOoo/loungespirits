<script setup>
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { SlidersHorizontal, X, Tag } from 'lucide-vue-next'

defineProps({
  search: { type: String, required: true },
  activeFilters: { type: Set, required: true },
  ingredientsByCategory: { type: Object, required: true },
  ingName: { type: Function, required: true },
  activeTagFilters: { type: Set, required: true },
  allTags: { type: Array, required: true },
})
defineEmits([
  'update:search',
  'toggleFilter',
  'clearFilters',
  'toggleTagFilter',
  'clearTagFilters',
])
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <Input
        :model-value="search"
        @update:model-value="$emit('update:search', $event)"
        type="text"
        placeholder="Search drinks..."
        class="flex-1"
      />

      <Popover>
        <PopoverTrigger>
          <Button variant="outline" class="gap-2 shrink-0">
            <SlidersHorizontal class="size-4" />
            Ingredients
            <Badge v-if="activeFilters.size > 0" variant="secondary" class="ml-1">
              {{ activeFilters.size }}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-80 max-h-96 overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium">Ingredients</p>
            <button
              v-if="activeFilters.size > 0"
              @click="$emit('clearFilters')"
              class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X class="size-3" /> Clear
            </button>
          </div>

          <div v-for="(items, category) in ingredientsByCategory" :key="category" class="mb-4 last:mb-0">
            <p class="text-xs font-medium mb-2 text-muted-foreground capitalize">{{ category }}</p>
            <label
              v-for="ing in items"
              :key="ing.id"
              class="flex items-center gap-2 py-1 cursor-pointer text-sm"
            >
              <Checkbox
                :model-value="activeFilters.has(ing.id)"
                @update:model-value="$emit('toggleFilter', ing.id)"
              />
              <span>{{ ing.name }}</span>
            </label>
          </div>
        </PopoverContent>
      </Popover>

      <Popover v-if="allTags.length > 0">
        <PopoverTrigger>
          <Button variant="outline" class="gap-2 shrink-0">
            <Tag class="size-4" />
            Tags
            <Badge v-if="activeTagFilters.size > 0" variant="secondary" class="ml-1">
              {{ activeTagFilters.size }}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-64 max-h-96 overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium">Tags</p>
            <button
              v-if="activeTagFilters.size > 0"
              @click="$emit('clearTagFilters')"
              class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X class="size-3" /> Clear
            </button>
          </div>

          <label
            v-for="tag in allTags"
            :key="tag"
            class="flex items-center gap-2 py-1 cursor-pointer text-sm"
          >
            <Checkbox
              :model-value="activeTagFilters.has(tag)"
              @update:model-value="$emit('toggleTagFilter', tag)"
            />
            <span>{{ tag }}</span>
          </label>
        </PopoverContent>
      </Popover>
    </div>

    <div v-if="activeFilters.size > 0 || activeTagFilters.size > 0" class="flex flex-wrap gap-2 mb-6">
      <Badge
        v-for="id in activeFilters"
        :key="'ing-' + id"
        variant="secondary"
        class="gap-1 cursor-pointer"
        @click="$emit('toggleFilter', id)"
      >
        {{ ingName(id) }}
        <X class="size-3" />
      </Badge>
      <Badge
        v-for="tag in activeTagFilters"
        :key="'tag-' + tag"
        variant="outline"
        class="gap-1 cursor-pointer"
        @click="$emit('toggleTagFilter', tag)"
      >
        {{ tag }}
        <X class="size-3" />
      </Badge>
    </div>
  </div>
</template>
