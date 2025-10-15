<template>
  <div class="favorites-page min-h-screen bg-slate-50">
    <div class="max-w-lg mx-auto px-4 py-6">
      <!-- 標題與總數提示 -->
      <div class="mb-4 px-3 py-2 text-slate-700 text-sm">
        共歷史 <span class="font-semibold text-pink-600">{{ historyCount }}</span> 筆紀錄
      </div>

      <!-- 歷史列表 -->
      <div class="space-y-4">
        <div v-if="historyIds.length === 0" class="bg-white rounded-2xl shadow-md p-12 text-center">
          <p class="text-slate-600 font-medium">尚無歷史紀錄</p>
          <p class="text-slate-400 text-sm mt-2">從首頁開始隨機探索餐廳吧！</p>
        </div>

        <!-- 依序顯示所有歷史推薦過的餐廳（最新在下方或上方：此處採最新在下方，與累積一致） -->
        <template v-for="(restaurantId, idx) in historyIds" :key="restaurantId + '-' + idx">
          <RestaurantCard
            v-if="getRestaurantById(restaurantId)"
            :restaurant="getRestaurantById(restaurantId)!"
          />
        </template>
      </div>
    </div>
  </div>
 </template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRestaurantStore } from '@/stores/restaurant';
import RestaurantCard from '@/components/RestaurantCard.vue';

const userStore = useUserStore();
const restaurantStore = useRestaurantStore();

// 歷史 ID 列表
const historyIds = computed(() => userStore.historyIds);

// 歷史總數
const historyCount = computed(() => userStore.historyIds.length);

// 由餐廳 ID 取得餐廳資料
const getRestaurantById = (id: string) => {
  return restaurantStore.restaurants.find(r => r.place_id === id);
};
</script>


