<template>
  <ShareCard v-if="sanitized" :url="sanitized.fullLink" />
  <div v-else>
    unsupported url: {{ originalUrl }}
  </div>

  <!-- <iframe :src="urlWithScheme" sandbox="allow-scripts allow-same-origin allow-top-navigation" referrerpolicy="no-referrer" class="w-full h-96"></iframe> -->
</template>

<script setup lang="ts">
import { sanitize } from '@dnt/core';
import { useTitle } from '@vueuse/core';

const route = useRoute();
const originalUrl = computed(() => {
  const urlInParams = route.params.url;
  const queryParams = new URLSearchParams(route.query as Record<string, string>);
  const urlWithoutScheme = Array.isArray(urlInParams) ? urlInParams.join('/') : urlInParams;

  return `https://${urlWithoutScheme}?${queryParams.toString()}`;
});
const sanitized = computed(() => sanitize(originalUrl.value));

useTitle('干净分享 - 别瞅着我');
</script>
