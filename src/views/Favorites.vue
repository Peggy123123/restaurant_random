<template>
  <div class="favorites-page min-h-screen bg-slate-50">
    <div class="max-w-lg mx-auto px-4 py-6">
      <!-- Tab 切換 -->
      <div class="flex gap-2 mb-6">
        <button
          @click="currentTab = 'favorites'"
          :class="[
            'flex-1 py-3 rounded-xl font-semibold transition-all',
            currentTab === 'favorites'
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
          ]"
        >
          已收藏
        </button>
        <button
          @click="currentTab = 'visited'"
          :class="[
            'flex-1 py-3 rounded-xl font-semibold transition-all',
            currentTab === 'visited'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
          ]"
        >
          已吃過
        </button>
      </div>

      <!-- 總數提示 -->
      <div class="mb-4 px-3 py-2 text-slate-700 text-sm">
        共{{ currentTab === 'favorites' ? '收藏' : '吃過' }} <span class="font-semibold text-pink-600">{{ currentTab === 'favorites' ? favoriteCount : visitedCount }}</span> 間餐廳
      </div>

      <!-- 已收藏列表 -->
      <div v-if="currentTab === 'favorites'" class="space-y-4">
        <div v-if="favoriteRestaurants.length === 0" class="bg-white rounded-2xl shadow-md p-12 text-center">
          <p class="text-slate-600 font-medium">尚無收藏餐廳</p>
          <p class="text-slate-400 text-sm mt-2">快去探索並收藏喜歡的餐廳吧！</p>
        </div>
        
        <template v-for="restaurantId in favoriteRestaurants" :key="restaurantId">
          <RestaurantCard
            v-if="getRestaurantById(restaurantId)"
            :restaurant="getRestaurantById(restaurantId)!"
            :actions="['favorite']"
          />
        </template>
      </div>

      <!-- 已吃過列表 -->
      <div v-if="currentTab === 'visited'" class="space-y-4">
        <div v-if="visitedRestaurants.length === 0" class="bg-white rounded-2xl shadow-md p-12 text-center">
          <p class="text-slate-600 font-medium">尚無吃過的餐廳</p>
          <p class="text-slate-400 text-sm mt-2">開始你的美食探險之旅！</p>
        </div>
        
        <template v-for="restaurantId in visitedRestaurants" :key="restaurantId">
          <RestaurantCard
            v-if="getRestaurantById(restaurantId)"
            :restaurant="getRestaurantById(restaurantId)!"
            :actions="['visited']"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRestaurantStore } from '@/stores/restaurant';
import RestaurantCard from '@/components/RestaurantCard.vue';

const userStore = useUserStore();
const restaurantStore = useRestaurantStore();

/**
 * 當前 Tab
 */
const currentTab = ref<'favorites' | 'visited'>('favorites');

/**
 * 計算屬性：收藏的餐廳 ID 列表
 */
const favoriteRestaurants = computed(() => {
  return userStore.favoriteIds;
});

/**
 * 收藏總數
 */
const favoriteCount = computed(() => userStore.favoriteIds.length);

/**
 * 計算屬性：已吃過的餐廳 ID 列表
 */
const visitedRestaurants = computed(() => {
  return userStore.visitedIds;
});

/**
 * 已吃過總數
 */
const visitedCount = computed(() => userStore.visitedIds.length);

/**
 * 根據 ID 獲取餐廳資料
 */
const getRestaurantById = (id: string) => {
  return restaurantStore.restaurants.find(r => r.place_id === id);
};
</script>
