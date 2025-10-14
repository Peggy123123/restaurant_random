<template>
  <div class="settings-page min-h-screen bg-slate-50">
    <!-- 返回按鈕 -->
    <div class="max-w-lg mx-auto px-4 mb-4">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-all"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">返回</span>
      </button>
    </div>

    <!-- 使用者資訊卡片 -->
    <div class="max-w-lg mx-auto px-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md p-6">
        <!-- 頭像與名稱 -->
        <div class="flex flex-col items-center mb-6">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl mb-3 shadow-lg">
            👤
          </div>
          <h2 class="text-xl font-bold text-slate-900">美食探險家</h2>
          <p class="text-slate-500 text-sm">taipei_foodie@example.com</p>
        </div>

        <!-- 統計資訊 -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-500">{{ visitedCount }}</div>
            <div class="text-xs text-slate-500">已吃過</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-pink-500">{{ favoritesCount }}</div>
            <div class="text-xs text-slate-500">收藏</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-500">{{ titlesCount }}</div>
            <div class="text-xs text-slate-500">頭銜</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 頭銜列表 -->
    <div class="max-w-lg mx-auto px-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>🏆</span>
          <span>我的頭銜</span>
        </h3>
        
        <div v-if="titles.length > 0" class="space-y-3">
          <div
            v-for="title in titles"
            :key="title.id"
            class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
          >
            <span class="text-2xl">{{ title.icon }}</span>
            <div class="flex-1">
              <div class="font-semibold text-slate-900">{{ title.name }}</div>
              <div class="text-xs text-slate-500">{{ title.description }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-slate-400">
          <p class="text-4xl mb-2">🎯</p>
          <p>開始探索美食，收集頭銜吧！</p>
        </div>
      </div>
    </div>

    <!-- 設定選項 -->
    <div class="max-w-lg mx-auto px-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">
        <button
          class="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-b border-slate-100"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">🔔</span>
            <span class="font-medium text-slate-900">通知設定</span>
          </div>
          <svg
            class="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          class="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-b border-slate-100"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">🎨</span>
            <span class="font-medium text-slate-900">主題設定</span>
          </div>
          <svg
            class="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          class="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">ℹ️</span>
            <span class="font-medium text-slate-900">關於我們</span>
          </div>
          <svg
            class="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 登出按鈕 -->
    <div class="max-w-lg mx-auto px-4">
      <button
        class="w-full py-3 bg-white text-red-500 font-semibold rounded-xl shadow-md hover:bg-red-50 transition-all border border-red-200"
      >
        登出
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * Emits 定義
 */
const emit = defineEmits<{
  back: [];
}>();

const userStore = useUserStore();

/**
 * 頭銜介面
 */
interface Title {
  id: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * 頭銜資料（示例）
 */
const titles = ref<Title[]>([
  // 可以從 userStore 獲取
  // 這裡暫時使用示例資料
]);

/**
 * 計算屬性：已吃過數量
 */
const visitedCount = computed(() => {
  return userStore.visitedIds.length;
});

/**
 * 計算屬性：收藏數量
 */
const favoritesCount = computed(() => {
  return userStore.favoriteIds.length;
});

/**
 * 計算屬性：頭銜數量
 */
const titlesCount = computed(() => {
  return titles.value.length;
});

/**
 * 返回上一頁
 */
const goBack = () => {
  emit('back');
};
</script>
