<template>
  <div class="monopoly-page bg-slate-50">
    <div class="max-w-lg mx-auto px-4 py-6">
      <!-- 大富翁地圖區域 -->
      <div class="bg-white rounded-2xl shadow-md p-4 mb-2">
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

      <p class="text-gray-400 mb-2 text-center text-sm">點擊地圖上的站點，查看站點蒐集狀況。蒐集完整條捷運線後，即可獲得頭銜！</p>

      <!-- 站點資訊區域 -->
      <div v-if="selectedStationInfo" class="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 class="text-lg font-bold text-slate-900 mb-2">{{ selectedStationInfo.name }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-slate-600">吃過餐廳</span>
            <span class="font-semibold text-blue-600">{{ selectedStationInfo.visitedCount }} 間</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600">已收藏</span>
            <span class="font-semibold text-purple-600">{{ selectedStationInfo.favoriteCount }} 間</span>
          </div>
        </div>
      </div>

      <!-- 成就統計 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-blue-500 select-none">{{ visitedStationsCount }}</div>
          <div class="text-sm text-slate-500 flex items-center justify-center gap-1">
            已蒐集站點
            <Tooltip
              :text="'蒐集站點方法：在該站點吃過1間以上的餐廳。\n在地圖上亮起的站點就是已蒐集到的站點'"
              :isDisplayed="showTooltip"
              :onClose="() => showTooltip = false"
            >
              <font-awesome-icon
                icon="fa-solid fa-circle-question"
                class="cursor-pointer text-slate-400 hover:text-slate-600"
                @click="toggleTooltip"
              />
            </Tooltip>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <div class="text-2xl font-bold text-purple-500 select-none">{{ completedLinesCount }}</div>
          <div class="text-sm text-slate-500">完成捷運線</div>
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
import Tooltip from '@/components/common/Tooltip.vue';
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

// 從 stations.json 載入的所有線與站點
type SimpleStation = { id: string; name: string };
type SimpleLine = { id: string; name: string; stations: SimpleStation[] };
const lines = ref<SimpleLine[]>([]);
// 所有站點（供 SVG 綁定與查詢）
const allStations = ref<SimpleStation[]>([]);

// 站點路徑資料改由內嵌 SVG 的 id 綁定，不再手動維護 path

// 輔助：判斷站點是否「已吃過」
const isStationVisited = (stationId: string): boolean => {
  const station = allStations.value.find(s => s.id === stationId);
  if (!station) return false;

  // 檢查該站點名稱是否在任何線路中都有已吃過的餐廳
  // 這樣轉乘站只要在任一線路被吃過就算已蒐集
  return restaurantStore.restaurants.some(restaurant => {
    return (
      restaurant.station.name === station.name &&
      userStore.visitedIds.includes(restaurant.place_id)
    );
  });
};

// 輔助：判斷站點是否「已收藏」
const isStationFavorite = (stationId: string): boolean => {
  const station = allStations.value.find(s => s.id === stationId);
  if (!station) return false;
  return restaurantStore.restaurants.some(restaurant => {
    return (
      restaurant.station.name === station.name &&
      userStore.favoriteIds.includes(restaurant.place_id)
    );
  });
};

// 由站點 id 反查線別 id（如 blue_line, red_line...）
const getLineIdByStationId = (stationId: string): string | null => {
  const line = lines.value.find(l => l.stations.some(s => s.id === stationId));
  return line ? line.id : null;
};

