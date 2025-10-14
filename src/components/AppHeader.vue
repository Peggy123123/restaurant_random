<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#fff9f2]">
    <div class="max-w-lg mx-auto px-4 py-4 flex items-center justify-between bg-plate">
       <font-awesome-icon icon="fa-solid fa-user" class="opacity-0 text-gray-500 text-2xl" />
      <!-- Logo -->
        <h1>
          <span class="sr-only">美食大富翁</span>
          <img src="@/assets/images/logo.png" alt="Logo" class="w-28 h-20">
        </h1>

      <!-- 設定按鈕 -->
      <button
        @click="handleSettingsClick"
        class="flex items-center justify-center"
        aria-label="profile"
      >
        <font-awesome-icon icon="fa-solid fa-user" class="text-orange-theme-500 text-2xl" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Emits 定義
 */
const emit = defineEmits<{
  settings: [];
}>();

/**
 * 處理設定按鈕點擊
 */
const handleSettingsClick = () => {
  emit('settings');
};
</script>
