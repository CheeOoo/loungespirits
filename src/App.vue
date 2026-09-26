<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent)]">
    <NavBar />
    <RouterView />
  </div>
</template>
