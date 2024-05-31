<template>
  <layout>
    <view class="px-4 mb-4">
      <view class="text-2xl">瞅我干嘛</view>
      <view class="text-base mb-1">去除分享链接中恼人的跟踪参数。</view>
      <view class="opacity-60 text-xs">当前支持 微信公众号图文 / 小红书 / 淘宝 / BiliBili / 抖音</view>
    </view>
    <view>
      <view class="px-4 my-8">
        <view class="flex flex-col bg-black bg-opacity-5 dark:bg-opacity-20 rounded-lg overflow-hidden ">
          <textarea placeholder="可在此输入待净化的分享文案 / 分享链接。" v-model="url" :auto-height="true"
            :disable-default-padding="true" maxlength="-1" class="px-4 pt-4 w-full text-base min-h-20 break-all" />
          <view class="p-4 text-center" hover-class="bg-black bg-opacity-5 dark:bg-opacity-20" @click="clean">净化</view>
        </view>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <instructions />
      <!-- #endif -->
    </view>
  </layout>
</template>

<script setup lang="ts">
import { onShareAppMessage } from '@dcloudio/uni-app';
import { ref } from 'vue';

const url = ref('');

const clean = () => {
  const trimmedUrl = url.value.trim();
  if (!trimmedUrl) {
    uni.showModal({
      title: '请输入待净化的 URL。',
      showCancel: false,
      confirmText: '知道了',
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/result?url=${encodeURIComponent(trimmedUrl)}`,
  });
}

onShareAppMessage(() => {
  return {
    title: '去除分享链接中恼人的跟踪参数。',
  };
});
</script>
