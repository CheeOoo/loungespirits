<script setup>
import { ref } from 'vue'
import { useDrinks } from '@/composables/useDrinks'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import DrinkCard from '@/components/DrinkCard.vue'
import DrinkDetailDialog from '@/components/DrinkDetailDialog.vue'

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
  filteredDrinks,
  loading,
  loadError,
} = useDrinks()

const dialogOpen = ref(false)
const selectedDrink = ref(null)

function openDrink(drink) {
  selectedDrink.value = drink
  dialogOpen.value = true
}
</script>

<template>
  <main class="max-w-6xl mx-auto px-6 py-8">
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

    <p v-if="loadError" class="text-sm text-destructive">{{ loadError }}</p>
    <p v-else-if="loading" class="text-sm text-muted-foreground">Loading drinks...</p>
    <p v-else-if="filteredDrinks.length === 0" class="text-sm text-muted-foreground">
      No drinks match your search or filters.
    </p>

    <div v-if="!loading && !loadError" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      <DrinkCard
        v-for="drink in filteredDrinks"
        :key="drink.id"
        :drink="drink"
        :ing-name="ingName"
        :show-ingredients="false"
        @open="openDrink"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <DrinkDetailDialog
      v-model:open="dialogOpen"
      :drink="selectedDrink"
      :ing-name="ingName"
      :show-missing="false"
    />
  </main>
</template>
