<template>
  <div class="relative mx-auto flex h-auto w-full max-w-md flex-col font-display">
    <div class="flex-grow">
      <!-- Main Content -->
      <main class="px-4">
        <!-- 大富翁動畫區域：雙影片疊層交叉淡入 -->
        <div class="relative mb-4 flex aspect-[16/9] w-full items-center justify-center rounded-[28px] bg-white shadow-lg">
          <!-- Standby 常駐循環影片 -->
          <video
            ref="standbyRef"
            class="absolute inset-0 w-full h-full object-cover object-bottom rounded-[28px] transition-opacity duration-300"
            :src="homeStandVideo"
            preload="auto"
            autoplay
            muted
            playsinline
            loop
            :style="{ opacity: isWalkPlaying ? 0 : 1 }"
            alt="Monopoly standby"
          />
          <!-- Walk 播放一次影片 -->
          <video
            ref="walkRef"
            class="absolute inset-0 w-full h-full object-cover object-bottom rounded-[28px] transition-opacity duration-300"
            :src="homeWalkVideo"
            preload="auto"
            muted
            playsinline
            :style="{ opacity: isWalkPlaying ? 1 : 0 }"
            @ended="onWalkEnded"
            alt="Monopoly walking"
          />
          <div
            v-if="stationToastVisible"
            class="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-lg bg-orange-theme-500 px-4 py-1 text-sm font-bold text-white shadow-lg border border-black-theme-500"
          >
            前往 <span class="font-bold">{{ selectedStation?.name }}</span>！
          </div>
        </div>

        <p class="font-bold text-orange-theme-500 mb-1 text-center">
          {{ '準備好探索美食了嗎？' }}
        </p>

        <p class="mb-2 text-center text-gray-theme-400 text-xs">
          來場美食大富翁之旅，邊探索美食邊收集台北捷運站點吧！
        </p>
        <div class="w-full flex justify-center mb-4">
          <button
            class="text-center w-full text-sm font-bold transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              hasLocation 
                ? 'text-green-600 bg-green-100 border border-green-300 cursor-default' 
                : 'text-orange-theme-500'
            ]"
            @click="handleLocationClick"
            :disabled="isLoading || hasLocation"
          >
            <font-awesome-icon 
              :icon="isLoading ? 'fa-solid fa-spinner fa-spin' : hasLocation ? 'fa-solid fa-check-circle' : 'fa-solid fa-location-dot'" 
            />
            <span class="text-sm">
              {{ isLoading ? '定位中...' : hasLocation ? '已取得最靠近的捷運站' : '取得最靠近的捷運站' }}
            </span>
          </button>
          
        </div>
        <!-- 選擇捷運線 -->
        <div>
          <h2 class="font-bold text-orange-theme-500">選擇捷運線</h2>
          <div class="flex space-x-2 overflow-x-auto py-2 px-2 scroll-smooth">
            <button
              v-for="line in metroLines"
              :key="line.id"
              @click="selectLine(line)"
              class="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-transform"
              :class="[
                selectedLineId === line.id
                  ? (line.backgroundColor || 'bg-gray-500') + ' text-white shadow-lg ring-2 ring-black-theme-500 ring-offset-2 ring-offset-orange-theme-100'
                  : (line.backgroundColor || 'bg-gray-500') + ' text-white/90'
              ]"
            >
              {{ line.name }}
            </button>
          </div>
        </div>
        <!-- 選擇捷運站 -->
        <div class="mb-2">
          <h2 class="font-bold text-orange-theme-500">選擇捷運站</h2>
          <div v-if="currentStations.length > 0" ref="stationScrollContainer" class="flex space-x-1 overflow-x-auto py-2 px-2 scroll-smooth">
            <button
              v-for="station in currentStations"
              :key="station.id"
              :ref="(el) => setStationRef(el, station.id)"
              @click="selectStation(station)"
              class="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold transition-transform"
              :class="[
                selectedStation?.id === station.id
                  ? (metroLines.find(line => line.id === selectedLineId)?.backgroundColor || 'bg-gray-500') + ' text-white shadow-lg ring-2 ring-black-theme-500 ring-offset-2 ring-offset-orange-theme-100'
                  : 'bg-white/80 text-gray-theme-500'
              ]"
            >
              {{ station.name }}
            </button>
          </div>
          <p v-else class="text-sm text-gray-500 text-center py-4 backdrop-blur-sm rounded-xl">
            請先選擇捷運線
          </p>
        </div>
        <!-- 進階篩選 -->
        <div class="mb-2 flex items-center justify-center">
          <button
            @click="showFilterModal = true"
            class="text-sm font-bold text-orange-theme-500 transition-transform flex items-center justify-center gap-2"
          >
            <font-awesome-icon icon="fa-solid fa-filter" />
            <span class="text-sm">進階篩選</span>
          </button>
        </div>
        <!-- 餐廳卡片 -->
        <RestaurantCard
          v-if="currentRecommendation && !isAnimating"
          :restaurant="currentRecommendation"
          @dislike="handleDislike"
        />
        <!-- 無結果提示 -->
        <div v-if="noResults && !isAnimating" class="bg-white rounded-[28px] shadow-lg p-8 text-center mb-4">
          <p class="text-[#4a4a4a] font-semibold text-lg mb-2">找不到符合條件的餐廳</p>
          <p class="text-gray-400 text-sm">試試調整篩選條件</p>
        </div>
        <!-- 隨機推薦按鈕 -->
        <div class="flex justify-center py-2">
          <button
            v-if="!currentRecommendation"
            @click="handleRandomRecommend"
            :disabled="isLoading || isAnimating || !selectedStation"
            class="w-full flex transform items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-theme-400 to-orange-theme-500 px-10 py-3 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="text-lg">隨機推薦</span>
          </button>
          <button
            v-if="currentRecommendation"
            @click="handleRandomRecommend"
            :disabled="isLoading || isAnimating || !selectedStation"
            class="flex transform items-center gap-3 font-bold text-orange-theme-500 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <font-awesome-icon icon="fa-solid fa-shuffle" />
            <span class="text-lg">重新隨機推薦</span>
          </button>
        </div>
      </main>
    </div>
    <!-- 篩選彈窗 -->
    <FilterModal
      v-if="showFilterModal"
      :filters="restaurantStore.filterOptions"
      @close="showFilterModal = false"
      @apply="handleApplyFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRestaurantStore } from '@/stores/restaurant';
