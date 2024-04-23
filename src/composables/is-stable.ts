import { watch, ref, type Ref } from "vue";

export const useIsStable = <T>(input: Ref<T>) => {
  let timerId = 0;
  const isStable = ref(true);

  watch(input, () => {
    isStable.value = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      isStable.value = true;
    }, 1000);
  });

  return { isStable }
}
