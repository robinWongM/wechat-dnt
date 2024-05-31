<template>
  <view v-if="url" class="flex flex-col items-stretch mt-2 mb-4 overflow-hidden">
    <view class="">
      <view class="mb-1 text-xs font-medium opacity-60">{{ name }}</view>
      <text class="w-full break-all" user-select>{{ url }}</text>
    </view>
    <!-- <view class="flex flex-row">
      <view class="py-4 flex-1 text-sm text-center flex justify-center items-center" hover-class="bg-black bg-opacity-5 dark:bg-opacity-20" @click="copy">
        <span class="i-lucide-copy w-3 h-3 bg-black dark:bg-white mr-1"></span>
        <span>复制</span>
      </view>
    </view> -->
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  url: string;
  name: string;
  align?: 'left' | 'right';
}>(), {
  align: 'left'
});

const copy = () => {
  uni.setClipboardData({
    data: props.url,
  });
}
</script>
