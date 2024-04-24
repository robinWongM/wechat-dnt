<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch((options) => {
  if (!options) {
    return;
  }

  if (options.scene === 1173 && options.path === '/pages/index/index') {
    uni.redirectTo({
      url: '/pages/result',
    });
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .py-safe {
    @apply pt-safe pb-safe;
  }
}

page {
  background-color: #f7f7f7;
}

@media (prefers-color-scheme: dark) {
  page {
    background-color: #1e1e1e;
  }
}
</style>
