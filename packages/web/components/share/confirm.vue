<template>
  <div class="fixed top-0 right-0 left-0 bottom-0 pb-safe-offset-48">
    <div class="p-6 max-w-xl mx-auto h-full">
      <div class="flex flex-col gap-2 items-center justify-center border-2 rounded-xl p-4 h-full border-dotted">
        <UiButton variant="outline" @click="onButtonClicked" class="bg-transparent">
          <i class="w-4 h-4 mr-2" :class="isLoading ? 'i-svg-spinners-3-dots-bounce' : 'i-material-symbols-light-search-rounded'" ></i>
          加载预览
        </UiButton>
        <div class="opacity-40 text-xs text-balance text-center">点击按钮后，后续进入分享页面将默认加载预览。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'confirm'): void;
}>();

const isLoading = ref(false);
const onButtonClicked = () => {
  isLoading.value = true;
  emit('confirm');
}
</script>
