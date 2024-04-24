<template>
  <layout>
    <view class="px-4">
      <url-block name="您打开的 URL" :url="originalUrl" />
      <block v-if="result">
        <url-block name="净化后的 URL" :url="result.trimmedUrl" />
        <url-block name="客户端 URL Scheme" :url="result.customScheme" />
      </block>
      <view v-else class="flex flex-row justify-center items-center">
        <view class="mr-2">暂不支持净化此链接。</view>
        <button class="text-left inline-block bg-transparent p-0 m-0 h-auto text-base after:border-none outline-none text-[#576b85] dark:text-[#7d90a9]" hover-class="bg-black bg-opacity-10 dark:bg-opacity-30"
          open-type="contact" :show-message-card="true" send-message-title="请支持净化此链接。"
          :send-message-path="feedbackPath">
          提交反馈
        </button>
      </view>
      <view class="text-base inline-flex flex-row justify-center items-center my-8 bg-black bg-opacity-10 dark:bg-opacity-50 mx-auto px-8 py-4 rounded-xl"
        hover-class="bg-opacity-20 dark:bg-opacity-70" @click="navigateToHome">
        <view class="i-lucide-move-left w-4 h-4 bg-black dark:bg-white mr-4" />
        <view>净化其他 URL</view>
      </view>
    </view>
  </layout>
</template>

<script setup lang="ts">
import { cleanUrl } from '@/composables/url';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const originalUrl = ref<string | undefined>('');
const result = computed(() => cleanUrl(originalUrl.value));

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
</script>
