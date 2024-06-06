<template>
  <div class="px-4 pt-6 pb-safe-offset-36 max-w-xl mx-auto">
    <div class="flex flex-row gap-2 w-full">
      <i class="flex-none i-lucide-link w-8 h-8" :class="openGraphData?.config.icon"></i>
    </div>
    <div class="mt-6">
      <img v-if="openGraphData?.images?.[0]" :src="openGraphData?.images?.[0]" alt="" referrerpolicy="no-referrer"
        class="w-full mt-4 rounded-2xl" />
      <h1 class="mt-4 font-semibold text-xl">{{ openGraphData?.title }}</h1>
      <div class="flex flex-row mt-4 gap-1" v-if="openGraphData?.metadata">
        <div class="flex-1 flex flex-col gap-0.5" v-for="metadata in openGraphData.metadata">
          <div class="text-xs font-semibold opacity-40">{{ metadata.label }}</div>
          <div class="text-sm">{{ metadata.value }}</div>
        </div>
      </div>
      <div v-if="openGraphData?.description"
        class="mt-4 rounded-2xl overflow-hidden bg-[#f7f7f7] dark:bg-white dark:bg-opacity-5">
        <div class="px-4 pt-3 pb-4">
          <div class="mt-1 opacity-90 text-sm whitespace-pre-line">
            {{ openGraphData?.description }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-0.5 opacity-0">
      <div class="text-xs font-semibold opacity-40">页面链接</div>
      <div class="text-base break-words leading-6">
        {{ data?.fullLink }}
      </div>
    </div>
  </div>
  <div
    class="fixed pb-safe bottom-0 left-0 right-0 bg-[#ededed] bg-opacity-100 dark:bg-[#111] dark:bg-opacity-60 backdrop-blur-2xl dark:border-t border-t-black dark:border-t-white border-opacity-5 dark:border-opacity-10">
    <div class="flex flex-col px-4 py-4 gap-4 max-w-xl mx-auto">
      <div class="flex flex-col gap-0.5">
        <div class="text-xs font-semibold opacity-40">页面链接</div>
        <div class="text-base break-words leading-6">
          {{ data?.fullLink }}
        </div>
      </div>
      <div class="flex flex-row gap-4">
        <a class="flex-1 flex flex-row items-center gap-2 rounded-2xl bg-white dark:bg-white dark:bg-opacity-5 p-4 active:bg-opacity-20 transition-colors cursor-pointer"
          @click="copyFullLink">
          <i class="i-lucide-copy w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">复制链接</span>
            <span class="text-xs opacity-40 line-clamp-1">已去除跟踪参数</span>
          </div>

        </a>
        <a class="flex-1 flex flex-row items-center gap-2 rounded-2xl bg-white dark:bg-white dark:bg-opacity-5 p-4 active:bg-opacity-20 transition-colors"
          :href="data?.fullLink" referrerpolicy="no-referrer">
          <i class="i-lucide-arrow-right w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">直接打开</span>
            <span class="text-xs opacity-40 line-clamp-1">使用微信内置浏览器</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  <Toaster position="bottom-center" :theme="theme" />
</template>

<script setup lang="ts">
import { useClipboard, usePreferredColorScheme } from '@vueuse/core';

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
      imgUrl: openGraphData.value?.images?.[0] || '',
    });
  }
});
</script>
