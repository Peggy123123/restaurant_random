<template>
  <div class="monopoly-page min-h-screen bg-slate-50">
    <div class="max-w-lg mx-auto px-4 py-6">
      <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">台北捷運美食地圖</h2>
      
      <!-- 大富翁地圖區域 -->
      <div class="bg-white rounded-2xl shadow-md p-4 mb-6">
        <div class="overflow-hidden rounded-xl">
          <div
            ref="mapContainer"
            class="relative touch-pan-x touch-pan-y select-none"
            @wheel="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div
              ref="mapHost"
              class="w-full h-auto cursor-pointer"
              @click="handleMapClick"
            />
          </div>
        </div>
      </div>

      <!-- 站點資訊區域 -->
      <div v-if="selectedStationInfo" class="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 class="text-lg font-bold text-slate-900 mb-2">{{ selectedStationInfo.name }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-slate-600">吃過餐廳：</span>
            <span class="font-semibold text-blue-600">{{ selectedStationInfo.visitedCount }} 間</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">已收藏：</span>
            <span class="font-semibold text-purple-600">{{ selectedStationInfo.favoriteCount }} 間</span>
          </div>
        </div>
      </div>

      <!-- 成就統計 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <div class="text-3xl mb-2">🏆</div>
          <div class="text-2xl font-bold text-blue-500">{{ visitedStationsCount }}</div>
          <div class="text-sm text-slate-500">已點亮站點</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <div class="text-3xl mb-2">⭐</div>
          <div class="text-2xl font-bold text-purple-500">{{ completedLinesCount }}</div>
          <div class="text-sm text-slate-500">完成線路</div>
        </div>
      </div>
    </div>

    <!-- 頭銜彈窗 -->
    <div v-if="showTitleModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-11/12 max-w-sm p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="text-3xl">{{ modalTitleIcon }}</div>
          <div class="text-lg font-bold text-slate-900">恭喜你獲得頭銜！</div>
        </div>
        <div class="text-slate-700 mb-6">
          恭喜你獲得「{{ modalTitleName }}」的稱號！
        </div>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            @click="closeTitleModal"
          >關閉</button>
          <button
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            @click="goToSettings"
          >查看頭銜</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRestaurantStore } from '@/stores/restaurant';
import { useUserStore } from '@/stores/user';
// @ts-ignore: vite raw import for svg content
import mapSvgContent from '@/assets/images/map/image-map.svg?raw';

// 大富翁地圖頁面
const restaurantStore = useRestaurantStore();
const userStore = useUserStore();

// SVG 內嵌後使用實際寬高

// 地圖縮放相關
const mapContainer = ref<HTMLElement>();
const mapHost = ref<HTMLElement>();
const mapSvg = ref<SVGSVGElement>();
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
let baseSvgWidth = 0; // 以 scale=1 的實際像素寬度
let baseSvgHeight = 0; // 以 scale=1 的實際像素高度
const MIN_SCALE = ref(1);
const MAX_SCALE = ref(3);

// 觸控相關
const touchStart = ref({ x: 0, y: 0 });
const lastTouch = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const initialDistance = ref(0);
const initialScale = ref(1);

// 選中的站點資訊
const selectedStationInfo = ref<{
  name: string;
  visitedCount: number;
  favoriteCount: number;
} | null>(null);

// 藍線站點資料（從 SVG 中提取的站點 ID）
const blueLineStations = ref([
  { id: 'BL01', name: '頂埔站' },
  { id: 'BL02', name: '永寧站' },
  { id: 'BL03', name: '土城站' },
  { id: 'BL04', name: '海山站' },
  { id: 'BL05', name: '亞東醫院站' },
  { id: 'BL06', name: '府中站' },
  { id: 'BL07', name: '板橋站' },
  { id: 'BL08', name: '新埔站' },
  { id: 'BL09', name: '江子翠站' },
  { id: 'BL10', name: '龍山寺站' },
  { id: 'BL11', name: '西門站' },
  { id: 'BL12', name: '台北車站' },
  { id: 'BL13', name: '善導寺站' },
  { id: 'BL14', name: '忠孝新生站' },
  { id: 'BL15', name: '忠孝復興站' },
  { id: 'BL16', name: '忠孝敦化站' },
  { id: 'BL17', name: '國父紀念館站' },
  { id: 'BL18', name: '市政府站' },
  { id: 'BL19', name: '永春站' },
  { id: 'BL20', name: '後山埤站' },
  { id: 'BL21', name: '昆陽站' },
  { id: 'BL22', name: '南港站' },
  { id: 'BL23', name: '南港展覽館站' },
]);

