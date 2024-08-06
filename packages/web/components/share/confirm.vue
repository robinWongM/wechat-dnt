<template>
  <div class="fixed top-0 right-0 left-0 bottom-0 pb-safe-offset-48">
    <div class="p-6 max-w-xl mx-auto h-full">
      <div class="flex flex-col gap-8 items-center justify-center border-2 rounded-xl p-4 h-full border-dashed">
        <div class="flex flex-1 flex-col gap-2 items-center justify-center">
          <div class="text-4xl font-light">Instant View</div>
          <div class="opacity-80">在打开原网页之前，快速预览网页内容</div>
        </div>
        <div class="flex flex-col gap-2 items-center text-center justify-center">
          <UiButton variant="outline" @click="onButtonClicked" class="bg-transparent w-full">
            <i class="w-4 h-4 mr-2" :class="isLoading ? 'i-svg-spinners-3-dots-bounce' : 'i-material-symbols-light-search-rounded'" ></i>
            开启 Instant View
          </UiButton>
          <div class="opacity-40 text-xs">Instant View 中的文字、图片、视频等内容均来自于原网页，不代表本站的观点。</div>
        </div>
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
