<template>
  <view class="min-h-screen">
    <text class="px-4 text-xl leading-10">
      <text class="text-black text-opacity-60 dark:text-white dark:text-opacity-60">#</text> 导入链接
    </text>
    <view class="px-4 text-sm opacity-80">当你在微信内收到一张分享卡片，不知道它真实的 URL 时，可通过以下方法导入链接来去除跟踪参数。</view>
    <view type="list" :scroll-x="true" class="flex flex-row w-full p-4 pb-2 h-16 box-border">
      <view v-for="(tab, index) in tabs" :key="tab" class="px-4 leading-10 transition-all text-center h-10 box-border"
        :class="currentTab === index ? ' bg-black bg-opacity-5 dark:bg-opacity-50 rounded-lg font-bold' : 'opacity-60'"
        @click="() => setCurrentTab(index)">
        {{ tab }}
      </view>
    </view>
    <view v-if="currentTab === 0" class="pb-32">
      <view class="pb-safe fixed bottom-0 w-max z-50 transition-all" :class="isStable ? 'right-0' : 'right-0'">
        <view
          class="transition-all px-4 py-4 mb-4 flex flex-row justify-center items-center border border-r-0 border-black dark:border-white border-opacity-10 dark:border-opacity-20 backdrop-blur-lg bg-[#f7f7f7] dark:bg-[#1e1e1e] bg-opacity-40 dark:bg-opacity-40 rounded-l-2xl"
          :class="isStable ? 'ease-in duration-300' : 'ease-out duration-100 opacity-20'"
          >
          <view class="text-left text-sm mr-4 leading-5 font-medium">
            长按右图<br>前往「当心被夹」公众号<br>发送分享卡片
          </view>
          <image class="w-16 h-16" src="../../assets/official-account.jpg" :show-menu-by-longpress="true"
            mode="aspectFit" />
        </view>
      </view>
      <view class="px-4 text-xs opacity-60" id="instructions-official-account">通过此方法，你可以在不打开分享卡片的情况下，获得净化后的链接。</view>
      <scroll-view type="list" :scroll-x="true" class="snap-x snap-mandatory" @scroll="onScroll">
        <view class="px-4 gap-x-2 grid grid-flow-col grid-rows-[auto_auto] w-max">
          <block v-for="({ label, imageUrl }, index) in officialAccountInstructions" :key="index">
            <view class="my-2">
              <view class="text-xl font-light opacity-60 mb-2">{{ index + 1 }}</view>
              <rich-text :nodes="label" class="leading-6"></rich-text>
            </view>
            <image class="w-[63vw] h-[140vw] snap-start" webp :src="imageUrl" />
          </block>
        </view>
      </scroll-view>
    </view>
    <view v-else-if="currentTab === 1" class="pb-4">
      <view class="px-4 text-xs opacity-60" id="instructions-webview">通过此方法，你可以更便捷地获得净化后的链接，但仍然存在被 App 跟踪微信 session 的风险。
      </view>
      <scroll-view type="list" :scroll-x="true">
        <view class="px-4 gap-x-2 grid grid-flow-col grid-rows-[auto_auto] w-max">
          <block v-for="({ label, imageUrl }, index) in webViewInstructions" :key="index">
            <view class="my-2">
              <view class="text-xl font-light opacity-60 mb-2">{{ index + 1 }}</view>
              <rich-text :nodes="label" class="leading-6"></rich-text>
            </view>
            <image class="w-[63vw] h-[140vw]" webp :src="imageUrl" />
          </block>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/dark-mode';
import { useIsStable } from '@/composables/is-stable';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { ref, computed, nextTick } from 'vue';

const tabs = ['从 分享卡片 导入', '从 内置浏览器 导入'];
const currentTab = ref(0);

const { currentTheme } = useTheme();
const imageUrlPrefix = `https://pub-a61e6374f28d45778da342077667cd11.r2.dev/instructions@2.1.0`;

const officialAccountInstructions = computed(() => [
  {
    label: '长按 微信内的分享卡片<br>轻触「收藏」',
    imageUrl: `${imageUrlPrefix}/add-to-favorite@${currentTheme.value}.webp`,
  },
  {
    label: '前往<br>公众号「当心被夹」',
    imageUrl: `${imageUrlPrefix}/subscribe@${currentTheme.value}.webp`,
  },
  {
    label: '轻触 + 号<br>选择「收藏」',
    imageUrl: `${imageUrlPrefix}/plus-menu-pressed@${currentTheme.value}.webp`,
  },
  {
    label: '选择 收藏的分享卡片<br>轻触「发送」',
    imageUrl: `${imageUrlPrefix}/send-from-favorite@${currentTheme.value}.webp`,
  },
  {
    label: '完成',
    imageUrl: `${imageUrlPrefix}/result@${currentTheme.value}.webp`,
  }
]);

const webViewInstructions = computed(() => [
  {
    label: '在微信内直接打开分享卡片<br>进入 微信内置浏览器',
    imageUrl: `${imageUrlPrefix}/webview@${currentTheme.value}.webp`,
  },
  {
    label: '轻触 右上角「···」<br>选择「更多打开方式」',
    imageUrl: `${imageUrlPrefix}/webview-menu@${currentTheme.value}.webp`,
  },
  {
    label: '轻触<br>「瞅我干嘛」',
    imageUrl: `${imageUrlPrefix}/open-with@${currentTheme.value}.webp`,
  },
]);

const emit = defineEmits<{
  (e: 'preserveScrollPosition', callback: () => void): void;
}>();

const officialAccountScrollX = ref(0);
const { isStable } = useIsStable(officialAccountScrollX);
const onScroll = ({ detail: { scrollLeft } }: { detail: { scrollLeft: number } }) => {
  officialAccountScrollX.value = scrollLeft;
}


const setCurrentTab = (index: number) => {
  currentTab.value = index;
}

</script>