// 站點路徑資料改由內嵌 SVG 的 id 綁定，不再手動維護 path

// 輔助：判斷站點是否「已吃過」
const isStationVisited = (stationId: string): boolean => {
  const station = blueLineStations.value.find(s => s.id === stationId);
  if (!station) return false;
  return restaurantStore.restaurants.some(restaurant => {
    return (
      restaurant.station.name === station.name &&
      userStore.visitedIds.includes(restaurant.place_id)
    );
  });
};

// 輔助：判斷站點是否「已收藏」
const isStationFavorite = (stationId: string): boolean => {
  const station = blueLineStations.value.find(s => s.id === stationId);
  if (!station) return false;
  return restaurantStore.restaurants.some(restaurant => {
    return (
      restaurant.station.name === station.name &&
      userStore.favoriteIds.includes(restaurant.place_id)
    );
  });
};

// 獲取站點顏色（優先：已吃過→深藍，次之：已收藏→淺藍，否則預設）
const getStationColor = (stationId: string): string => {
  if (isStationVisited(stationId)) {
    return '#1E3A8A'; // 深藍（有光暈）
  }
  if (isStationFavorite(stationId)) {
    return '#BFDBFE'; // 淺藍（無光暈）
  }
  return '#C3CDFF'; // 預設淺藍
};

// 選中站點
const selectStation = (station: { id: string; name: string }) => {
  // 計算該站點的餐廳統計
  const stationRestaurants = restaurantStore.restaurants.filter(r => r.station.name === station.name);
  const visitedCount = stationRestaurants.filter(r => userStore.visitedIds.includes(r.place_id)).length;
  const favoriteCount = stationRestaurants.filter(r => userStore.favoriteIds.includes(r.place_id)).length;

  selectedStationInfo.value = {
    name: station.name,
    visitedCount,
    favoriteCount,
  };
};

// 地圖點擊處理
const handleMapClick = (event: MouseEvent) => {
  // 如果點擊的是空白區域，清除選中狀態
  if (event.target === mapSvg.value) {
    selectedStationInfo.value = null;
  }
};

// 滑鼠滾輪縮放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  if (!mapSvg.value) return;

  const rect = mapSvg.value.getBoundingClientRect();
  const cursorX = event.clientX - rect.left;
  const cursorY = event.clientY - rect.top;

  // 平滑滾輪縮放（依 deltaY 指數縮放，避免跳躍）
  const prevScale = scale.value;
  const zoom = Math.exp(-event.deltaY * 0.005);
  const rawNew = prevScale * zoom;
  const newScale = Math.max(MIN_SCALE.value, Math.min(MAX_SCALE.value, rawNew));
  const s = newScale / prevScale;

  // 以滑鼠位置為中心縮放，調整平移量保持該點視覺位置不變
  translateX.value = cursorX - s * (cursorX - translateX.value);
  translateY.value = cursorY - s * (cursorY - translateY.value);
  scale.value = newScale;

  clampTranslate();
};

// 計算兩點間距離
const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// 觸控開始
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    // 單指拖拽
    const touch = event.touches[0];
    if (touch) {
      touchStart.value = { x: touch.clientX, y: touch.clientY };
      lastTouch.value = { x: touch.clientX, y: touch.clientY };
      isDragging.value = true;
    }
  } else if (event.touches.length === 2) {
    // 雙指縮放
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (touch1 && touch2) {
      initialDistance.value = getDistance(touch1, touch2);
      initialScale.value = scale.value;
      isDragging.value = false;
    }
  }
};

// 觸控移動
const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 1 && isDragging.value) {
    // 單指拖拽
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      const deltaX = touch.clientX - lastTouch.value.x;
      const deltaY = touch.clientY - lastTouch.value.y;

      translateX.value += deltaX;
      translateY.value += deltaY;

      lastTouch.value = { x: touch.clientX, y: touch.clientY };
      clampTranslate();
    }
  } else if (event.touches.length === 2) {
    // 雙指縮放
    event.preventDefault();
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (touch1 && touch2) {
      const currentDistance = getDistance(touch1, touch2);
      if (initialDistance.value > 0) {
        const scaleChange = currentDistance / initialDistance.value;
        const rawNew = initialScale.value * scaleChange;
        const prevScale = scale.value;
        const newScale = Math.max(MIN_SCALE.value, Math.min(MAX_SCALE.value, rawNew));
        const s = newScale / prevScale;

        // 以兩指中點為縮放中心
        if (mapSvg.value) {
          const rect = mapSvg.value.getBoundingClientRect();
          const midX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
          const midY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
          translateX.value = midX - s * (midX - translateX.value);
          translateY.value = midY - s * (midY - translateY.value);
        }

        scale.value = newScale;
        clampTranslate();
      }
    }
  }
};

