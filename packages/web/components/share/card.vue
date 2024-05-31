<template>
  <div class="px-4 pt-6 pb-safe-offset-36">
    <div class="flex flex-row gap-2 w-full">
      <i class="flex-none i-lucide-link w-8 h-8"></i>
    </div>
    <div class="mt-6">
      <img v-if="openGraphData?.ogImage?.[0]" :src="openGraphData.ogImage[0].url" alt=""
        :width="openGraphData.ogImage[0].width" :height="openGraphData.ogImage[0].height" referrerpolicy="no-referrer"
        class="w-full mt-4 rounded-2xl" />
      <h1 class="mt-4 font-semibold text-xl">{{ openGraphData?.ogTitle }}</h1>
      <div class="flex flex-row mt-4 gap-1 hidden">
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="text-xs font-semibold opacity-40">UP 主</div>
          <div class="text-sm"></div>
        </div>
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="text-xs font-semibold opacity-40">时长</div>
          <div class="text-sm"></div>
        </div>
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="text-xs font-semibold opacity-40">发布时间</div>
          <div class="text-sm"></div>
        </div>
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="inline-flex text-xs font-semibold opacity-40 items-center gap-1">
            <i class="i-lucide-play w-3 h-3"></i>
            <span>/</span>
            <i class="i-lucide-text w-3 h-3"></i>
          </div>
          <div class="text-sm">
            0
            <span class="opacity-40">/</span>
            0
          </div>
        </div>
      </div>
      <div v-if="openGraphData?.ogDescription" class="mt-4 rounded-2xl overflow-hidden bg-[#f7f7f7] dark:bg-white dark:bg-opacity-5">
        <div class="px-4 pt-3 pb-4">
          <div class="mt-1 opacity-90 text-sm">
            {{ openGraphData?.ogDescription }}
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
    <div class="flex flex-col px-4 py-4 gap-4">
      <div class="flex flex-col gap-0.5">
        <div class="text-xs font-semibold opacity-40">页面链接</div>
        <div class="text-base break-words leading-6">
          {{ data?.fullLink }}
        </div>
      </div>
      <div class="flex flex-row gap-4">
        <a
          class="flex-1 flex flex-row items-center gap-2 rounded-2xl bg-white dark:bg-white dark:bg-opacity-5 p-4 active:bg-opacity-20 transition-colors">
          <i class="i-lucide-copy w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">复制链接</span>
            <span class="text-xs opacity-40 line-clamp-1">已去除跟踪参数</span>
          </div>

        </a>
        <a class="flex-1 flex flex-row items-center gap-2 rounded-2xl bg-white dark:bg-white dark:bg-opacity-5 p-4 active:bg-opacity-20 transition-colors"
          :href="data?.fullLink">
          <i class="i-lucide-arrow-right w-4 h-4"></i>
          <div class="flex flex-col items-end flex-1 text-right">
            <span class="text-base">直接打开</span>
            <span class="text-xs opacity-40 line-clamp-1">使用微信内置浏览器</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string;
}>();

const { $client } = useNuxtApp()
const { data } = await $client.sanitize.useQuery({
  text: props.url,
});

const { data: openGraphData, } = await $client.scrape.useQuery({
  url: data.value?.fullLink,
});

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
    await updateAppMessageShareData({
      title: openGraphData.value?.ogTitle,
      desc: openGraphData.value?.ogDescription,
      link: location.href,
      imgUrl: openGraphData.value?.ogImage?.[0]?.url,
    });
  }
});
</script>
