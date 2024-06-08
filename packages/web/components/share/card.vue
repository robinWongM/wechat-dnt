<template>
  <div class="px-4 py-6 max-w-xl mx-auto" v-if="openGraphData">
    <div class="flex flex-row gap-2 w-full">
      <ShareLogo :name="openGraphData.config.id" />
    </div>
    <div
      class="mt-6 border border-black border-opacity-10 dark:border-white dark:border-opacity-10 rounded-2xl overflow-hidden">
      <div v-if="openGraphData?.images?.[0]" class="relative max-h-[50vh] overflow-hidden">
        <img :src="openGraphData?.images?.[0]" alt="" referrerpolicy="no-referrer"
          class="w-full object-contain aspect-video" />
        <img :src="openGraphData?.images?.[0]" alt="" referrerpolicy="no-referrer"
          class="absolute top-0 left-0 w-full h-full -z-10 object-fill scale-125 blur-3xl" />
      </div>
      <div class="p-4 flex flex-col gap-2">
        <h1 class="font-semibold text-xl">{{ openGraphData?.title }}</h1>
        <div v-if="openGraphData?.description">
          <div class="">
            <div class="opacity-90 text-base whitespace-pre-line">
              {{ openGraphData?.description }}
            </div>
          </div>
        </div>
      </div>
      <div class="px-4 py-3 text-sm border-t opacity-60">
        <span class="inline align-middle break-all">{{ data?.fullLink }}</span>
      </div>
    </div>
    <div class="pb-safe h-48"></div>
  </div>
  <div ref="actionPanel" class="fixed bottom-0 left-0 right-0 pb-safe-or-4 dark:bg-[#111] dark:bg-opacity-60 backdrop-blur-2xl"
    v-if="data">
    <div class="px-4 pt-4 max-w-xl mx-auto">
      <a class="flex-1 flex flex-row items-center gap-4 rounded-2xl text-white bg-black dark:bg-white bg-opacity-90 dark:bg-opacity-90 dark:text-black px-6 py-4 active:bg-opacity-80 transition-colors cursor-pointer"
        @click="openPreview">
        <i class=" i-lucide-lollipop w-6 h-6"></i>
        <div class="flex flex-col items-start flex-1">
          <span class="text-base">无痕预览原网页</span>
          <span class="text-xs opacity-60 line-clamp-1">在支持的浏览器中屏蔽原网站的 Cookies</span>
        </div>
      </a>
      <ClientOnly>
        <SharePreview :url="data.iframeLink ?? data.fullLink" v-model="isPreviewVisible" />
      </ClientOnly>
      <div class="flex flex-row gap-4 mt-4">
        <a class="border flex-1 flex flex-row bg-background items-center gap-2 rounded-2xl px-4 py-3 active:bg-opacity-20 transition-colors cursor-pointer"
          @click="copyFullLink">
          <i class="i-lucide-copy w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">复制链接</span>
            <span class="text-xs opacity-40 line-clamp-1">已去除跟踪参数</span>
          </div>
        </a>
        <a class="border flex-1 flex flex-row bg-background items-center gap-2 rounded-2xl px-4 py-3 active:bg-opacity-20 transition-colors"
          :href="data?.fullLink" referrerpolicy="no-referrer">
          <i class="i-lucide-arrow-right w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">直接打开</span>
            <span v-if="isWeChatBrowser" class="text-xs opacity-40 line-clamp-1">使用微信内置浏览器</span>
            <span v-else class="text-xs opacity-40 line-clamp-1">使用当前浏览器</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  <Toaster position="bottom-center" :theme="theme" :offset="toastOffset" />
</template>

<script setup lang="ts">
import { useClipboard, usePreferredColorScheme, useElementBounding } from '@vueuse/core';
import { UAParser } from 'ua-parser-js';

const props = defineProps<{
  url: string;
}>();

const { $client, $toast } = useNuxtApp()
const { data } = await $client.sanitize.useQuery({
  text: props.url,
});
const { data: openGraphData } = await $client.scrape.useQuery({
  url: data.value?.fullLink,
});

const { copy } = useClipboard();
const theme = usePreferredColorScheme();
const isPreviewVisible = ref(false);

const actionPanel = ref<HTMLElement | null>(null);
const { height } = useElementBounding(actionPanel);
const toastOffset = computed(() => `${height.value}px`);

const copyFullLink = () => {
  copy(data.value?.fullLink!)
    .then(() => {
      $toast.success('链接已复制。', {
        duration: 2000,
      });
    }).catch(() => {
      $toast.error('复制失败。可尝试手动复制。', {
        duration: 2000,
      });
    });
}

const { userAgent } = useDevice();
const isMajorAbove = (version: string | undefined, target: number) => {
  if (!version) {
    return false;
  }

  const [major] = version.split('.');
  return Number(major) >= target;
};
const checkIsBrowserSupportsPreview = () => {
  if (import.meta.server) {
    return false;
  }

  const { browser, os, engine } = UAParser(userAgent);

  if (browser.name === 'Safari' || browser.name === 'Mobile Safari') {
    return isMajorAbove(os.version, 14);
  }
  if (browser.name === 'WeChat' && os.name === 'iOS') {
    return isMajorAbove(os.version, 14);
  }
  if (engine.name === 'Blink') {
    return isMajorAbove(engine.version, 120);
  }
  if (engine.name === 'Gecko') {
    return isMajorAbove(engine.version, 115);
  }

  return false;
};

const openPreview = () => {
  const isSupported = checkIsBrowserSupportsPreview();
  if (isSupported) {
    isPreviewVisible.value = true;
  } else {
    $toast.error('当前浏览器不支持无痕预览。', {
      duration: 2000,
    });
  }
};

const isWeChatBrowser = userAgent.toLowerCase().includes('micromessenger');

const { defaultShareImageUrl } = useRuntimeConfig().public;
onMounted(async () => {
  if (import.meta.client) {
    const { config, updateAppMessageShareData } = useWxSdk();
    const client = useNuxtApp().$client;
    const wxConfig = await client.getWxConfig.query({
      url: location.href,
    });

    await config({
      ...wxConfig!,
      debug: true,
      jsApiList: ['updateAppMessageShareData'],
      openTagList: [],
    });

    const description = [
      `✨ 分享自 ${openGraphData.value?.config.name}`,
      `📝 ${openGraphData.value?.description}`,
    ].join('\n');

    await updateAppMessageShareData({
      title: openGraphData.value?.title || '',
      desc: description,
      link: location.href,
      imgUrl: openGraphData.value?.images?.[0] || defaultShareImageUrl,
    });
  }
});
</script>
