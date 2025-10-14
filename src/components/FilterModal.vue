<template>
  <div class="filter-modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-[60]" @click.self="closeModal">
    <div class="filter-modal bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
      <!-- 頂部拖曳指示器 -->
      <div class="flex justify-center mb-4 pt-4">
        <div class="w-12 h-1 bg-slate-300 rounded-full"></div>
      </div>
      <h2 class="text-2xl font-bold text-slate-900 mb-6 px-6">進階條件篩選</h2>

      <!-- 預算（$ / $$ / $$$ / $$$$） -->
      <div class="mb-6 px-6">
        <label class="block text-slate-700 font-semibold mb-3">預算</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="n in 4"
            :key="n"
            type="button"
            @click="selectedPriceLevel = (selectedPriceLevel === n ? 0 : n)"
            :class="[
              'px-4 py-2 rounded-full font-semibold transition-all shadow-sm',
              selectedPriceLevel === n
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            ]"
          >{{ '$'.repeat(n) }}</button>
        </div>
      </div>

      <!-- 距離 -->
      <div class="mb-6 px-6">
        <label class="block text-slate-700 font-semibold mb-3">範圍</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="d in distanceOptions"
            :key="d.value"
            type="button"
            @click="localFilters.distance = (localFilters.distance === d.value ? Infinity : d.value)"
            :class="[
              'px-4 py-2 rounded-full font-semibold transition-all shadow-sm',
              localFilters.distance === d.value
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            ]"
          >{{ d.label }}</button>
        </div>
      </div>

      <!-- Google 星等 -->
      <div class="mb-6 px-6">
        <label class="block text-slate-700 font-semibold mb-3">Google 星星數</label>
        <div class="flex items-center gap-2">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            @click="setRating(n)"
            :aria-label="`至少 ${n} 星`"
            class="text-2xl"
          >
            <span :class="n <= localFilters.rating ? 'text-yellow-400' : 'text-slate-300'">★</span>
          </button>
          <button
            type="button"
            class="ml-2 text-xs text-slate-600 underline"
            @click="clearRating"
          >不限</button>
        </div>
      </div>

      <!-- 餐廳類型 -->
      <div class="mb-6 px-6">
        <label class="block text-slate-700 font-semibold mb-3">餐廳類型</label>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            @click="toggleCategory(cat.value)"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all shadow-sm',
              selectedCategories.includes(cat.value)
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-md scale-105'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 特殊篩選 -->
      <div class="mb-8 px-6">
        <label class="block text-slate-700 font-semibold mb-3">特殊篩選</label>
        <div class="flex gap-3">
          <button
            @click="localFilters.fromFavorites = !localFilters.fromFavorites"
            :class="[
              'flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center',
              localFilters.fromFavorites
                ? 'bg-pink-100 text-pink-600 border-2 border-pink-500 shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            ]"
          >
          <font-awesome-icon icon="fa-solid fa-heart" />  
          <span>從收藏中選擇</span>
          </button>
          <button
            @click="localFilters.fromVisited = !localFilters.fromVisited"
            :class="[
              'flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm',
              localFilters.fromVisited
                ? 'bg-green-100 text-green-600 border-2 border-green-500 shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            ]"
          >
          <font-awesome-icon icon="fa-solid fa-check" />
            <span>從已吃過中選擇</span>
          </button>
        </div>
      </div>

      <!-- 空間留白避免被底部遮擋 -->
      <div class="h-6"></div>
      <!-- 按鈕（置底 sticky） -->
      <div class="sticky bottom-0 left-0 right-0 bg-white px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 shadow-[0_-6px_12px_rgba(0,0,0,0.06)]">
        <div class="flex gap-3">
          <button
            @click="cancelAndClear"
            class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all border border-slate-200"
          >
            取消
          </button>
          <button
            @click="applyFilters"
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FilterOptions } from '@/types';

/**
 * Props 定義
 */
interface Props {
  filters: FilterOptions;
}

const props = defineProps<Props>();

/**
 * Emits 定義
 */
const emit = defineEmits<{
  close: [];
  apply: [filters: FilterOptions];
}>();

/**
 * 本地篩選條件（用於暫存）
 */
const localFilters = ref<FilterOptions>({ ...props.filters });

// 預算（$ 等級）
const selectedPriceLevel = ref<number>(0);

// 同步初始：從金額區間推斷目前等級（若為 Infinity 或 0，視為不限）
const inferLevelFromBudget = (min: number, max: number): number => {
  if (min <= 0 && !Number.isFinite(max)) return 0;
  // 以近似上限對應：1→≤200、2→≤400、3→≤700、4→≤1000
  const upper = Number.isFinite(max) ? (max as number) : Infinity;
  if (upper <= 200) return 1;
  if (upper <= 400) return 2;
  if (upper <= 700) return 3;
  if (upper <= 1000 || upper === Infinity) return 4;
  return 4;
};
selectedPriceLevel.value = inferLevelFromBudget(localFilters.value.budgetMin, localFilters.value.budgetMax);

