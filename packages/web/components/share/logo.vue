<template>
  <i class="flex-none w-8 h-8" :class="iconClass"></i>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();

const iconClassMapping: Record<string, string | undefined> = {
  'bilibili': 'i-simple-icons-bilibili',
  'xiaohongshu': 'i-simple-icons-xiaohongshu',
}

const iconClass = computed(() => iconClassMapping[props.name] ?? 'i-lucide-link');
</script>