import { useUserStore } from '@/stores/user';
import RestaurantCard from '@/components/RestaurantCard.vue';
import FilterModal from '@/components/FilterModal.vue';
import type { Station, MetroLine, FilterOptions } from '@/types';
import homeStandVideo from '@/assets/videos/video-home-standby.mp4';
import homeWalkVideo from '@/assets/videos/video-home-walk.mp4';

const restaurantStore = useRestaurantStore();
const userStore = useUserStore();

// 狀態
const metroLines = ref<MetroLine[]>([]);
const selectedLineId = ref('');
const selectedStation = ref<Station | null>(null);
const showFilterModal = ref(false);
const isLoading = ref(false);
const isAnimating = ref(false);
const noResults = ref(false);
const hasLocation = ref(false);
const isWalkPlaying = ref<boolean>(false);
const standbyRef = ref<HTMLVideoElement | null>(null);
const walkRef = ref<HTMLVideoElement | null>(null);

// 顯示「前往站點」提示 4 秒
const stationToastVisible = ref(false);
let stationToastTimer: number | null = null;
const showStationToast = () => {
  if (!selectedStation.value) return;
  if (stationToastTimer) {
    clearTimeout(stationToastTimer);
    stationToastTimer = null;
  }
  stationToastVisible.value = true;
  stationToastTimer = window.setTimeout(() => {
    stationToastVisible.value = false;
    stationToastTimer = null;
  }, 5000);
};

