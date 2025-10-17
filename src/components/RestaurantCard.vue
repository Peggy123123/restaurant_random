<template>
  <div class="mb-4 rounded-xl bg-white p-4 shadow-cute transition-transform">
    <!-- 上方大圖 -->
  <div class="relative mb-4 rounded-2xl">
      <div
        class="h-40 w-full overflow-hidden rounded-2xl bg-cover bg-center"
        :style="{ backgroundImage: `url(${restaurant.photos?.[0] || ''})` }"
      ></div>

      <!-- 右上浮動三鍵 -->
      <div class="absolute right-2 top-2 flex gap-2">
        <button
          v-if="showAction('favorite')"
          @click="onClickWithShake('favorite')"
          :class="[
            'relative flex h-14 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-red-50 text-red-500 text-lg transition-transform',
            isShakingFavorite ? 'animate-shake-top' : ''
          ]"
          aria-label="已收藏"
        >
          <font-awesome-icon :icon="isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
          <span class="text-[10px] leading-none">{{ isFavorited ? '已收藏' : '收藏' }}</span>
          <div
            v-if="showFavoriteTip"
            class="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 shadow border border-red-200"
          >
            {{ favoriteTipText }}
          </div>
        </button>
        <button
          v-if="showAction('visited')"
          @click="onClickWithShake('visited')"
          :class="[
            'relative flex h-14 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-green-50 text-green-600 text-lg transition-transform',
            isShakingVisited ? 'animate-shake-top' : ''
          ]"
          aria-label="已吃過"
        >
          <font-awesome-icon icon="fa-solid fa-check" />
          <span class="text-[10px] leading-none">{{ isVisitedStatus ? '已吃過' : '吃過' }}</span>
          <div
            v-if="showVisitedTip"
            class="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 shadow border border-green-200"
          >
            {{ visitedTipText }}
          </div>
        </button>
        <button
          v-if="showAction('dislike')"
          @click="onClickWithShake('dislike')"
          :class="[
            'relative flex h-14 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-gray-theme-100 text-gray-theme-500 text-lg transition-transform',
            isShakingDislike ? 'animate-shake-top' : ''
          ]"
          aria-label="沒興趣"
        >
          <font-awesome-icon icon="fa-solid fa-ban" />
          <span class="text-[10px] leading-none">沒興趣</span>
          <div
            v-if="showDislikeTip"
            class="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-gray-theme-100 px-2 py-1 text-xs text-gray-theme-600 shadow border border-gray-theme-200"
          >
            已加入沒興趣
          </div>
        </button>
      </div>

      <!-- 左下價位晶片 -->
      <div class="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-orange-500 shadow">
        {{ priceDisplay }}
      </div>
    </div>

    <!-- 資訊區 -->
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-lg font-bold text-gray-theme-700">{{ restaurant.name }}</h3>
      <div class="rounded-xl bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-600 shadow">
        <font-awesome-icon icon="fa-solid fa-star" class="mr-1" />
        {{ restaurant.rating?.toFixed?.(1) ?? restaurant.rating }}
      </div>
    </div>
    <p class="mb-3 text-sm text-gray-theme-500">
      {{ typesDisplay }} · 距離 {{ distanceDisplay }}
    </p>
    <p v-if="restaurant.description" class="mb-3 text-sm text-gray-theme-600">
      {{ restaurant.description }}
    </p>
    <div class="mb-2 flex items-start gap-2 text-sm text-gray-theme-600">
      <font-awesome-icon icon="fa-solid fa-location-dot" class="mt-0.5 text-gray-theme-400" />
      <span>{{ restaurant.vicinity }}</span>
    </div>

    <!-- 底部行動按鈕 -->
    <div class="mt-4 flex items-center gap-4">
      <a :href="reviewsLink" target="_blank" rel="noopener" class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-3 text-blue-700 shadow hover:bg-blue-100">
        <font-awesome-icon icon="fa-regular fa-comments" />
        <span class="text-sm font-medium">查看評論</span>
      </a>
      <a :href="directionsLink" target="_blank" rel="noopener" class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-50 px-3 py-3 text-green-700 shadow hover:bg-green-100">
        <font-awesome-icon icon="fa-solid fa-location-arrow" />
        <span class="text-sm font-medium">導航</span>
      </a>
      <a :href="websiteLink" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 rounded-2xl bg-gray-theme-100 px-4 py-3 text-gray-theme-600 shadow hover:bg-gray-theme-200">
        <font-awesome-icon icon="fa-solid fa-up-right-from-square" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRestaurantStore } from '@/stores/restaurant';
import type { Restaurant } from '@/types';

/**
 * Props 定義
 */
interface Props {
  restaurant: Restaurant;
  actions?: Array<'favorite' | 'visited' | 'dislike'>;
}

const props = defineProps<Props>();

/**
 * Emits 定義
 */
const emit = defineEmits<{
  dislike: [];
}>();

const userStore = useUserStore();
const restaurantStore = useRestaurantStore();

/**
 * Tooltip 顯示狀態
 */
const showFavoriteTip = ref(false);
const showVisitedTip = ref(false);
const showDislikeTip = ref(false);

/** Tooltip 文字內容 **/
const favoriteTipText = ref('');
const visitedTipText = ref('');

/**
 * 點擊動畫狀態
 */
const isShakingFavorite = ref(false);
const isShakingVisited = ref(false);
const isShakingDislike = ref(false);

let tipTimerFavorite: number | undefined;
let tipTimerVisited: number | undefined;
let tipTimerDislike: number | undefined;

