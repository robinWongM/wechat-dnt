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
import { useEventListener, useMutationObserver } from '@vueuse/core';

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
</script>

<template>
  <Drawer :open="modelValue" @update:open="onModelValueChange">
    <DrawerContent class="w-full drawer-content">
      <iframe ref="iframe" :src="url" sandbox="allow-same-origin allow-scripts" allowfullscreen="true"
        webkitallowfullscreen="true" credentialless class="mt-4 w-full h-full transition-opacity"
        referrerpolicy="no-referrer" @load="onLoad" :class="isContentLoaded ? 'opacity-100' : 'opacity-0'" />
    </DrawerContent>
  </Drawer>
</template>

<style>
.drawer-content {
  height: calc(100dvh - 4rem);
}
</style>
