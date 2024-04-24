import { watch, ref, type Ref, computed } from "vue";

const isScrollEventFiring = ref(false);
const isDragging = ref(false);
let timerId = 0;

export const useScroll = () => {
  const onDragging = () => {
    console.log('onDragging');
    isDragging.value = true;
  }
  const onDragEnd = () => {
    console.log('onDragEnd');
    isDragging.value = false;
  }
  const onScroll = () => {
    console.log('onScroll');
    isScrollEventFiring.value = true;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      console.log('onScroll timeout');
      isScrollEventFiring.value = false;
    }, 100);
  }

  const isScrolling = computed(() => isDragging.value || isScrollEventFiring.value);

  return { isScrolling, onDragging, onDragEnd, onScroll }
}
