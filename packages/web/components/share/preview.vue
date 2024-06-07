<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button';
import { useEventListener, useClipboard } from '@vueuse/core';

const log = ref(0);
const iframe = ref<HTMLIFrameElement | null>(null);

if (import.meta.client) {
  useEventListener(window, 'message', (evt) => {
    log.value = evt.data;
  })
}

const props = defineProps<{
  url: string;
  modelValue: boolean;
}>();
const emit = defineEmits<(event: 'update:modelValue', value: boolean) => void>();
const onModelValueChange = (value: boolean) => {
  emit('update:modelValue', value);
}

const isContentLoaded = ref(false);
const onLoad = () => {
  isContentLoaded.value = true;
}
watchEffect(() => {
  if (!props.modelValue) {
    isContentLoaded.value = false;
  }
});

const { copy } = useClipboard();
const { $toast } = useNuxtApp();
const clearClipboard = () => {
  copy('')
    .then(() => {
      $toast.success('剪切板已清空。', {
        duration: 2000,
      });
    }).catch(() => {
      $toast.error('清空失败。可尝试手动清空。', {
        duration: 2000,
      });
    });
}
</script>

<template>
  <Drawer :open="modelValue" @update:open="onModelValueChange">
    <DrawerContent class="w-full drawer-content">
      <DrawerHeader>
        <div class="flex flex-row gap-4 items-center">
          <div class="text-xs flex-1 text-left">部分网站在用户点击时会静默复制内容至剪切板，并在你下次打开 App 时读取。为了防止被跟踪，你可以使用右边的按钮清空剪贴板。</div>
          <Button class="flex-none" variant="secondary" size="sm" @click="clearClipboard">清空剪切板</Button>
        </div>
      </DrawerHeader>
      <iframe ref="iframe" :src="url" sandbox="allow-same-origin allow-scripts" allowfullscreen="true"
        webkitallowfullscreen="true" credentialless class="focus:outline-none w-full h-full transition-opacity"
        referrerpolicy="no-referrer" @load="onLoad" :class="isContentLoaded ? 'opacity-100' : 'opacity-0'" />
    </DrawerContent>
  </Drawer>
</template>

<style>
.drawer-content {
  height: calc(100dvh - 4rem);
}
</style>
