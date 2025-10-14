# 🎨 UI 設計風格指南

## 設計參考來源
- **Saturn Calendar App**：深色主題、圓潤卡片、清晰層次
- **Waymo App**：地圖整合、資訊卡片、動作按鈕設計

---

## 📐 核心設計原則

### 1. 圓角設計（Border Radius）
```css
/* Tailwind Classes */
- 小元件（按鈕、標籤）：rounded-lg (8px)
- 中型卡片（餐廳卡片）：rounded-xl (12px)
- 大型容器（彈窗、底部表單）：rounded-2xl (16px)
- 全圓角（頭像、圖示）：rounded-full
```

### 2. 留白與間距（Spacing）
```css
/* 元件內部 Padding */
- 按鈕內距：px-6 py-3 (24px, 12px)
- 卡片內距：p-4 或 p-6 (16px 或 24px)
- 頁面邊距：px-4 或 px-6 (16px 或 24px)

/* 元件間距 Margin/Gap */
- 小間距：gap-2 或 space-y-2 (8px)
- 中間距：gap-4 或 space-y-4 (16px)
- 大間距：gap-6 或 space-y-6 (24px)
- 區塊間距：gap-8 或 space-y-8 (32px)
```

### 3. 手機版優先（Mobile First）
```css
/* 視窗寬度 */
- 最大寬度：max-w-md (448px) 或 max-w-lg (512px)
- 置中對齊：mx-auto
- 全螢幕高度：min-h-screen
```

---

## 🎨 色彩系統

### 主色調
```css
/* 背景色 */
--bg-primary: #F5F7FA (淺藍灰)
--bg-secondary: #FFFFFF (白色)
--bg-dark: #1E293B (深色主題用)

/* 主品牌色 */
--brand-red: #CE0000 (Logo 標題用)
--brand-blue: #3B82F6 (主要按鈕)
--brand-purple: #8B5CF6 (次要強調)

/* 功能色 */
--success: #10B981 (已吃過、成功)
--warning: #F59E0B (提示、警告)
--danger: #EF4444 (沒興趣、刪除)
--favorite: #EC4899 (收藏愛心)

/* 文字色 */
--text-primary: #1E293B (主要文字)
--text-secondary: #64748B (次要文字)
--text-tertiary: #94A3B8 (提示文字)
--text-white: #FFFFFF (白色文字)
```

### Tailwind 對應
```css
bg-slate-50      /* 背景色 */
bg-white         /* 卡片背景 */
bg-slate-800     /* 深色背景 */

text-slate-900   /* 主文字 */
text-slate-600   /* 次要文字 */
text-slate-400   /* 提示文字 */

bg-blue-500      /* 主按鈕 */
bg-red-600       /* Logo/強調色 */
bg-purple-500    /* 漸層用 */
```

---

## 🧱 元件設計規範

### 1. 按鈕（Buttons）

#### 主要按鈕（Primary Button）
```html
<button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 active:scale-95">
  🎲 隨機推薦
</button>
```

#### 次要按鈕（Secondary Button）
```html
<button class="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
  重新隨機推薦
</button>
```

#### 圖示按鈕（Icon Button）
```html
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all">
  ❤️
</button>
```

### 2. 餐廳卡片（Restaurant Card）

```html
<div class="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all space-y-3">
  <!-- 頂部：名稱 + 操作按鈕 -->
  <div class="flex items-start justify-between">
    <h3 class="text-lg font-bold text-slate-900">一蘭拉麵 信義店</h3>
    <div class="flex gap-2">
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-pink-50 text-pink-500">
        ❤️
      </button>
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-500">
        ✅
      </button>
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500">
        🚫
      </button>
    </div>
  </div>
  
  <!-- 中間：評分 + 價位 + 距離 -->
  <div class="flex items-center gap-4 text-sm">
    <span class="flex items-center gap-1 text-amber-500">
      ⭐ 4.3
    </span>
    <span class="text-slate-600">$$</span>
    <span class="text-slate-500">280m</span>
  </div>
  
  <!-- 底部：類型標籤 -->
  <div class="flex gap-2">
    <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
      日式料理
    </span>
  </div>
</div>
```

### 3. 彈窗（Modal）

