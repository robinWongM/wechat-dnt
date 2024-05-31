<template>
  <ShareCard v-if="sanitized" :url="sanitized.fullLink" />
  <div v-else>
    unsupported url: {{ originalUrl }}
  </div>

  <!-- <iframe :src="urlWithScheme" sandbox="allow-scripts allow-same-origin allow-top-navigation" referrerpolicy="no-referrer" class="w-full h-96"></iframe> -->
</template>

<script setup lang="ts">
import { match } from '@dnt/core';

const route = useRoute();
const originalUrl = computed(() => {
  const urlInParams = route.params.url;
  const queryParams = new URLSearchParams(route.query as Record<string, string>);
  const urlWithoutScheme = Array.isArray(urlInParams) ? urlInParams.join('/') : urlInParams;

  return `https://${urlWithoutScheme}?${queryParams.toString()}`;
});
const sanitized = computed(() => match(originalUrl.value));

if (import.meta.client) {
  const { config } = useWxSdk();
  const client = useNuxtApp().$client;
  const { data: wxConfig } = await client.getWxConfig.useQuery({
    url: location.href,
  });
  config({
    ...wxConfig.value!,
    debug: true,
    jsApiList: ['updateAppMessageShareData'],
    openTagList: [],
  });
}
</script>
