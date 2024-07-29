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
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useEventListener, useClipboard } from "@vueuse/core";
import ShareIframe from './iframe.vue';

const props = defineProps<{
  url: string;
  modelValue: boolean;
}>();
const emit =
  defineEmits<(event: "update:modelValue", value: boolean) => void>();
const onModelValueChange = (value: boolean) => {
  emit("update:modelValue", value);
};

const isContentLoaded = ref(false);
const onLoad = () => {
  isContentLoaded.value = true;
};
watchEffect(() => {
  if (!props.modelValue) {
    isContentLoaded.value = false;
  }
});

const { copy } = useClipboard();
const { $toast } = useNuxtApp();
const clearClipboard = () => {
  copy("")
    .then(() => {
      $toast.success("剪切板已清空。", {
        duration: 2000,
      });
    })
    .catch(() => {
      $toast.error("清空失败。可尝试手动清空。", {
        duration: 2000,
      });
    });
};
</script>

<template>
  <Drawer :open="modelValue" @update:open="onModelValueChange">
    <DrawerContent class="w-full h-[100dvh] rounded-none">
      <DrawerHeader class="px-4 py-2">
        <div class="flex flex-row gap-4 items-center">
          <Button
            class="flex-none text-xs"
            variant="secondary"
            size="xs"
            @click="clearClipboard"
            >清空剪切板</Button
          >
        </div>
      </DrawerHeader>
      <ShareIframe
        :src="url"
        @load="onLoad"
        :class="isContentLoaded ? 'opacity-100' : 'opacity-0'"
      />
    </DrawerContent>
  </Drawer>
</template>
