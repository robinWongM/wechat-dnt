<template>
  <div :class="theme">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { usePreferredColorScheme } from '@vueuse/core';
const theme = usePreferredColorScheme();

useHead({
  htmlAttrs: {
    lang: 'zh-CN',
  },
});
</script>