// 滑鼠拖拽平移（桌面端）
let isMouseDown = false;
let mouseLast = { x: 0, y: 0 };
const handleMouseDown = (e: MouseEvent) => {
  isMouseDown = true;
  mouseLast = { x: e.clientX, y: e.clientY };
};
const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseDown) return;
  e.preventDefault();
  const dx = e.clientX - mouseLast.x;
  const dy = e.clientY - mouseLast.y;
  translateX.value += dx;
  translateY.value += dy;
  mouseLast = { x: e.clientX, y: e.clientY };
  clampTranslate();
};
const handleMouseUp = () => {
  isMouseDown = false;
};

// 觸控結束
const handleTouchEnd = () => {
  isDragging.value = false;
  initialDistance.value = 0;
};

// 更新變換：不再單獨使用，合併到 clampTranslate 中

// 夾住平移，確保內容覆蓋容器且可被拖至四邊
const clampTranslate = () => {
  if (!mapContainer.value || !mapSvg.value || baseSvgWidth === 0 || baseSvgHeight === 0) return;
  const containerW = mapContainer.value.clientWidth;
  const containerH = mapContainer.value.clientHeight;
  const scaledW = baseSvgWidth * scale.value;
  const scaledH = baseSvgHeight * scale.value;

  // 小於容器則置中
  if (scaledW <= containerW) {
    translateX.value = (containerW - scaledW) / 2;
  } else {
    const minX = containerW - scaledW;
    const maxX = 0;
    translateX.value = Math.min(maxX, Math.max(minX, translateX.value));
  }

  if (scaledH <= containerH) {
    translateY.value = (containerH - scaledH) / 2;
  } else {
    const minY = containerH - scaledH;
    const maxY = 0;
    translateY.value = Math.min(maxY, Math.max(minY, translateY.value));
  }

  mapSvg.value.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`;
};

// 計算已點亮的站點數量
const visitedStationsCount = computed(() => {
  return blueLineStations.value.filter(station => {
    return restaurantStore.restaurants.some(restaurant => {
      return restaurant.station.name === station.name && userStore.visitedIds.includes(restaurant.place_id);
    });
  }).length;
});

// 計算完成的線路數量（目前只有藍線）
const completedLinesCount = computed(() => {
  // 嚴格完成條件：藍線每站皆有「已吃過」餐廳
  return isBlueLineCompleted.value ? 1 : 0;
});

// 是否已完成藍線（板南線）：每站至少有一間「已吃過」餐廳
const isBlueLineCompleted = computed(() => {
  return blueLineStations.value.every(station => {
    return restaurantStore.restaurants.some(r => r.station.name === station.name && userStore.visitedIds.includes(r.place_id));
  });
});

// 頭銜彈窗狀態
const showTitleModal = ref(false);
const modalTitleName = ref('');
const modalTitleIcon = ref('🏆');

const closeTitleModal = () => {
  showTitleModal.value = false;
};

const goToSettings = () => {
  // 透過全域事件讓 App.vue 導頁
  window.dispatchEvent(new CustomEvent('navigate-settings'));
  showTitleModal.value = false;
};

// 驗證板南線頭銜有效性（每站皆需有已吃過餐廳）
const validateBlueLineTitle = () => {
  const lineId = 'line_bl';
  if (userStore.hasTitle(lineId) && !isBlueLineCompleted.value) {
    userStore.revokeTitle(lineId);
  }
};

onMounted(async () => {
  await restaurantStore.loadRestaurants();

  // 初始化用戶資料（如果沒有資料的話）
  userStore.initFromStorage();

  // 為了測試，添加一些示例資料
  if (userStore.visitedIds.length === 0) {
    // 添加一些已吃過的餐廳（對應象山站、國父紀念館站、市政府站）
    const testVisitedIds = [
      'station_xiangshan_1', // 一蘭拉麵 信義店
      'station_xiangshan_2', // 鼎泰豐 信義店
      'station_memorial_1',  // 添好運點心專門店
      'station_memorial_2',  // 春水堂人文茶館
      'station_cityh_1',     // 鼎王麻辣鍋
    ];

    testVisitedIds.forEach(id => userStore.addVisited(id));
  }

  if (userStore.favoriteIds.length === 0) {
    // 添加一些收藏的餐廳
    const testFavoriteIds = [
      'station_xiangshan_1', // 一蘭拉麵 信義店
      'station_memorial_1',  // 添好運點心專門店
      'station_cityh_1',     // 鼎王麻辣鍋
    ];

    testFavoriteIds.forEach(id => userStore.addFavorite(id));
  }

  // 進入頁面時：若已完成整條板南線且尚未有該頭銜，頒發並顯示彈窗
  const lineId = 'line_bl';
  if (isBlueLineCompleted.value && !userStore.hasTitle(lineId)) {
    const title = userStore.getLineTitle(lineId);
    if (title) {
      userStore.grantTitleByLine(lineId);
      modalTitleName.value = title.name;
      modalTitleIcon.value = title.icon;
      showTitleModal.value = true;
    }
  }

  // 進入頁面時：驗證已擁有頭銜是否仍有效（每站皆有已吃過）
  validateBlueLineTitle();

  // 動態監聽：使用者「已吃過」清單或餐廳資料變化時，重新驗證頭銜
  watch(
    () => userStore.visitedIds.slice(),
    () => {
      validateBlueLineTitle();
      applyStationsVisual();
    }
  );
  watch(
    () => restaurantStore.restaurants.length,
    () => {
      validateBlueLineTitle();
      applyStationsVisual();
    }
  );
  watch(
    () => userStore.favoriteIds.slice(),
    () => applyStationsVisual()
  );

  // 內嵌 SVG 地圖並綁定互動
  await nextTick();
  if (mapHost.value) {
    mapHost.value.innerHTML = mapSvgContent as unknown as string;
    const svgEl = mapHost.value.querySelector('svg') as SVGSVGElement | null;
    if (svgEl) {
      mapSvg.value = svgEl;
      svgEl.style.width = '100%';
      svgEl.style.height = 'auto';
      svgEl.style.transformOrigin = '0 0';

      ensureGlowFilter(svgEl);
      bindStationInteractions(svgEl);
      applyStationsVisual();
      // 初始化尺寸與最小縮放，確保進入時填滿容器
      await nextTick();
      const r = svgEl.getBoundingClientRect();
      baseSvgWidth = r.width / scale.value;
      baseSvgHeight = r.height / scale.value;
      if (mapContainer.value) {
        const cw = mapContainer.value.clientWidth;
        const ch = mapContainer.value.clientHeight;
        const minByW = cw / baseSvgWidth;
        const minByH = ch / baseSvgHeight;
        MIN_SCALE.value = Math.max(1, Math.min(minByW, minByH));
        if (scale.value < MIN_SCALE.value) scale.value = MIN_SCALE.value;
        clampTranslate();
      }
    }
  }
});

// 若 SVG 尚無對應的光暈濾鏡，則動態加入
const ensureGlowFilter = (svgEl: SVGSVGElement) => {
  const existing = svgEl.querySelector('#station-glow');
  if (existing) return;
  let defs = svgEl.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgEl.insertBefore(defs, svgEl.firstChild);
  }
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'station-glow');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');

  const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', '3');
  blur.setAttribute('result', 'blur');

  const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  mergeNode1.setAttribute('in', 'blur');
  const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  mergeNode2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);

  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
};

// 依 BL01–BL23 綁定互動
const bindStationInteractions = (svgEl: SVGSVGElement) => {
  blueLineStations.value.forEach(station => {
    const node = svgEl.querySelector(`#${station.id}`) as SVGGElement | SVGElement | null;
    if (!node) return;
    (node as SVGElement).style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      selectStation(station);
    });
  });
};

// 依據 visited/favorite 更新各站視覺
const applyStationsVisual = () => {
  if (!mapSvg.value) return;
  blueLineStations.value.forEach(station => {
    const node = mapSvg.value!.querySelector(`#${station.id}`) as SVGGElement | SVGElement | null;
    if (!node) return;
    const isVisited = isStationVisited(station.id);
    const color = getStationColor(station.id);

    // 對該站群組內原白底 .st2 元素著色，若沒有則直接塗該節點
    const targets = (node as SVGElement).querySelectorAll<SVGElement>('.st2');
    if (targets.length > 0) {
      targets.forEach(el => {
        // 以行內 style 提升優先權，避免被 <style>.st2 覆蓋
        (el as SVGElement).style.setProperty('fill', color);
      });
    } else {
      (node as SVGElement).style.setProperty('fill', color);
    }

    if (isVisited) {
      (node as SVGElement).setAttribute('filter', 'url(#station-glow)');
    } else {
      (node as SVGElement).removeAttribute('filter');
    }
  });
};
</script>
