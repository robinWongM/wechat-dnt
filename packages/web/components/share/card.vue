<template>
  <div class="flex flex-col gap-4 py-4 max-w-xl mx-auto items-center" v-if="data">
    <ShareLogo :name="data.config.id" class="my-4 mx-auto" />
    <div class="px-4 flex flex-col gap-2 w-full">
      <h1 class="font-semibold text-xl">{{ data?.title }}</h1>
      <div v-if="data?.authorName" class="flex flex-row items-center gap-2">
        <img v-if="data.authorAvatar" class="w-6 h-6 rounded-full" referrerpolicy="no-referrer" :src="data.authorAvatar" />
        <span class="opacity-80">{{ data.authorName }}</span>
      </div>
    </div>
    <div class="max-w-[34rem] w-full flex flex-col overflow-hidden" v-if="data?.image">
      <div class="w-full relative overflow-hidden" style="container-type: inline-size">
        <img :src="data.image" alt="" referrerpolicy="no-referrer"
          class="w-full max-h-[100cqw] object-contain pointer-events-none" />
        <img :src="data.image" alt="" referrerpolicy="no-referrer"
          class="absolute top-0 left-0 right-0 bottom-0 -z-20 object-fill scale-125 blur-3xl" />
        <div v-if="embedLink"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-20 cursor-pointer backdrop-blur-xl backdrop-contrast-150"
          @click="openPlayer">
          <i class="block w-16 h-16 text-white i-material-symbols-light-play-arrow-outline-rounded" />
        </div>
        <ShareIframe class="absolute top-0 left-0 right-0 bottom-0" v-if="embedLink && isPlayerVisible"
          :src="embedLink" />
      </div>
    </div>
    <div v-if="data?.description" class="w-full opacity-90 px-4 text-base whitespace-pre-line break-words">
      {{ data?.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTitle } from '@vueuse/core';

const props = defineProps<{
  fullLink: string;
  embedLink?: string;
}>();

const { $client, $toast } = useNuxtApp();
const { data } = await $client.scrape.useQuery({
  url: props.fullLink,
});

const isPlayerVisible = ref(false);

const openPlayer = () => {
  const isSupported = checkIsBrowserSupportsPreview();
  if (isSupported) {
    isPlayerVisible.value = true;
  } else {
    $toast("当前浏览器不支持无痕预览。是否继续？", {
      action: {
        label: "继续",
        onClick: () => {
          isPlayerVisible.value = true;
        },
      },
      cancel: {
        label: "取消",
      },
    });
  }
};

const { defaultShareImageUrl } = useRuntimeConfig().public;
const shareData = ref({
  title: '',
  description: '',
  imageUrl: defaultShareImageUrl,
  originalUrl: props.fullLink,
});

if (data.value) {
  const {
    config: { id, name },
    author,
    description,
  } = data.value;

  const authorLabel = id === "bilibili" ? "UP 主" : "作者";

  const desc = [
    `✨ 分享自 ${name}`,
    author ? `🧑‍💻 ${authorLabel}：${author.name}` : "",
    description ? `📝 ${description.replaceAll(/\s+/g, " ")}` : "",
  ]
    .filter((item) => item)
    .join("\n")
    .trim();

  shareData.value.title = data.value?.title || "";
  shareData.value.description = desc;
  shareData.value.imageUrl = data.value?.images?.[0] || defaultShareImageUrl;
}

useTitle(shareData.value.title);
useHead({
  meta: [
    {
      property: "og:title",
      content: shareData.value.title,
    },
    {
      property: "og:description",
      content: shareData.value.description,
    },
    {
      property: "og:image",
      content: shareData.value.imageUrl,
    },
  ],
})

onMounted(async () => {
  if (!data.value) {
    return;
  }

  const { config, updateAppMessageShareData } = useWxSdk();
  const client = useNuxtApp().$client;
  const wxConfig = await client.getWxConfig.query({
    url: location.href,
  });

  await config({
    ...wxConfig!,
    debug: true,
    jsApiList: ["updateAppMessageShareData"],
    openTagList: [],
  });

  await updateAppMessageShareData({
    title: shareData.value.title,
    desc: shareData.value.description,
    link: location.href,
    imgUrl: shareData.value.imageUrl,
  });
});
</script>
