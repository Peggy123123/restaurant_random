import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 使用者動作 Store
 * 管理收藏、已吃過、不喜歡的餐廳清單
 */
export const useUserStore = defineStore('user', () => {
  // 收藏的餐廳 ID 列表
  const favoriteIds = ref<string[]>([]);
  
  // 已吃過的餐廳 ID 列表
  const visitedIds = ref<string[]>([]);
  
  // 不喜歡的餐廳 ID 列表
  const dislikeIds = ref<string[]>([]);

  /**
   * 初始化：從 localStorage 載入資料
   */
  const initFromStorage = () => {
    const favorites = localStorage.getItem('favorites');
    const visited = localStorage.getItem('visited');
    const dislikes = localStorage.getItem('dislikes');

    if (favorites) favoriteIds.value = JSON.parse(favorites);
    if (visited) visitedIds.value = JSON.parse(visited);
    if (dislikes) dislikeIds.value = JSON.parse(dislikes);
  };

  /**
   * 加入收藏
   */
  const addFavorite = (restaurantId: string) => {
    if (!favoriteIds.value.includes(restaurantId)) {
      favoriteIds.value.push(restaurantId);
      localStorage.setItem('favorites', JSON.stringify(favoriteIds.value));
    }
  };

  /**
   * 移除收藏
   */
  const removeFavorite = (restaurantId: string) => {
    favoriteIds.value = favoriteIds.value.filter(id => id !== restaurantId);
    localStorage.setItem('favorites', JSON.stringify(favoriteIds.value));
  };

  /**
   * 標記為已吃過
   */
  const addVisited = (restaurantId: string) => {
    if (!visitedIds.value.includes(restaurantId)) {
      visitedIds.value.push(restaurantId);
      localStorage.setItem('visited', JSON.stringify(visitedIds.value));
    }
  };

  /**
   * 移除已吃過
   */
  const removeVisited = (restaurantId: string) => {
    visitedIds.value = visitedIds.value.filter(id => id !== restaurantId);
    localStorage.setItem('visited', JSON.stringify(visitedIds.value));
  };

  /**
   * 標記為不喜歡
   */
  const addDislike = (restaurantId: string) => {
    if (!dislikeIds.value.includes(restaurantId)) {
      dislikeIds.value.push(restaurantId);
      localStorage.setItem('dislikes', JSON.stringify(dislikeIds.value));
    }
  };

  /**
   * 檢查是否已收藏
   */
  const isFavorite = computed(() => (restaurantId: string) => {
    return favoriteIds.value.includes(restaurantId);
  });

  /**
   * 檢查是否已吃過
   */
  const isVisited = computed(() => (restaurantId: string) => {
    return visitedIds.value.includes(restaurantId);
  });

  /**
   * 檢查是否不喜歡
   */
  const isDisliked = computed(() => (restaurantId: string) => {
    return dislikeIds.value.includes(restaurantId);
  });

  return {
    favoriteIds,
    visitedIds,
    dislikeIds,
    initFromStorage,
    addFavorite,
    removeFavorite,
    addVisited,
    removeVisited,
    addDislike,
    isFavorite,
    isVisited,
    isDisliked,
  };
});