const showTipFor = (key: 'favorite' | 'visited' | 'dislike', action: 'add' | 'remove' = 'add') => {
  const DURATION_MS = 1500;
  if (key === 'favorite') {
    favoriteTipText.value = action === 'add' ? '已加入收藏' : '已取消收藏';
    showFavoriteTip.value = true;
    window.clearTimeout(tipTimerFavorite);
    tipTimerFavorite = window.setTimeout(() => (showFavoriteTip.value = false), DURATION_MS);
  } else if (key === 'visited') {
    visitedTipText.value = action === 'add' ? '已加入吃過' : '已取消吃過';
    showVisitedTip.value = true;
    window.clearTimeout(tipTimerVisited);
    tipTimerVisited = window.setTimeout(() => (showVisitedTip.value = false), DURATION_MS);
  } else {
    // 保持原本文字
    showDislikeTip.value = true;
    window.clearTimeout(tipTimerDislike);
    tipTimerDislike = window.setTimeout(() => (showDislikeTip.value = false), DURATION_MS);
  }
};

/**
 * 計算屬性：是否已收藏
 */
const isFavorited = computed(() => {
  return userStore.isFavorite(props.restaurant.place_id);
});

/**
 * 計算屬性：是否已吃過
 */
const isVisitedStatus = computed(() => {
  return userStore.isVisited(props.restaurant.place_id);
});

/**
 * 計算屬性：價位顯示
 */
const priceDisplay = computed(() => {
  return '$'.repeat(props.restaurant.price_level || 1);
});

/**
 * 計算屬性：距離顯示
 */
const distanceDisplay = computed(() => {
  const meters = props.restaurant.distance_m;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} 公里`;
  }
  return `${meters} 公尺`;
});

/**
 * 計算屬性：料理類型顯示
 */
const typesDisplay = computed(() => {
  const types = props.restaurant.types || [];
  if (!types.length) return '美食';
  return types[1] ? `${types[1]}料理` : (types[0] || '美食');
});

/**
 * 連結：Google Maps 導航與地圖
 */
const mapLink = computed(() => {
  const { lat, lng } = props.restaurant.geometry.location;
  return `https://www.google.com/maps?q=${lat},${lng}`;
});

const directionsLink = computed(() => {
  const { lat, lng } = props.restaurant.geometry.location;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
});

const reviewsLink = computed(() => {
  // 使用 query_place_id 讓連結指向正確店家詳情頁（Google Maps 不提供穩定參數可直接鎖定「評論」分頁）
  const name = encodeURIComponent(props.restaurant.name);
  const addr = encodeURIComponent(props.restaurant.vicinity || '');
  const pid = encodeURIComponent(props.restaurant.place_id);
  return `https://www.google.com/maps/search/?api=1&query=${name}%20${addr}&query_place_id=${pid}&hl=zh-TW&entry=ttu`;
});

const websiteLink = computed(() => {
  return props.restaurant.website || mapLink.value;
});

/**
 * 哪些右上角動作需要顯示（預設三個都顯示）
 */
const resolvedActions = computed(() => {
  return props.actions && props.actions.length > 0
    ? props.actions
    : ['favorite', 'visited', 'dislike'] as Array<'favorite' | 'visited' | 'dislike'>;
});

const showAction = (key: 'favorite' | 'visited' | 'dislike') => {
  return resolvedActions.value.includes(key);
};

/**
 * 處理收藏動作
 */
const handleFavorite = () => {
  const wasFavorited = isFavorited.value;
  // 確保此餐廳物件存在於全域餐廳清單，供收藏頁面解析
  restaurantStore.upsertRestaurant(props.restaurant);
  if (wasFavorited) {
    userStore.removeFavorite(props.restaurant.place_id);
  } else {
    userStore.addFavorite(props.restaurant.place_id);
  }
  showTipFor('favorite', wasFavorited ? 'remove' : 'add');
};

/**
 * 處理已吃過動作
 */
const handleVisited = () => {
  const wasVisited = isVisitedStatus.value;
  // 確保此餐廳物件存在於全域餐廳清單，供收藏/已吃過頁面解析
  restaurantStore.upsertRestaurant(props.restaurant);
  if (wasVisited) {
    userStore.removeVisited(props.restaurant.place_id);
  } else {
    userStore.addVisited(props.restaurant.place_id);
  }
  showTipFor('visited', wasVisited ? 'remove' : 'add');
};

/**
 * 處理不喜歡動作
 */
const handleDislike = () => {
  userStore.addDislike(props.restaurant.place_id);
  emit('dislike');
  showTipFor('dislike', 'add');
};

/**
 * 封裝點擊動作：同時觸發搖動與原本邏輯
 */
const onClickWithShake = (key: 'favorite' | 'visited' | 'dislike') => {
  const ANIMATE_MS = 450;
  if (key === 'favorite') {
    isShakingFavorite.value = false; // restart animation
    void Promise.resolve().then(() => (isShakingFavorite.value = true));
    window.setTimeout(() => (isShakingFavorite.value = false), ANIMATE_MS);
    handleFavorite();
  } else if (key === 'visited') {
    isShakingVisited.value = false;
    void Promise.resolve().then(() => (isShakingVisited.value = true));
    window.setTimeout(() => (isShakingVisited.value = false), ANIMATE_MS);
    handleVisited();
  } else {
    isShakingDislike.value = false;
    void Promise.resolve().then(() => (isShakingDislike.value = true));
    window.setTimeout(() => (isShakingDislike.value = false), ANIMATE_MS);
    handleDislike();
  }
};
</script>

<style scoped>
@keyframes shake-top {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-6deg); }
  40% { transform: rotate(6deg); }
  60% { transform: rotate(-4deg); }
  80% { transform: rotate(4deg); }
}

.animate-shake-top {
  animation: shake-top 0.45s ease-in-out;
  transform-origin: bottom center;
}
</style>