// 滾動相關
const stationScrollContainer = ref<HTMLElement | null>(null);
const stationRefs = ref<Map<string, HTMLElement>>(new Map());

// 計算屬性：當前選中線路的站點
const currentStations = computed(() => {
  const line = metroLines.value.find(l => l.id === selectedLineId.value);
  return line?.stations || [];
});

// 計算屬性：當前推薦的餐廳
const currentRecommendation = computed(() => restaurantStore.currentRecommendation);

// 設定站點 ref
const setStationRef = (el: any, stationId: string) => {
  if (el && el instanceof HTMLElement) {
    stationRefs.value.set(stationId, el);
  } else {
    stationRefs.value.delete(stationId);
  }
};

// 滾動到選中的站點
const scrollToSelectedStation = () => {
  if (!selectedStation.value || !stationScrollContainer.value) return;
  
  const stationElement = stationRefs.value.get(selectedStation.value.id);
  if (stationElement) {
    const container = stationScrollContainer.value;
    const containerRect = container.getBoundingClientRect();
    const stationRect = stationElement.getBoundingClientRect();
    
    // 計算需要滾動的距離，讓選中的站點居中顯示
    const scrollLeft = stationElement.offsetLeft - (containerRect.width / 2) + (stationRect.width / 2);
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
};

// 初始化
onMounted(async () => {
  isLoading.value = true;
  userStore.initFromStorage();
  try {
    const response = await fetch('./data/stations.json');
    metroLines.value = await response.json();
    // 從 store 還原先前選擇的線別與站點（避免返回此頁時遺失）
    const savedStation = restaurantStore.selectedStation;
    if (savedStation) {
      // 嘗試以 station.line 作為 line.id；若無，則以包含該站點的線別推回
      const lineById = metroLines.value.find(l => l.id === (savedStation as any).line);
      const lineByContain = lineById || metroLines.value.find(l => l.stations.some(s => s.id === savedStation.id));
      if (lineByContain) {
        selectedLineId.value = lineByContain.id;
      }
      selectedStation.value = savedStation;
      nextTick(() => {
        scrollToSelectedStation();
      });
    }
  } catch (error) {
    console.error('載入捷運站資料失敗:', error);
  }
  await restaurantStore.loadRestaurants();
  isLoading.value = false;
  // 預載兩支影片並喚醒首幀，降低切換閃爍
  nextTick(() => {
    try {
      standbyRef.value?.load();
      walkRef.value?.load();
      if (standbyRef.value) {
        standbyRef.value.currentTime = 0.01;
        const p = standbyRef.value.play();
        // 若瀏覽器阻擋自動播放，忽略錯誤
        if (p && typeof (p as any).then === 'function') (p as any).catch(() => {});
      }
      if (walkRef.value) {
        walkRef.value.currentTime = 0.01;
      }
    } catch {}
  });
});

// 選擇線別
const selectLine = (line: MetroLine) => {
  selectedLineId.value = line.id;
  selectedStation.value = null;
  restaurantStore.resetRecommendations();
  noResults.value = false;
  hasLocation.value = false; // 重置定位狀態
};

// 選擇站點
const selectStation = (station: Station) => {
  selectedStation.value = station;
  restaurantStore.setSelectedStation(station);
  restaurantStore.resetRecommendations();
  noResults.value = false;
  hasLocation.value = false; // 重置定位狀態
  playWalkOnce();
  showStationToast();
  
  // 滾動到選中的站點
  nextTick(() => {
    scrollToSelectedStation();
  });
};

// 計算兩點間距離（使用 Haversine 公式）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // 轉換為公尺
};

// 找出最近的捷運站
const findNearestStation = (userLat: number, userLng: number): { station: Station; line: MetroLine } | null => {
  let nearestStation: Station | null = null;
  let nearestLine: MetroLine | null = null;
  let minDistance = Infinity;

  for (const line of metroLines.value) {
    for (const station of line.stations) {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        station.location.lat, 
        station.location.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
        nearestLine = line;
      }
    }
  }

  return nearestStation && nearestLine ? { station: nearestStation, line: nearestLine } : null;
};

