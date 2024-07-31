<template>
  <div class="rounded-2xl bg-zinc-900 shadow-2xl dark:shadow-zinc-900 dark:border">
    <div class="text-sky-500 px-4 pt-3 text-center text-sm group">
      <a class="inline" :href="fullLink" target="_blank" referrerpolicy="no-referrer">
        <span class="break-words align-middle mr-1 group-hover:underline underline-offset-2">
          {{ fullLink }}
        </span>
        <i class="w-4 h-4 i-heroicons-outline-external-link align-middle"></i>
      </a>
    </div>
    <div class="flex flex-row justify-between text-zinc-50 items-center">
      <div class="p-2 pl-3 cursor-pointer active:bg-zinc-800 rounded-bl-2xl rounded-tr-2xl" @click="openPreview">
        <i class="block w-8 h-8 i-material-symbols-light-eyeglasses-rounded"></i>
      </div>
      <div class="opacity-40 text-xs">原网页链接</div>
      <div class="p-3 pl-4 cursor-pointer active:bg-zinc-800 rounded-tl-2xl rounded-br-2xl" @click="copyFullLink">
        <i class="block w-6 h-6 i-material-symbols-light-content-copy-outline-rounded"></i>
      </div>
    </div>
  </div>
  <ClientOnly>
    <SharePreview :url="iframeLink ?? fullLink" v-model="isPreviewVisible" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

const props = defineProps<{
  fullLink: string;
  iframeLink?: string;
}>();

const isPreviewVisible = ref(false);
const { $toast } = useNuxtApp();
const { copy } = useClipboard();

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

const copyFullLink = () => {
  copy(props.fullLink)
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
</script>
