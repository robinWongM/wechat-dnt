<template>
  <a
    class="flex-1 flex flex-row items-center gap-4 rounded-2xl text-white bg-black dark:bg-white bg-opacity-90 dark:bg-opacity-90 dark:text-black px-6 py-4 active:bg-opacity-80 transition-colors cursor-pointer">
    <i class=" i-lucide-lollipop w-6 h-6"></i>
    <div class="flex flex-col items-start flex-1">
      <span class="text-base"><slot /></span>
      <span class="text-xs opacity-60 line-clamp-1">在支持的浏览器中屏蔽原网站的 Cookies</span>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  url: string;
}>();
</script>