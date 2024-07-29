<template>
  <div class="max-w-xl mx-auto flex flex-col gap-4 py-4" v-if="openGraphData">
    <ShareLogo :name="openGraphData.config.id" class="mx-auto my-4" />
    <div class="px-4 flex flex-col gap-2">
      <h1 class="font-semibold text-xl">{{ openGraphData?.title }}</h1>
      <div
        v-if="openGraphData?.author"
        class="flex flex-row items-center gap-2"
      >
        <img
          class="w-6 h-6 rounded-full"
          referrerpolicy="no-referrer"
          :src="openGraphData.author.avatar"
        />
        <span class="opacity-80">{{ openGraphData?.author.name }}</span>
      </div>
    </div>
    <div
      class="flex flex-col overflow-hidden"
      v-if="openGraphData?.images?.[0]"
    >
      <div
        class="w-full relative overflow-hidden"
        style="container-type: inline-size"
      >
        <img
          :src="openGraphData.images[0]"
          alt=""
          referrerpolicy="no-referrer"
          class="w-full max-h-[100cqw] object-contain pointer-events-none"
        />
        <img
          :src="openGraphData.images[0]"
          alt=""
          referrerpolicy="no-referrer"
          class="absolute top-0 left-0 right-0 bottom-0 -z-20 object-fill scale-125 blur-3xl"
        />
        <div
          v-if="data?.embedLink"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 cursor-pointer backdrop-blur-2xl backdrop-contrast-150"
          @click="openPlayer"
        >
          <i
            class="block w-16 h-16 text-white i-material-symbols-light-play-arrow-outline-rounded"
          />
        </div>
        <ShareIframe
          class="absolute top-0 left-0 right-0 bottom-0"
          v-if="data?.embedLink && isPlayerVisible"
          :src="data.embedLink"
        />
      </div>
    </div>
    <div
      v-if="openGraphData?.description"
      class="opacity-90 px-4 text-base whitespace-pre-line break-words"
    >
      {{ openGraphData?.description }}
    </div>
    <div
      class="mb-safe-offset-8"
      :style="{ height: `${actionPanelHeight}px` }"
    ></div>
  </div>
  <div class="fixed left-0 right-0 bottom-safe-offset-8">
    <div class="max-w-xl mx-auto px-6">
      <div
        class="rounded-2xl bg-zinc-900 shadow-2xl dark:shadow-zinc-900 dark:border"
        ref="actionPanel"
        v-if="data"
      >
        <div class="text-sky-500 px-4 pt-3 text-center text-sm group">
          <a
            class="inline"
            :href="data.fullLink"
            target="_blank"
            referrerpolicy="no-referrer"
          >
            <span
              class="break-words align-middle mr-1 group-hover:underline underline-offset-2"
              >{{ data.fullLink }}</span
            >
            <i
              class="w-4 h-4 i-heroicons-outline-external-link align-middle"
            ></i>
          </a>
        </div>
        <div class="flex flex-row justify-between text-zinc-50 items-center">
          <div class="p-3 pt-2 cursor-pointer">
            <i
              class="block w-6 h-6 i-material-symbols-light-info-outline-rounded"
            ></i>
          </div>
          <div class="opacity-40 pb-1 text-xs">原网页链接</div>
          <div class="p-3 pt-2 cursor-pointer" @click="copyFullLink">
            <i
              class="block w-6 h-6 i-material-symbols-light-content-copy-outline-rounded"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ClientOnly>
    <Toaster position="top-center" :theme="theme" :offset="toastOffset" />
    <SharePreview
      :url="data.iframeLink ?? data.fullLink"
      v-model="isPreviewVisible"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  useClipboard,
  usePreferredColorScheme,
  useElementBounding,
} from "@vueuse/core";
import { UAParser } from "ua-parser-js";

const props = defineProps<{
  url: string;
}>();

const { $client, $toast } = useNuxtApp();
const { data } = await $client.sanitize.useQuery({
  text: props.url,
});
const { data: openGraphData } = await $client.scrape.useQuery({
  url: data.value?.fullLink,
});

const { copy } = useClipboard();
const theme = usePreferredColorScheme();
const isPreviewVisible = ref(false);
const isPlayerVisible = ref(false);

const actionPanel = ref<HTMLElement | null>(null);
const { top, height: actionPanelHeight } = useElementBounding(actionPanel);
const toastOffset = computed(() => `${top.value - 64}px`);

const copyFullLink = () => {
  copy(data.value?.fullLink!)
    .then(() => {
      $toast.success("链接已复制。", {
        duration: 2000,
      });
    })
    .catch(() => {
      $toast.error("复制失败。可尝试手动复制。", {
        duration: 2000,
      });
    });
};

const { userAgent } = useDevice();
const isMajorAbove = (version: string | undefined, target: number) => {
  if (!version) {
    return false;
  }

  const [major] = version.split(".");
  return Number(major) >= target;
};
const checkIsBrowserSupportsPreview = () => {
  if (import.meta.server) {
    return false;
  }

  const { browser, os, engine } = UAParser(userAgent);

  if (browser.name === "Safari" || browser.name === "Mobile Safari") {
    return isMajorAbove(os.version, 14);
  }
  if (browser.name === "WeChat" && os.name === "iOS") {
    return isMajorAbove(os.version, 14);
  }
  if (engine.name === "Blink") {
    return isMajorAbove(engine.version, 120);
  }
  if (engine.name === "Gecko") {
    return isMajorAbove(engine.version, 115);
  }

  return false;
};

const openPreview = () => {
  const isSupported = checkIsBrowserSupportsPreview();
  if (isSupported) {
    isPreviewVisible.value = true;
  } else {
    $toast.error("当前浏览器不支持无痕预览。", {
      duration: 2000,
    });
  }
};

const openPlayer = () => {
  const isSupported = checkIsBrowserSupportsPreview();
  if (!isSupported) {
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

const isWeChatBrowser = userAgent.toLowerCase().includes("micromessenger");

const { defaultShareImageUrl } = useRuntimeConfig().public;
onMounted(async () => {
  if (import.meta.server) {
    return;
  }

  if (!openGraphData.value) {
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

  const {
    config: { id, name },
    author,
    description,
  } = openGraphData.value;

  const authorLabel = id === "bilibili" ? "UP 主" : "作者";

  const desc = [
    `✨ 分享自 ${name}`,
    author ? `🧑‍💻 ${authorLabel}: ${author.name}` : "",
    description ? `📝 ${description.replaceAll(/\s+/g, " ")}` : "",
  ]
    .filter((item) => item)
    .join("\n")
    .trim();

  await updateAppMessageShareData({
    title: openGraphData.value?.title || "",
    desc,
    link: location.href,
    imgUrl: openGraphData.value?.images?.[0] || defaultShareImageUrl,
  });
});
</script>

<style scoped>
/* Force the toaster use the global offset */
@media (max-width: 600px) {
  :deep([data-sonner-toaster][data-y-position="top"]) {
    top: var(--offset);
  }
}
</style>
