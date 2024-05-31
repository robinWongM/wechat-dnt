<template>
  <view class="bg-white dark:bg-black flex flex-col justify-end h-screen will-change-transform transition-all duration-300 ease-out"
    :style="{ transform: `translateY(-${keyboardHeight}px)` }">
    <view class="px-6 inline-flex flex-row justify-end mb-4">
      <view class="bg-black bg-opacity-80 text-white rounded-xl rounded-tr-none max-w-[80%] px-4 py-3 break-all">
        {{ originalUrl }}
      </view>
    </view>
    <block v-if="result">
      <view class="px-6 flex flex-col gap-2">
        <view class="pt-2">
          <span class="i-simple-icons-xiaohongshu w-8 h-8 bg-black dark:bg-white"></span>
        </view>
        <view class="flex-1">
          <url-block name="净化后的 URL" :url="result.fullLink" />
          <url-block name="客户端 URL Scheme" :url="result.customSchemeLink" />
        </view>
      </view>
    </block>
    <view v-else class="px-6 flex flex-row justify-center items-center">
      <view class="mr-2">暂不支持净化此链接。</view>
      <button
        class="text-left inline-block bg-transparent p-0 m-0 h-auto text-base after:border-none outline-none text-[#576b85] dark:text-[#7d90a9]"
        hover-class="bg-black bg-opacity-10 dark:bg-opacity-30" open-type="contact" :show-message-card="true"
        send-message-title="请支持净化此链接。" :send-message-path="feedbackPath">
        提交反馈
      </button>
    </view>
    <view class="mt-4 bg-[#f7f7f7] dark:bg-[#1e1e1e] rounded-t-3xl" :class="{ 'pb-safe': !keyboardHeight }">
      <textarea class="box-border min-h-32 p-6 w-full text-base" placeholder="净化分享文案..." :auto-height="true"
        :disable-default-padding="true" maxlength="-1" adjust-keyboard-to="bottom" :show-confirm-bar="false"
        :adjust-position="false" />
    </view>
    <!-- <view
      class="text-base inline-flex flex-row justify-center items-center my-8 bg-black bg-opacity-10 dark:bg-opacity-50 mx-auto px-8 py-4 rounded-xl"
      hover-class="bg-opacity-20 dark:bg-opacity-70" @click="navigateToHome">
      <view class="i-lucide-move-left w-4 h-4 bg-black dark:bg-white mr-4" />
      <view>净化其他 URL</view>
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { match } from '@dnt/core';
import { onLoad } from '@dcloudio/uni-app';
import { computed, onUnmounted, ref } from 'vue';

defineOptions({
  disableScroll: true,
});

const originalUrl = ref<string | undefined>('');
const result = computed(() => match(originalUrl.value ?? '') ?? '');
const keyboardHeight = ref(0);

onLoad((options) => {
  if (options?.url) {
    originalUrl.value = decodeURIComponent(options.url);
    return;
  }

  const { scene, forwardMaterials } = uni.getEnterOptionsSync();
  if (scene === 1173) {
    originalUrl.value = forwardMaterials[0].path;
    return;
  }
});

const feedbackPath = computed(() => `/pages/result?url=${encodeURIComponent(originalUrl.value ?? '')}`);

const navigateToHome = () => {
  const currentPage = getCurrentPages();
  if (currentPage.length > 1) {
    uni.navigateBack();
    return;
  }

  uni.redirectTo({
    url: '/pages/index',
  });
}

const keyboardHandler = (res: UniApp.OnKeyboardHeightChangeResult) => {
  console.log('keyboard height', res.height);
  keyboardHeight.value = res.height;
};
uni.onKeyboardHeightChange(keyboardHandler);

onUnmounted(() => {
  uni.offKeyboardHeightChange(keyboardHandler);
});
</script>
