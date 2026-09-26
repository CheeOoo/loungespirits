<script setup>
import { Star } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps({
  drink: { type: Object, required: true },
  ingName: { type: Function, required: true },
  // Cabinet page only: show ingredient list, with red highlight for missing ones
  showIngredients: { type: Boolean, default: false },
})
const emit = defineEmits(['open', 'toggleFavorite'])

function onStarClick(e) {
  e.stopPropagation()
  emit('toggleFavorite', props.drink.id)
}
</script>

<template>
  <Card
    class="group overflow-hidden py-0 gap-0 cursor-pointer h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5"
    @click="$emit('open', drink)"
  >
    <!-- Image with star overlay -->
    <div class="relative aspect-[4/3] bg-muted overflow-hidden shrink-0">
      <img
        :src="drink.image || '/img/sample.png'"
        :alt="drink.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <button
        @click="onStarClick"
        class="absolute top-2 right-2 rounded-full bg-black/40 backdrop-blur-sm p-1.5 transition-colors hover:bg-black/60"
        :aria-label="drink.favorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <Star
          class="size-4 transition-colors"
          :class="drink.favorite ? 'fill-amber-400 text-amber-400' : 'text-white'"
        />
      </button>
    </div>

    <!-- Body -->
    <CardContent class="p-4 flex flex-col flex-1 gap-2">
      <h3 class="font-semibold leading-tight">{{ drink.name }}</h3>

      <div v-if="drink.tags?.length" class="flex flex-wrap gap-1">
        <Badge v-for="tag in drink.tags.slice(0, 3)" :key="tag" variant="secondary" class="text-[10px] px-1.5 py-0 font-normal">
          {{ tag }}
        </Badge>
      </div>

      <p v-if="drink.description" class="text-xs text-muted-foreground line-clamp-2">
        {{ drink.description }}
      </p>

      <p class="text-xs text-muted-foreground/80 mt-auto pt-1">
        {{ drink.glass }}<template v-if="drink.method"> · {{ drink.method }}</template>
      </p>

      <template v-if="showIngredients">
        <div class="border-t pt-2 mt-1">
          <ul class="text-xs space-y-0.5">
            <li
              v-for="ing in drink.ingredients"
              :key="ing.id"
              :class="drink.missing?.includes(ing.id) ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ ing.amount }} {{ ingName(ing.id) }}
            </li>
          </ul>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