watch(selectedPriceLevel, (lvl) => {
  if (lvl === 0) {
    localFilters.value.budgetMin = 0;
    localFilters.value.budgetMax = Infinity;
    return;
  }
  // 設定為 [0, 對應上限]
  const levelToMax = (n: number): number => {
    switch (n) {
      case 1: return 200;
      case 2: return 400;
      case 3: return 700;
      case 4: return 1000;
      default: return Infinity;
    }
  };
  localFilters.value.budgetMin = 0;
  localFilters.value.budgetMax = levelToMax(lvl);
});

/**
 * 距離選項
 */
// 距離按鈕選項
const distanceOptions = [
  { value: 500, label: '500 公尺內' },
  { value: 1000, label: '1 公里內' },
  { value: 2000, label: '2 公里內' },
  { value: 5000, label: '5 公里內' },
];

/**
* 餐廳類型（依圖片）+ 別名映射至資料 types
*/
const categoryOptions = [
  { value: 'japanese', label: '日式' },
  { value: 'hot_pot', label: '火鍋' },
  { value: 'healthy', label: '健康餐' },
  { value: 'vegetarian', label: '素食' },
  { value: 'vietnamese', label: '越式' },
  { value: 'steak', label: '牛排' },
  { value: 'chinese', label: '中式' },
  { value: 'beverage', label: '飲料' },
  { value: 'breakfast', label: '早餐' },
  { value: 'taiwanese', label: '台式' },
  { value: 'noodles', label: '麵食' },
  { value: 'bento', label: '便當' },
  { value: 'ramen', label: '拉麵' },
  { value: 'italian', label: '義式' },
  { value: 'dessert', label: '甜點' },
  { value: 'bar', label: '酒吧' },
  { value: 'cafe', label: '咖啡廳' },
  { value: 'fast_food', label: '速食' },
  { value: 'american', label: '美式' },
  { value: 'korean', label: '韓式' },
  { value: 'thai', label: '泰式' },
];

// 別名映射：類別 -> 餐廳資料的 types 陣列
const typeAliases: Record<string, string[]> = {
  japanese: ['japanese'],
  hot_pot: ['hot_pot'],
  healthy: ['healthy'],
  vegetarian: ['vegetarian'],
  vietnamese: ['vietnamese'],
  steak: ['steak'],
  chinese: ['chinese', 'dim_sum'],
  beverage: ['cafe', 'coffee', 'tea', 'drink'],
  breakfast: ['breakfast'],
  congee: ['congee'],
  taiwanese: ['taiwanese'],
  noodles: ['noodles'],
  bento: ['bento'],
  ramen: ['ramen'],
  fried_rice: ['fried_rice'],
};

// 當前被選中的類別（以圖片類型為單位）
const selectedCategories = ref<string[]>([]);

// 以現有的 filters.types 值，推回 selectedCategories（若吻合別名則對應回來源類別）
const aliasToCategoryEntries = Object.entries(typeAliases).flatMap(([cat, aliases]) => aliases.map(a => [a, cat] as const));
const aliasToCategory = new Map<string, string>(aliasToCategoryEntries);

const initializeSelectedCategories = () => {
  const cats = new Set<string>();
  for (const t of localFilters.value.types) {
    const cat = aliasToCategory.get(t) || t;
    cats.add(cat);
  }
  selectedCategories.value = Array.from(cats);
};
initializeSelectedCategories();

const rebuildFilterTypesFromCategories = () => {
  const set = new Set<string>();
  for (const cat of selectedCategories.value) {
    const aliases = typeAliases[cat] || [cat];
    for (const a of aliases) set.add(a);
  }
  localFilters.value.types = Array.from(set);
};

const toggleCategory = (cat: string) => {
  const idx = selectedCategories.value.indexOf(cat);
  if (idx > -1) {
    selectedCategories.value.splice(idx, 1);
  } else {
    selectedCategories.value.push(cat);
  }
  rebuildFilterTypesFromCategories();
};

/**
 * 計算屬性：預算顯示
 */
// 預算按鈕已直接以選中狀態呈現，不需要額外顯示字串

/**
 * 計算屬性：星等顯示
 */
const setRating = (n: number) => {
  localFilters.value.rating = n;
};

const clearRating = () => {
  localFilters.value.rating = 0;
};

// 既有函式不再使用，改以 toggleCategory 操作 selectedCategories 並回寫到 filters.types

/**
 * 關閉彈窗
 */
const closeModal = () => {
  emit('close');
};

/**
 * 套用篩選條件
 */
const applyFilters = () => {
  emit('apply', { ...localFilters.value });
  emit('close');
};

/**
 * 取消並清空條件
 */
const cancelAndClear = () => {
  // 清空本地條件
  localFilters.value.budgetMin = 0;
  localFilters.value.budgetMax = Infinity;
  localFilters.value.distance = Infinity as unknown as number;
  localFilters.value.types = [];
  localFilters.value.rating = 0;
  localFilters.value.fromFavorites = false;
  localFilters.value.fromVisited = false;

  // UI 狀態也重置
  selectedPriceLevel.value = 0;
  selectedCategories.value = [];

  // 套用清空（讓外層也同步清空）並關閉
  emit('apply', { ...localFilters.value });
  emit('close');
};
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* 自訂 range input 樣式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #2563EB;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
}

input[type="range"]::-moz-range-thumb:hover {
  background: #2563EB;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}
</style>
