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

  // 隨機推薦歷史的餐廳 ID 列表（按時間順序累積）
  const historyIds = ref<string[]>([]);

  // 已獲得的頭銜
  interface Title {
    id: string;
    name: string;
    icon: string;
    description: string;
  }

  const earnedTitles = ref<Title[]>([]);

  // 可用頭銜定義（依捷運線）
  const titleCatalog: Record<string, Title> = {
    // 板南線（藍線）
    'line_bl': { id: 'line_bl', name: '板南線美食家', icon: '🍣', description: '征服板南線沿線的美味' },
    // 淡水信義線（紅線）
    'line_r': { id: 'line_r', name: '淡水信義線饕客', icon: '🍜', description: '紅線沿線美食無所遁形' },
    // 松山新店線（綠線）
    'line_g': { id: 'line_g', name: '松山新店線食神', icon: '🥟', description: '綠線站站都有你的足跡' },
    // 中和新蘆線（橘線）
    'line_o': { id: 'line_o', name: '中和新蘆線味王', icon: '🍛', description: '橘線美食一網打盡' },
    // 文湖線（棕線）
    'line_br': { id: 'line_br', name: '文湖線小館達人', icon: '🥪', description: '棕線巷弄美食探索家' },
    // 環狀線（黃線）
    'line_y': { id: 'line_y', name: '環狀線老饕', icon: '🍲', description: '黃線美味巡禮全制霸' },
  };

  /**
   * 初始化：從 localStorage 載入資料
   */
  const initFromStorage = () => {
    const favorites = localStorage.getItem('favorites');
    const visited = localStorage.getItem('visited');
    const dislikes = localStorage.getItem('dislikes');
    const titles = localStorage.getItem('titles');
    const history = localStorage.getItem('history');

    if (favorites) favoriteIds.value = JSON.parse(favorites);
    if (visited) visitedIds.value = JSON.parse(visited);
    if (dislikes) dislikeIds.value = JSON.parse(dislikes);
    if (titles) earnedTitles.value = JSON.parse(titles);
    if (history) historyIds.value = JSON.parse(history);
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
   * 新增一筆隨機推薦歷史
   */
  const addHistory = (restaurantId: string) => {
    // 保持完整歷史（可重複），但避免連續相同 ID 一直重複造成噪音
    const last = historyIds.value[historyIds.value.length - 1];
    if (last !== restaurantId) {
      historyIds.value.push(restaurantId);
      localStorage.setItem('history', JSON.stringify(historyIds.value));
    }
  };

  /**
   * 取得已獲得頭銜列表
   */
  const getTitles = computed(() => earnedTitles.value);

  /**
   * 是否已擁有指定頭銜
   */
  const hasTitle = (titleId: string): boolean => {
    return earnedTitles.value.some(t => t.id === titleId);
  };

  /**
   * 根據線別 ID 頒發頭銜（若未擁有）
   */
  const grantTitleByLine = (lineId: string) => {
    const title = titleCatalog[lineId];
    if (!title) return;
    if (!hasTitle(title.id)) {
      earnedTitles.value.push(title);
      localStorage.setItem('titles', JSON.stringify(earnedTitles.value));
    }
  };

  /**
   * 撤銷指定頭銜
   */
  const revokeTitle = (titleId: string) => {
    const next = earnedTitles.value.filter(t => t.id !== titleId);
    if (next.length !== earnedTitles.value.length) {
      earnedTitles.value = next;
      localStorage.setItem('titles', JSON.stringify(earnedTitles.value));
    }
  };

  /**
   * 取得線別對應的頭銜定義
   */
  const getLineTitle = (lineId: string): Title | undefined => titleCatalog[lineId];

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
    historyIds,
    getTitles,
    initFromStorage,
    addFavorite,
    removeFavorite,
    addVisited,
    removeVisited,
    addDislike,
    addHistory,
    isFavorite,
    isVisited,
    isDisliked,
    hasTitle,
    grantTitleByLine,
    revokeTitle,
    getLineTitle,
  };
});