// 處理定位按鈕點擊
const handleLocationClick = () => {
  console.log('handleLocationClick called');
  console.log('hasLocation:', hasLocation.value);
  console.log('isLoading:', isLoading.value);
  
  if (!hasLocation.value && !isLoading.value) {
    console.log('Calling getCurrentLocation');
    getCurrentLocation();
  } else {
    console.log('Button click ignored - hasLocation or isLoading is true');
  }
};

// 取得當前位置
const getCurrentLocation = () => {
  console.log('getCurrentLocation');
  
  if (!navigator.geolocation) {
    alert('您的瀏覽器不支援定位功能');
    return;
  }

  // 檢查捷運站資料是否已載入
  if (metroLines.value.length === 0) {
    alert('捷運站資料尚未載入完成，請稍後再試');
    return;
  }

  // 顯示載入狀態
  isLoading.value = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      console.log('使用者位置:', { lat: userLat, lng: userLng });
      
      // 找出最近的捷運站
      const nearest = findNearestStation(userLat, userLng);
      
      if (nearest) {
        // 自動選擇最近的捷運線和站點
        selectedLineId.value = nearest.line.id;
        selectedStation.value = nearest.station;
        restaurantStore.setSelectedStation(nearest.station);
        restaurantStore.resetRecommendations();
        noResults.value = false;
        
        console.log(`已選擇最近的捷運站: ${nearest.station.name} (${nearest.line.name})`);
        console.log('selectedLineId:', selectedLineId.value);
        console.log('selectedStation:', selectedStation.value);
        
        // 標記已取得位置
        hasLocation.value = true;
        // 播放走路影片一次
        playWalkOnce();
        // 顯示前往站點提示
        showStationToast();
        
        // 滾動到選中的站點
        nextTick(() => {
          scrollToSelectedStation();
        });
      } else {
        alert('無法找到附近的捷運站');
      }
      
      isLoading.value = false;
    },
    (error) => {
      isLoading.value = false;
      let errorMessage = '定位失敗';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '定位權限被拒絕，請允許定位功能';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '定位資訊不可用';
          break;
        case error.TIMEOUT:
          errorMessage = '定位請求超時';
          break;
      }
      
      alert(errorMessage);
      console.error('定位錯誤:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5分鐘快取
    }
  );
};

// 播放走路影片一次，結束後淡回待機
const playWalkOnce = () => {
  if (!walkRef.value) return;
  isWalkPlaying.value = true;
  nextTick(() => {
    try {
      walkRef.value!.currentTime = 0;
      const p = walkRef.value!.play();
      if (p && typeof (p as any).then === 'function') (p as any).catch(() => {});
    } catch {}
  });
};

const onWalkEnded = () => {
  isWalkPlaying.value = false;
  // 可選：暫停 walk，節省資源
  try { walkRef.value?.pause(); } catch {}
};

// 處理隨機推薦
const handleRandomRecommend = async () => {
  if (!selectedStation.value || isAnimating.value) return;
  isAnimating.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const result = restaurantStore.getRandomRecommendation();
  isAnimating.value = false;
  noResults.value = result === null;
};

// 處理不喜歡
const handleDislike = () => {
  handleRandomRecommend();
};

// 套用篩選條件
const handleApplyFilters = (filters: FilterOptions) => {
  restaurantStore.updateFilterOptions(filters);
  restaurantStore.resetRecommendations();
  noResults.value = false;
};
</script>

<style scoped>
body {
  min-height: max(884px, 100dvh);
  background-color: #fff9f2;
}
.bg-gradient-cute {
  background-image: linear-gradient(to right, #ffc857, #ff8c42);
}
.text-gradient-cute {
  background: linear-gradient(to right, #ff8c42, #ffc857);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
