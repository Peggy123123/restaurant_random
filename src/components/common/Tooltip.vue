<template>
  <div class="inline-block relative tooltip-container">
    <slot />
    <div
      v-if="isDisplayed && text"
      class="absolute bottom-full mb-2 px-2 py-1.5 bg-gray-400 text-white text-sm rounded-xl z-50 pointer-events-none shadow-lg left-1/2 transform -translate-x-1/2"
      :style="tooltipStyle"
    >
      {{ text }}
      <div class="absolute top-full -mt-1 left-1/2 transform -translate-x-1/2">
        <div class="border-4 border-transparent border-t-gray-400"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';

/**
 * Props 定義
 */
interface Props {
  text?: string;
  isDisplayed?: boolean;
  onClose?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  isDisplayed: false,
  onClose: () => {},
});


// 計算 tooltip 的樣式
const tooltipStyle = computed(() => {
  return {
    whiteSpace: 'pre' as const,
    fontSize: '14px',
    lineHeight: '1.4',
    textAlign: 'left' as const,
    maxWidth: 'lg:max-w-300px',
    wordWrap: 'break-word' as const,
  };
});

// 點擊外部關閉 tooltip
const handleClickOutside = (event: MouseEvent) => {
  if (props.isDisplayed && !(event.target as Element).closest('.tooltip-container')) {
    props.onClose?.();
  }
};

// 監聽 tooltip 顯示狀態
watch(() => props.isDisplayed, (newVal) => {
  if (newVal) {
    // 添加點擊外部監聽器
    document.addEventListener('click', handleClickOutside);
  } else {
    // 移除點擊外部監聽器
    document.removeEventListener('click', handleClickOutside);
  }
});

// 組件卸載時清理監聽器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
