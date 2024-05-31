<template>
  <NuxtPage />
</template>

<script setup lang="ts">
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, viewport-fit=cover'
    }
  ]
})
</script>

<style>
html {
  background-color: #fff;
  color: rgba(0, 0, 0, .9);
}

@media (prefers-color-scheme: dark) {
  html {
    background-color: #111111;
    color: rgba(255, 255, 255, .9);
  }
}
</style>
