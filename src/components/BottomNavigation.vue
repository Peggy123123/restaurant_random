<template>
  <nav class="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 z-50 shadow-lg">
    <div class="flex items-stretch justify-between w-full" style="padding-bottom: env(safe-area-inset-bottom);">
      <!-- 隨機推薦頁（首頁） -->
      <button
        @click="navigateTo('home')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 border-b-2 transition-all duration-200',
          getNavClasses('home')
        ]"
      >
        <font-awesome-icon 
          :icon="['fas', 'dice']" 
          class="w-6 h-6 text-xl"
        />
        <span class="text-xs font-semibold">推薦</span>
      </button>

      <!-- Google 地圖頁 -->
      <button
        @click="navigateTo('map')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 border-b-2 transition-all duration-200',
          getNavClasses('map')
        ]"
      >
        <font-awesome-icon 
          :icon="['fas', 'map-location-dot']" 
          class="w-6 h-6 text-xl"
        />
        <span class="text-xs font-semibold">地圖</span>
      </button>

      <!-- 大富翁地圖頁 -->
      <button
        @click="navigateTo('monopoly')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 border-b-2 transition-all duration-200',
          getNavClasses('monopoly')
        ]"
      >
        <font-awesome-icon 
          :icon="['fas', 'gamepad']" 
          class="w-6 h-6 text-xl"
        />
        <span class="text-xs font-semibold">蒐集</span>
      </button>

      <!-- 收藏頁 -->
      <button
        @click="navigateTo('favorites')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 border-b-2 transition-all duration-200',
          getNavClasses('favorites')
        ]"
      >
        <div class="relative">
        <font-awesome-icon 
          :icon="['fas', 'heart']" 
          class="w-6 h-6 text-xl"
        />
          <!-- 右上角徽章：收藏+已吃過 總數 -->
          <span v-if="combinedCount > 0" class="absolute -top-3 -right-4 min-w-5 h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-pink-600 text-white shadow">
            {{ combinedCount }}
          </span>
        </div>
        <span class="text-xs font-semibold">收藏</span>
      </button>

      <!-- 歷史頁（最右邊） -->
      <button
        @click="navigateTo('history')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-1 py-3 border-b-2 transition-all duration-200',
          getNavClasses('history')
        ]"
      >
        <div class="relative">
          <font-awesome-icon
            :icon="['fas', 'clock-rotate-left']"
            class="w-6 h-6 text-xl"
          />
          <span v-if="historyCount > 0" class="absolute -top-3 -right-4 min-w-5 h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-pink-600 text-white shadow">
            {{ historyCount }}
          </span>
        </div>
        <span class="text-xs font-semibold">歷史</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
/**
 * Props 定義
 */
interface Props {
  currentPage: 'home' | 'map' | 'monopoly' | 'favorites' | 'history' | 'settings';
}

const props = defineProps<Props>();

/**
 * Emits 定義
 */
const emit = defineEmits<{
  navigate: [page: string];
}>();

const userStore = useUserStore();

/**
 * 收藏+已吃過 總數
 */
const combinedCount = computed(() => userStore.favoriteIds.length + userStore.visitedIds.length);

/**
 * 歷史 總數
 */
const historyCount = computed(() => userStore.historyIds.length);

/**
 * 導航到指定頁面
 */
const navigateTo = (page: string) => {
  emit('navigate', page);
};

/**
 * 獲取導航按鈕的類名
 */
const getNavClasses = (page: string) => {
  return props.currentPage === page
    ? 'text-primary-500 border-primary-500 bg-primary-500/10'
    : 'text-gray-theme-400 border-transparent hover:text-gray-theme-600 hover:bg-gray-theme-100 active:bg-gray-theme-200';
};
</script>

<style scoped>
/* 確保導覽列固定在底部 */
nav {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
}
</style>
