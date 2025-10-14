<template>
  <div class="inline-block relative">
    <slot />
    <div
      v-if="isDisplayed && text"
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap z-50 pointer-events-none"
    >
      {{ text }}
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div class="border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Props 定義
 */
interface Props {
  text?: string;
  isDisplayed?: boolean;
}

withDefaults(defineProps<Props>(), {
  text: '',
  isDisplayed: false,
});
</script>
