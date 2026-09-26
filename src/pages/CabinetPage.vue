<script setup>
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useDrinks } from '@/composables/useDrinks'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import DrinkCard from '@/components/DrinkCard.vue'
import DrinkDetailDialog from '@/components/DrinkDetailDialog.vue'
import CabinetEntryRow from '@/components/CabinetEntryRow.vue'
import AddToCabinetDialog from '@/components/AddToCabinetDialog.vue'

const {
  search,
  setSearch,
  activeFilters,
  toggleFilter,
  clearFilters,
  activeTagFilters,
  toggleTagFilter,
  clearTagFilters,
  allTags,
  toggleFavorite,
  ingName,
  ingredientsByCategory,
  cabinetDrinks,
  cabinetEntries,
  showOnlyMakeable,
  toggleShowOnlyMakeable,
  loading,
  loadError,
} = useDrinks()

const dialogOpen = ref(false)
const selectedDrink = ref(null)
const addCabinetOpen = ref(false)

function openDrink(drink) {
  selectedDrink.value = drink
  dialogOpen.value = true
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
    <!-- Left: what you have -->
    <aside class="lg:w-72 shrink-0">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-sm font-medium">What's on the shelf</h2>
        <Button variant="ghost" size="icon" class="size-7" @click="addCabinetOpen = true" aria-label="Add to cabinet">
          <Plus class="size-4" />
        </Button>
      </div>
      <p class="text-xs text-muted-foreground mb-4">Track what you have and how much is left</p>

      <p v-if="cabinetEntries.length === 0" class="text-sm text-muted-foreground">
        Nothing in your cabinet yet. Add what you've got with the plus button above.
      </p>

      <div class="space-y-2">
        <CabinetEntryRow v-for="entry in cabinetEntries" :key="entry.id" :entry="entry" />
      </div>
    </aside>

    <!-- Right: drinks -->
    <main class="flex-1 min-w-0">
      <SearchFilterBar
        :search="search"
        :active-filters="activeFilters"
        :ingredients-by-category="ingredientsByCategory"
        :ing-name="ingName"
        :active-tag-filters="activeTagFilters"
        :all-tags="allTags"
        @update:search="setSearch"
        @toggle-filter="toggleFilter"
        @clear-filters="clearFilters"
        @toggle-tag-filter="toggleTagFilter"
        @clear-tag-filters="clearTagFilters"
      />

      <label class="flex items-center gap-2 mb-6 text-sm cursor-pointer w-fit">
        <Checkbox :model-value="showOnlyMakeable" @update:model-value="toggleShowOnlyMakeable" />
        Only show drinks I can make
      </label>

      <p v-if="loadError" class="text-sm text-destructive">{{ loadError }}</p>
      <p v-else-if="loading" class="text-sm text-muted-foreground">Loading drinks...</p>
      <p v-else-if="cabinetDrinks.length === 0" class="text-sm text-muted-foreground">
        Nothing matches. Try adding a few more ingredients, or turn off "only show drinks I can make."
      </p>

      <div v-if="!loading && !loadError" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        <DrinkCard
          v-for="drink in cabinetDrinks"
          :key="drink.id"
          :drink="drink"
          :ing-name="ingName"
          :show-ingredients="true"
          @open="openDrink"
          @toggle-favorite="toggleFavorite"
        />
      </div>

      <DrinkDetailDialog
        v-model:open="dialogOpen"
        :drink="selectedDrink"
        :ing-name="ingName"
        :show-missing="true"
      />
    </main>

    <AddToCabinetDialog v-model:open="addCabinetOpen" />
  </div>
</template>
