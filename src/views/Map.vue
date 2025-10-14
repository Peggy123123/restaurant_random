<template>
  <div class="map-page min-h-screen bg-slate-50 pt-10">
    <div class="max-w-lg mx-auto">
      <!-- Google 地圖區域 -->
      <div class="h-[35vh] bg-slate-200 relative rounded-2xl overflow-hidden">
        <div ref="mapEl" class="absolute inset-0"></div>
        <div v-if="!apiKey" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <p class="text-4xl mb-2">🔑</p>
            <p class="text-slate-500 font-medium">缺少 Google Maps API 金鑰</p>
            <p class="text-slate-400 text-sm">請於環境變數設置 VITE_GOOGLE_MAPS_API_KEY</p>
          </div>
        </div>
      </div>

      <!-- 餐廳清單 -->
      <div class="px-4 py-6">
        <div class="w-full flex justify-center mb-3">
          <button
            class="text-center w-full text-sm font-bold transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              hasLocation 
                ? 'text-green-600 bg-green-100 border border-green-300 cursor-default' 
                : 'text-orange-theme-500'
            ]"
            @click="handleLocateClick"
            :disabled="locating || loading || hasLocation"
          >
            <font-awesome-icon 
              :icon="locating ? 'fa-solid fa-spinner fa-spin' : hasLocation ? 'fa-solid fa-check-circle' : 'fa-solid fa-location-dot'" 
            />
            <span class="text-sm">{{ locating ? '定位中...' : hasLocation ? '已移動到你的所在位置' : '取得當前位置' }}</span>
          </button>
        </div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900">附近餐廳</h2>
          <span class="text-sm text-slate-500">共 {{ totalCount }} 間</span>
        </div>

        <div v-if="loading" class="text-center py-12 bg-white rounded-2xl shadow-md">
          <p class="text-slate-400">載入中…</p>
        </div>
        <div v-else-if="restaurants.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-md">
          <p class="text-slate-400">地圖範圍內沒有找到餐廳</p>
        </div>
        <div v-else class="space-y-4">
          <RestaurantCard
            v-for="r in restaurants"
            :key="r.place_id"
            :restaurant="r"
            @dislike="handleCardDislike(r.place_id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import RestaurantCard from '@/components/RestaurantCard.vue';
import type { Restaurant } from '@/types';

// DOM 參考與狀態
const mapEl = ref<HTMLDivElement | null>(null);
const map = ref<any | null>(null);
const placesService = ref<any | null>(null);
const restaurants = ref<Restaurant[]>([]);
const totalCount = ref(0);
const loading = ref(false);
const locating = ref(false);
const hasLocation = ref(false);
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// 動態載入 Google Maps JS API
function loadGoogleMaps(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-gmaps-loader="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps 載入失敗')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmaps-loader', '1');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps 載入失敗'));
    document.head.appendChild(script);
  });
}

// 計算距離（公尺）
function haversineDistanceMeters(a: any, b: any): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371000; // 地球半徑（公尺）
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 將 Places 結果轉為內部 Restaurant 型別
function mapPlaceToRestaurant(place: any, center: any): Restaurant | null {
  const loc = place.geometry?.location;
  const lat = typeof loc?.lat === 'function' ? loc.lat() : (loc as any)?.lat;
  const lng = typeof loc?.lng === 'function' ? loc.lng() : (loc as any)?.lng;
  if (lat == null || lng == null || !place.place_id || !place.name) return null;

  const distance = Math.round(haversineDistanceMeters(center, { lat, lng }));

  // 取得第一張可用圖片 URL（若有）
  let photoUrl: string | undefined;
  if (place.photos && place.photos.length > 0) {
    try {
      photoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
    } catch (_) {
      // ignore
    }
  }

  const r: Restaurant = {
    place_id: place.place_id,
    name: place.name,
    rating: (place.rating as number) ?? 0,
    user_ratings_total: (place.user_ratings_total as number) ?? 0,
    price_level: (place.price_level as number) ?? 1,
    description: undefined,
    website: (place.website as string) ?? undefined,
    average_price: undefined,
    types: (place.types as string[]) ?? [],
    vicinity: (place.vicinity as string) ?? (place.formatted_address as string) ?? '',
    geometry: { location: { lat, lng } },
    distance_m: distance,
    station: { name: '', line: '' },
    // 注意：專案型別定義為 RestaurantPhoto[]，但卡片實際以 URL 使用第一張。
    // 這裡以 any 斷言，存放字串 URL 陣列以供 UI 使用。
    photos: ([photoUrl].filter(Boolean) as string[]) as any,
  };
  return r;
}

function searchNearbyRestaurants() {
  if (!map.value || !placesService.value) return;
  loading.value = true;
  const center = map.value.getCenter();
  const centerLatLng = { lat: center!.lat(), lng: center!.lng() };
  const request: any = {
    location: centerLatLng,
    radius: 1200,
    type: 'restaurant',
    openNow: false,
    rankBy: google.maps.places.RankBy.PROMINENCE,
  } as any;

  const collected: Restaurant[] = [];

  const handlePage = (results: any[], status: any, pagination: any) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      finalize();
      return;
    }

    for (const p of results) {
      const r = mapPlaceToRestaurant(p, centerLatLng);
      if (r) collected.push(r);
    }

    if (pagination && pagination.hasNextPage) {
      // 官方建議需等待短暫時間再取下一頁
      setTimeout(() => pagination.nextPage(), 1000);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    // 去重、排序
    const uniqById = new Map<string, Restaurant>();
    for (const r of collected) {
      if (!uniqById.has(r.place_id)) uniqById.set(r.place_id, r);
    }
    const arr = Array.from(uniqById.values()).sort((a, b) => a.distance_m - b.distance_m);
    totalCount.value = arr.length;
    restaurants.value = arr.slice(0, 10);
    loading.value = false;
  };

  placesService.value.nearbySearch(request, handlePage);
}

function initMap() {
  if (!mapEl.value) return;
  // 台北車站附近作為預設
  const initialCenter = { lat: 25.0478, lng: 121.5170 };
  map.value = new google.maps.Map(mapEl.value, {
    center: initialCenter,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
  placesService.value = new google.maps.places.PlacesService(map.value);

  // 初次載入與地圖停止移動後觸發搜尋
  google.maps.event.addListenerOnce(map.value, 'idle', () => searchNearbyRestaurants());
  map.value.addListener('idle', () => searchNearbyRestaurants());
}

function handleCardDislike(_id: string) {
  // 當卡片觸發 dislike，可選擇從列表移除或保留，這裡暫不自動移除，交由全域邏輯處理
}

function handleLocateClick() {
  if (locating.value || !map.value) return;
  if (!navigator.geolocation) {
    alert('您的瀏覽器不支援定位功能');
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      map.value!.panTo({ lat, lng });
      map.value!.setZoom(16);
      locating.value = false;
      hasLocation.value = true;
    },
    (err) => {
      console.error('定位失敗:', err);
      locating.value = false;
      alert('定位失敗，請稍後再試或檢查權限');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

onMounted(async () => {
  if (!apiKey) return;
  try {
    await loadGoogleMaps(apiKey);
    initMap();
  } catch (err) {
    console.error(err);
  }
});
</script>
