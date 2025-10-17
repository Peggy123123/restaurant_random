import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import type { Restaurant, FilterOptions, Station, MetroLine } from '@/types';

/**
 * 餐廳資料 Store
 * 管理餐廳清單、選中的站點、篩選條件等
 */
export const useRestaurantStore = defineStore('restaurant', () => {
  // 所有餐廳資料
  const restaurants = ref<Restaurant[]>([]);
  
  // 所有捷運站資料（用於計算最近站點）
  const allStations = ref<Station[]>([]);

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
   * 新增或更新一筆餐廳資料
   * 來源可能來自地圖 Places API 或本地檔案
   */
  const upsertRestaurant = (restaurant: Restaurant) => {
    // 僅保留與 public/data/restaurants.json 相同的欄位與結構
    const normalize = (r: Restaurant): Restaurant => {
      const lat = (r as any)?.geometry?.location?.lat;
      const lng = (r as any)?.geometry?.location?.lng;
      const location = { lat: typeof lat === 'number' ? lat : 0, lng: typeof lng === 'number' ? lng : 0 };
      // 計算最近站點（若餐廳本身已有站點且有名稱，則保留；否則計算）
      const station = (r.station?.name && r.station.name.trim() !== '') ? r.station : findNearestStation(location);
      return {
        place_id: r.place_id,
        name: r.name,
        rating: Number(r.rating ?? 0),
        user_ratings_total: Number(r.user_ratings_total ?? 0),
        price_level: Number(r.price_level ?? 1),
        description: r.description ?? '',
        website: r.website ?? '',
        // restaurants.json 以字串陣列表達
        types: Array.isArray(r.types) ? r.types.slice() : [],
        vicinity: r.vicinity ?? '',
        geometry: {
          location,
        },
        distance_m: Number(r.distance_m ?? 0),
        station,
        photos: Array.isArray(r.photos) ? (r.photos as any[]).map(String) : [],
      } as Restaurant;
    };

    const normalized = normalize(restaurant);
    console.log('[Restaurant Store] upsert餐廳:', normalized.name, '站點:', normalized.station);
    const index = restaurants.value.findIndex((r: Restaurant) => r.place_id === restaurant.place_id);
    if (index === -1) {
      restaurants.value.push(normalized);
    } else {
      restaurants.value[index] = { ...restaurants.value[index], ...normalized } as Restaurant;
    }
    try {
      localStorage.setItem('restaurants_cache', JSON.stringify(restaurants.value));
      console.log('[Restaurant Store] 已存入 localStorage，共', restaurants.value.length, '筆餐廳');
    } catch (e) {
      console.error('[Restaurant Store] localStorage 寫入失敗:', e);
    }
  };

  /**
   * 從 localStorage 載入餐廳快取（供收藏/已吃過頁面在重整後仍可解析）
   */
  const initFromStorage = () => {
    try {
      const cached = localStorage.getItem('restaurants_cache');
      if (cached) {
        const parsed = JSON.parse(cached) as Restaurant[];
        if (Array.isArray(parsed)) {
          restaurants.value = parsed;
          console.log('[Restaurant Store] 從 localStorage 載入', parsed.length, '筆餐廳');
        }
      }
    } catch (e) {
      console.error('[Restaurant Store] localStorage 讀取失敗:', e);
    }
  };

  /**
   * 載入餐廳資料
   */
  const loadRestaurants = async () => {
    try {
      const response = await fetch('./data/restaurants.json');
      const data = await response.json();
      restaurants.value = data;
    } catch (error) {
      console.error('載入餐廳資料失敗:', error);
    }
  };

  /**
   * 載入所有捷運站資料
   */
  const loadStations = async () => {
    try {
      const response = await fetch('./data/stations.json');
      const lines: MetroLine[] = await response.json();
      allStations.value = lines.flatMap((line) => line.stations);
      console.log('[Restaurant Store] 已載入', allStations.value.length, '個捷運站');
    } catch (error) {
      console.error('載入捷運站資料失敗:', error);
    }
  };

  /**
   * 計算兩座標間距離（公尺）
   */
  const haversineDistanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const toRad = (n: number) => (n * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  /**
   * 找出離餐廳最近的捷運站
   */
  const findNearestStation = (location: { lat: number; lng: number }): { name: string; line: string } => {
    if (allStations.value.length === 0) {
      return { name: '', line: '' };
    }
    const first = allStations.value[0];
    if (!first) {
      return { name: '', line: '' };
    }
    let nearest: Station = first;
    let minDist = haversineDistanceMeters(location, nearest.location);
    for (const station of allStations.value) {
      const dist = haversineDistanceMeters(location, station.location);
      if (dist < minDist) {
        minDist = dist;
        nearest = station;
      }
    }
    return { name: nearest.name, line: nearest.line };
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

      // 記錄到使用者的推薦歷史
      try {
        const userStore = useUserStore();
        userStore.addHistory(recommendation.place_id);
      } catch (e) {
        // 靜默失敗以避免影響推薦流程
        // console.warn('寫入歷史失敗', e);
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
    loadStations,
    setSelectedStation,
    updateFilterOptions,
    getFilteredRestaurants,
    getRandomRecommendation,
    resetRecommendations,
    upsertRestaurant,
    initFromStorage,
  };
});
