import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import type { Restaurant, FilterOptions, Station } from '@/types';

/**
 * 餐廳資料 Store
 * 管理餐廳清單、選中的站點、篩選條件等
 */
export const useRestaurantStore = defineStore('restaurant', () => {
  // 所有餐廳資料
  const restaurants = ref<Restaurant[]>([]);
  
  // 當前選中的站點
  const selectedStation = ref<Station | null>(null);
  
  // 當前的篩選條件
  const filterOptions = ref<FilterOptions>({
    budgetMin: 0,
    budgetMax: Infinity,
    distance: 2000,
    types: [],
    rating: 0,
    fromFavorites: false,
    fromVisited: false,
  });
  
  // 當前推薦的餐廳
  const currentRecommendation = ref<Restaurant | null>(null);
  
  // 已推薦過的餐廳 ID（用於避免重複推薦）
  const recommendedIds = ref<string[]>([]);

  /**
   * 載入餐廳資料
   */
  const loadRestaurants = async () => {
    try {
      const response = await fetch('/data/restaurants.json');
      const data = await response.json();
      restaurants.value = data;
    } catch (error) {
      console.error('載入餐廳資料失敗:', error);
    }
  };

  /**
   * 設定選中的站點
   */
  const setSelectedStation = (station: Station) => {
    selectedStation.value = station;
  };

  /**
   * 更新篩選條件
   */
  const updateFilterOptions = (options: Partial<FilterOptions>) => {
    filterOptions.value = { ...filterOptions.value, ...options };
  };

  /**
   * 根據篩選條件獲取符合的餐廳
   */
  const getFilteredRestaurants = (): Restaurant[] => {
    if (!selectedStation.value) return [];

    let filtered = restaurants.value.filter((r: Restaurant) => 
      r.station.name === selectedStation.value?.name
    );

    // 預算篩選（優先使用 average_price，否則以 price_level 近似）
    const minBudget = filterOptions.value.budgetMin;
    const maxBudget = filterOptions.value.budgetMax;
    if (minBudget > 0 || Number.isFinite(maxBudget)) {
      const priceLevelToApprox = (priceLevel: number): number => {
        // 近似對應：1≈200、2≈400、3≈700、4≈1000
        switch (priceLevel) {
          case 1: return 200;
          case 2: return 400;
          case 3: return 700;
          case 4: return 1000;
          default: return 0;
        }
      };

      filtered = filtered.filter((r: Restaurant) => {
        const price = typeof r.average_price === 'number' ? r.average_price : priceLevelToApprox(r.price_level);
        const upper = Number.isFinite(maxBudget) ? (maxBudget as number) : Number.POSITIVE_INFINITY;
        return price >= minBudget && price <= upper;
      });
    }

    // 距離篩選
    filtered = filtered.filter((r: Restaurant) => r.distance_m <= filterOptions.value.distance);

    // 類型篩選
    if (filterOptions.value.types.length > 0) {
      filtered = filtered.filter((r: Restaurant) => 
        r.types.some((t: string) => filterOptions.value.types.includes(t))
      );
    }

    // 評分篩選
    if (filterOptions.value.rating > 0) {
      filtered = filtered.filter((r: Restaurant) => r.rating >= filterOptions.value.rating);
    }

    // 收藏/已吃過來源篩選
    if (filterOptions.value.fromFavorites || filterOptions.value.fromVisited) {
      const userStore = useUserStore();
      const favoriteIds: string[] = userStore.favoriteIds;
      const visitedIds: string[] = userStore.visitedIds;

      let allowedIds: string[] = [];
      if (filterOptions.value.fromFavorites && filterOptions.value.fromVisited) {
        // 交集：同時是收藏且已吃過
        const visitedSet = new Set<string>(visitedIds);
        allowedIds = favoriteIds.filter((id: string) => visitedSet.has(id));
      } else if (filterOptions.value.fromFavorites) {
        allowedIds = [...favoriteIds];
      } else if (filterOptions.value.fromVisited) {
        allowedIds = [...visitedIds];
      }

      filtered = filtered.filter((r: Restaurant) => allowedIds.includes(r.place_id));
    }

    return filtered;
  };

  /**
   * 隨機推薦餐廳
   */
  const getRandomRecommendation = (): Restaurant | null => {
    const filtered = getFilteredRestaurants();
    
    if (filtered.length === 0) return null;

    // 過濾掉已推薦過的餐廳
    const notRecommended = filtered.filter((r: Restaurant) => 
      !recommendedIds.value.includes(r.place_id)
    );

    const pool = notRecommended.length > 0 ? notRecommended : filtered;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const recommendation = pool[randomIndex];

    if (recommendation) {
      currentRecommendation.value = recommendation;
      
      if (!recommendedIds.value.includes(recommendation.place_id)) {
        recommendedIds.value.push(recommendation.place_id);
      }

      return recommendation;
    }

    return null;
  };

  /**
   * 重置推薦記錄
   */
  const resetRecommendations = () => {
    recommendedIds.value = [];
    currentRecommendation.value = null;
  };

  return {
    restaurants,
    selectedStation,
    filterOptions,
    currentRecommendation,
    loadRestaurants,
    setSelectedStation,
    updateFilterOptions,
    getFilteredRestaurants,
    getRandomRecommendation,
    resetRecommendations,
  };
});
