<template>
  <Suspense>
    <ShareConfirm v-if="data && !isCardPreviewEnabled" @confirm="enableCardPreview" />
    <ShareCard v-else-if="data" :full-link="data.fullLink" :embed-link="data.embedLink" />
  </Suspense>
  <!-- <ShareCard v-else-if="data" :full-link="data.fullLink" :embed-link="data.embedLink" /> -->
  <div class="mb-safe-offset-6 w-full opacity-0 pointer-events-none" v-if="data">
    <div class="max-w-xl mx-auto px-6">
      <ShareAction :full-link="data.fullLink" :iframe-link="data.iframeLink" />
    </div>
  </div>
  <div class="fixed left-0 right-0 bottom-safe-offset-6" v-if="data">
    <div class="max-w-xl mx-auto px-6">
      <ShareAction :full-link="data.fullLink" :iframe-link="data.iframeLink" />
    </div>
  </div>
  <ClientOnly>
    <Toaster position="top-center" :theme="theme" />
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  usePreferredColorScheme,
  useTitle,
} from "@vueuse/core";
import { sanitize } from '@dnt/core';
import { Suspense } from "vue";

useTitle('干净分享 - 别瞅着我');

const route = useRoute();
const originalUrl = computed(() => {
  const urlInParams = route.params.url;
  const queryParams = new URLSearchParams(route.query as Record<string, string>);
  const urlWithoutScheme = Array.isArray(urlInParams) ? urlInParams.join('/') : urlInParams;

  return `https://${urlWithoutScheme}?${queryParams.toString()}`;
});
const data = computed(() => sanitize(originalUrl.value));

const { userAgent } = useDevice();
const isWeChatShareExtension = computed(() => userAgent.includes('WeChatShareExtension'));
const cardPreviewUserPreference = useCookie('dnt_card_preview_enabled', {
  maxAge: 60 * 60 * 24 * 365,
});
const isCardPreviewEnabled = computed(() => !!(isWeChatShareExtension.value || cardPreviewUserPreference.value));
const enableCardPreview = () => {
  cardPreviewUserPreference.value = 'yes';
};

if (!data.value) {
  throw createError({
    statusCode: 400,
    message: 'Unsupported URL.',
    stack: '',
  });
}
const theme = usePreferredColorScheme();
</script>

<style scoped>
/* Force the toaster use the global offset */
@media (max-width: 600px) {
  :deep([data-sonner-toaster][data-y-position="top"]) {
    top: var(--offset);
  }
}
</style>
