<template>
  <scroll-view type="list" :scroll-y="true" style="overflow-anchor: auto;" class="h-screen dark:bg-[#1e1e1e]"
    :scroll-anchoring="true" :enhanced="true" @dragging="onDragging" @dragend="onDragEnd" @scroll="onScroll">
    <view class="sticky top-0" :style="{ height: `${safeAreaTop}px` }" />
    <view class="pt-4 pb-safe text-black dark:text-white text-opacity-80">
      <view class="px-4 mb-4">
        <view class="text-2xl">瞅我干嘛</view>
        <view class="text-base mb-1">去除分享链接中恼人的跟踪参数。</view>
        <view class="opacity-60 text-xs">当前支持 微信公众号图文 / 小红书 / 淘宝 / BiliBili / 抖音</view>
      </view>
      <slot />
    </view>
    <view class="fixed top-0 left-0 right-0 bg-[#f7f7f7] dark:bg-[#1e1e1e]" :style="{
      height: `${safeAreaTop}px`,
      // backdropFilter: 'blur(20px)',
      // ['-webkitBackdropFilter']: 'blur(20px)',
    }" />
  </scroll-view>
</template>

<script setup lang="ts">
import { useScroll } from '@/composables/scroll';

const { onDragging, onDragEnd, onScroll } = useScroll();

const { platform, statusBarHeight } = uni.getSystemInfoSync();
const isPC = platform === 'windows' || platform === 'mac';

const { top, bottom } = uni.getMenuButtonBoundingClientRect();
const safeAreaTop = isPC ? 0 : bottom + top - (statusBarHeight ?? 0);
</script>