```html
<div class="fixed inset-0 bg-black/50 flex items-end justify-center p-0 z-50">
  <div class="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-6 animate-slide-up">
    <!-- 頂部：標題 + 關閉 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900">進階條件篩選</h2>
      <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
        ✕
      </button>
    </div>
    
    <!-- 內容區 -->
    <div class="space-y-4">
      <!-- 篩選項目 -->
    </div>
    
    <!-- 底部按鈕 -->
    <div class="flex gap-3">
      <button class="flex-1 py-3 rounded-xl border border-slate-200 font-medium text-slate-700">
        取消
      </button>
      <button class="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold">
        確定
      </button>
    </div>
  </div>
</div>
```

### 4. 底部導航（Bottom Navigation）

```html
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom">
  <div class="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
    <button class="flex flex-col items-center gap-1 py-2 px-4">
      <div class="w-6 h-6 flex items-center justify-center">🎲</div>
      <span class="text-xs font-medium text-blue-500">推薦</span>
    </button>
    <button class="flex flex-col items-center gap-1 py-2 px-4">
      <div class="w-6 h-6 flex items-center justify-center">🗺️</div>
      <span class="text-xs text-slate-500">地圖</span>
    </button>
    <button class="flex flex-col items-center gap-1 py-2 px-4">
      <div class="w-6 h-6 flex items-center justify-center">🎮</div>
      <span class="text-xs text-slate-500">大富翁</span>
    </button>
    <button class="flex flex-col items-center gap-1 py-2 px-4">
      <div class="w-6 h-6 flex items-center justify-center">❤️</div>
      <span class="text-xs text-slate-500">收藏</span>
    </button>
  </div>
</nav>
```

---

## 🎭 動畫效果

### 過場動畫
```css
/* Tailwind Config 擴充 */
animation: {
  'slide-up': 'slideUp 0.3s ease-out',
  'fade-in': 'fadeIn 0.2s ease-in',
  'bounce-light': 'bounceLightweight 0.5s ease-in-out',
}

keyframes: {
  slideUp: {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' },
  },
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  bounceLightweight: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}
```

### 互動回饋
```css
/* 按鈕點擊 */
active:scale-95 transition-transform duration-100

/* 懸停效果 */
hover:shadow-lg transition-shadow duration-200

/* 卡片出現 */
animate-fade-in
```

---

## 🖼️ 圖示風格

### 使用來源
- **Font Awesome**（主要）
- **Google Material Icons**
- **Bootstrap Icons**

### 特性
- 線性風格（Line Style）
- 圓潤設計
- 統一尺寸：`w-6 h-6` (24px) 或 `w-5 h-5` (20px)

---

## 📱 響應式設計

### 斷點
```css
/* 手機版優先 */
Default: 375px - 428px

/* 平板預留 */
md: 768px+
lg: 1024px+
```

### 安全區域
```css
/* iOS 安全區域 */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

/* Tailwind 擴充 */
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 🌈 漸層效果

### 背景漸層
```css
/* 頂部裝飾漸層 */
bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500

/* 卡片懸停漸層 */
bg-gradient-to-r from-blue-50 to-purple-50

/* 按鈕漸層 */
bg-gradient-to-r from-blue-500 to-blue-600
```

---

## ✅ 實作檢查清單

- [ ] 所有按鈕使用 `rounded-xl` 或 `rounded-lg`
- [ ] 卡片間距至少 `gap-4` (16px)
- [ ] 頁面邊距使用 `px-4` 或 `px-6`
- [ ] 文字階層清晰（主標題、副標題、內文）
- [ ] 互動元素有懸停/點擊效果
- [ ] 彈窗使用 `rounded-t-3xl` 從底部滑出
- [ ] 底部導航固定並留安全區域
- [ ] 使用 emoji 或 icon 增加親和力
- [ ] 保持適當留白，避免擁擠

---

## 🎯 關鍵視覺特色總結

1. **圓潤友善**：大量使用圓角設計
2. **清爽透氣**：充足留白與間距
3. **層次分明**：使用陰影與邊框區分元件
4. **色彩活潑**：漸層背景 + 品牌色強調
5. **輕量遊戲感**：emoji、動畫、Q 版風格
6. **手機優先**：針對單手操作優化
