import { ref, computed } from "vue";

const currentTheme = ref(uni.getSystemInfoSync().theme);
uni.onThemeChange(({ theme }) => {
  currentTheme.value = theme;
});

export const useTheme = () => {
  return { currentTheme: computed(() => currentTheme.value) };
}
