<template>
  <layout>
    <view>
      <view class="px-4 my-8">
        <view class="flex flex-col bg-black bg-opacity-5 dark:bg-opacity-20 rounded-lg overflow-hidden ">
          <view class="p-4">
            <textarea placeholder="待净化的 URL" v-model="url" :auto-height="true" :disable-default-padding="true"
              maxlength="-1" class="w-full text-base min-h-20 break-all" />
          </view>
          <view class="p-4 text-center" hover-class="bg-black bg-opacity-5 dark:bg-opacity-20" @click="clean">净化</view>
        </view>
      </view>
      <instructions />
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