// 依線別取得對應 CSS 變數色碼（優先：已吃過→visited，其次：已收藏→favorite，否則預設灰藍）
const getStationColor = (stationId: string): string => {
  const lineId = getLineIdByStationId(stationId);
  const visited = isStationVisited(stationId);
  const favorite = isStationFavorite(stationId);

  if (!lineId) {
    // 找不到線別時的保底色
    if (visited) return '#1E3A8A';
    if (favorite) return '#BFDBFE';
    return '#C3CDFF';
  }

  // 映射線別到對應 CSS 變數前綴
  const lineKeyMap: Record<string, string> = {
    blue_line: 'blue',
    red_line: 'red',
    green_line: 'green',
    orange_line: 'orange',
    brown_line: 'brown',
    yellow_line: 'yellow',
  };

  const key = lineKeyMap[lineId];
  if (!key) {
    if (visited) return '#1E3A8A';
    if (favorite) return '#BFDBFE';
    return '#C3CDFF';
  }

  if (visited) return getComputedStyle(document.documentElement).getPropertyValue(`--mrt-${key}-visited`).trim() || '#000000';
  if (favorite) return getComputedStyle(document.documentElement).getPropertyValue(`--mrt-${key}-favorite`).trim() || '#999999';
  // 未標記狀態時，可維持原本預設淺藍，避免過度干預底圖
  return '#C3CDFF';
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

// 計算已點亮的站點數量（全線總和，去重）
const visitedStationsCount = computed(() => {
  const visitedNames = new Set<string>();
  allStations.value.forEach(station => {
    // 使用 isStationVisited 函數，確保轉乘站邏輯一致
    if (isStationVisited(station.id)) {
      visitedNames.add(station.name);
    }
  });
  return visitedNames.size;
});

// 某條線是否已完成：每站至少有一間「已吃過」
// 轉乘站只要在任一線路被吃過就算該站已蒐集
const isLineCompleted = (line: SimpleLine): boolean => {
  return line.stations.every(station => {
    // 使用 isStationVisited 函數，它已經處理了轉乘站的邏輯
    return isStationVisited(station.id);
  });
};

// 計算完成的線路數量（所有線）
const completedLinesCount = computed(() => {
  return lines.value.filter(line => isLineCompleted(line)).length;
});

// 站點線別 id -> 頭銜 id 對應
const lineIdToTitleId: Record<string, string> = {
  blue_line: 'line_bl',
  red_line: 'line_r',
  green_line: 'line_g',
  orange_line: 'line_o',
  brown_line: 'line_br',
  yellow_line: 'line_y',
};

// 頭銜彈窗狀態
const showTitleModal = ref(false);
const modalTitleName = ref('');
const modalTitleIcon = ref('🏆');

// Tooltip 狀態
const showTooltip = ref(false);

const closeTitleModal = () => {
  showTitleModal.value = false;
};

const goToSettings = () => {
  // 透過全域事件讓 App.vue 導頁
  window.dispatchEvent(new CustomEvent('navigate-settings'));
  showTitleModal.value = false;
};

const toggleTooltip = () => {
  showTooltip.value = !showTooltip.value;
};

// 驗證所有線之頭銜有效性（每站皆需有已吃過餐廳）
const validateAllLineTitles = () => {
  lines.value.forEach(line => {
    const titleId = lineIdToTitleId[line.id];
    if (!titleId) return;
    if (userStore.hasTitle(titleId) && !isLineCompleted(line)) {
      userStore.revokeTitle(titleId);
    }
  });
};

onMounted(async () => {
  await restaurantStore.loadRestaurants();

  // 初始化用戶資料（如果沒有資料的話）
  userStore.initFromStorage();

  // 後續會在載入線資料後進行頭銜檢查與頒發

  // 動態監聽：使用者「已吃過」清單或餐廳資料變化時，重新驗證頭銜
  watch(
    () => userStore.visitedIds.slice(),
    () => {
      validateAllLineTitles();
      applyStationsVisual();
    }
  );

  watch(
    () => restaurantStore.restaurants.length,
    () => {
      validateAllLineTitles();
      applyStationsVisual();
    }
  );

  watch(
    () => userStore.favoriteIds.slice(),
    () => applyStationsVisual()
  );

  // 載入所有線站點資料（供地圖綁定與統計）
  try {
    const resp = await fetch('data/stations.json');
    const rawLines: Array<{ id: string; name: string; stations: Array<{ id: string; name: string }> }> = await resp.json();
    lines.value = rawLines.map(l => ({ id: l.id, name: l.name, stations: l.stations.map(s => ({ id: s.id, name: s.name })) }));
    allStations.value = lines.value.flatMap(line => line.stations.map(s => ({ id: s.id, name: s.name })));
  } catch (e) {
    lines.value = [];
    allStations.value = [];
  }

  // 內嵌 SVG 地圖並綁定互動（需在 allStations 準備好後）
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
  // 載入地圖後，檢查並可能頒發頭銜（一次顯示一個）
  for (const line of lines.value) {
    const titleId = lineIdToTitleId[line.id];
    if (!titleId) continue;
    if (isLineCompleted(line) && !userStore.hasTitle(titleId)) {
      const title = userStore.getLineTitle(titleId);
      if (title) {
        userStore.grantTitleByLine(titleId);
        modalTitleName.value = title.name;
        modalTitleIcon.value = title.icon;
        showTitleModal.value = true;
        break; // 一次僅顯示一個
      }
    }
  }

  // 進入頁面時：驗證已擁有頭銜是否仍有效
  validateAllLineTitles();
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
  blur.setAttribute('stdDeviation', '4');
  blur.setAttribute('result', 'blur');

  // 持續閃爍的光暈：透過動畫改變模糊半徑
  const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animate.setAttribute('attributeName', 'stdDeviation');
  animate.setAttribute('values', '6;18;6');
  animate.setAttribute('dur', '1.6s');
  animate.setAttribute('repeatCount', 'indefinite');
  blur.appendChild(animate);

  // 將模糊層著色為金黃色
  const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
  flood.setAttribute('flood-color', '#FFD54A');
  flood.setAttribute('flood-opacity', '1');
  flood.setAttribute('result', 'gold');

  const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
  composite.setAttribute('in', 'gold');
  composite.setAttribute('in2', 'blur');
  composite.setAttribute('operator', 'in');
  composite.setAttribute('result', 'glow');

  const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  mergeNode1.setAttribute('in', 'glow');
  const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  mergeNode2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);

  filter.appendChild(blur);
  filter.appendChild(flood);
  filter.appendChild(composite);
  filter.appendChild(merge);
  defs.appendChild(filter);
};

// 依所有線站點 ID 綁定互動
const bindStationInteractions = (svgEl: SVGSVGElement) => {
  allStations.value.forEach(station => {
    const node = svgEl.querySelector(`#${station.id}`) as SVGGElement | SVGElement | null;
    if (!node) return;
    (node as SVGElement).style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      selectStation(station);
    });
  });
};

// 依據 visited/favorite 更新各站視覺（全線）
const applyStationsVisual = () => {
  if (!mapSvg.value) return;
  allStations.value.forEach(station => {
    const node = mapSvg.value!.querySelector(`#${station.id}`) as SVGGElement | SVGElement | null;
    if (!node) return;
    const isVisited = isStationVisited(station.id);
    const isFavorite = isStationFavorite(station.id);
    const color = getStationColor(station.id);

    // 新邏輯：直接尋找該站節點下的 circle 和 rect，移除 cls-29 並設定 fill
    const circles = (node as SVGElement).querySelectorAll('circle');
    const rects = (node as SVGElement).querySelectorAll('rect');

    // 處理 circle 元素
    if (circles.length > 0) {
      circles.forEach(circle => {
        if (isVisited || isFavorite) {
          circle.classList.remove('cls-29');
        } else {
          circle.classList.add('cls-29');
        }
        circle.setAttribute('fill', color);
      });
    }

    // 處理 rect 元素（轉乘站可能使用 rect 而不是 circle）
    if (rects.length > 0) {
      rects.forEach(rect => {
        if (isVisited || isFavorite) {
          rect.classList.remove('cls-29');
        } else {
          rect.classList.add('cls-29');
        }
        rect.setAttribute('fill', color);
      });
    }

    // 若沒有 circle 和 rect，退回以節點著色（保險）
    if (circles.length === 0 && rects.length === 0) {
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
