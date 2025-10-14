# 🎲 台北捷運隨機美食小工具

一個幫助上班族解決「每天不知道要吃什麼」困擾的手機版 Web App，以台北捷運站為核心，結合遊戲化收藏機制。

## 🚀 技術棧

- **Vue 3** - 使用 Composition API
- **TypeScript** - 類型安全
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Pinia** - 狀態管理
- **Vite** - 快速的建構工具

## 📦 專案結構

```
src/
├── components/          # 可複用元件
│   ├── RestaurantCard.vue    # 餐廳卡片元件
│   └── FilterModal.vue       # 篩選條件彈窗
├── views/              # 頁面元件
│   └── Home.vue        # 首頁（隨機推薦頁）
├── stores/             # Pinia 狀態管理
│   ├── restaurant.ts   # 餐廳資料 store
│   └── user.ts         # 使用者動作 store
├── types/              # TypeScript 型別定義
│   └── index.ts
├── App.vue             # 根元件
├── main.ts             # 應用程式入口
└── style.css           # 全域樣式

public/
└── data/               # 假資料（未來替換為 API）
    ├── restaurants.json  # 餐廳資料
    └── stations.json     # 捷運站資料
```

## 🎯 目前功能（v1.0 MVP）

### ✅ 已完成
- [x] 捷運站選擇（線別 + 站點）
- [x] 餐廳隨機推薦
- [x] 進階條件篩選
  - [x] 預算篩選
  - [x] 距離篩選
  - [x] 餐廳類型篩選
  - [x] Google 星等篩選
- [x] 餐廳卡片展示（評分、價位、距離、地址）
- [x] 使用者動作
  - [x] 收藏餐廳
  - [x] 標記已吃過
  - [x] 標記不喜歡
- [x] LocalStorage 資料持久化

### 🚧 待開發
- [ ] Google 地圖頁
- [ ] 大富翁地圖頁
- [ ] 收藏頁
- [ ] 設定頁
- [ ] 成就系統
- [ ] 串接 Google Places API

## 🛠️ 開發指令

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

## 🎨 設計規範

- **主色調**：`#CE0000`（紅色 logo 標題）
- **背景色**：`#F0F8FF`（淺藍色）
- **視覺風格**：清爽、Q 版、輕遊戲感
- **響應式**：手機版優先

## 📝 程式碼風格

- 使用 **Vue 3 Composition API**
- 使用 **函式表示式**
- **PascalCase** 用於元件命名
- **camelCase** 用於變數命名
- 每個函式和變數都有完整註解
- 使用 Tailwind CSS，避免自訂 CSS

## 🗃️ 資料結構

### 餐廳資料（Restaurant）
```typescript
{
  place_id: string;           // 唯一識別碼
  name: string;               // 餐廳名稱
  rating: number;             // Google 評分 (0-5)
  user_ratings_total: number; // 總評論數
  price_level: number;        // 價位等級 (0-4)
  types: string[];            // 餐廳類型
  vicinity: string;           // 地址
  distance_m: number;         // 與站點距離（公尺）
  station: {                  // 所屬捷運站
    name: string;
    line: string;
  };
}
```

### 捷運站資料（Station）
```typescript
{
  id: string;        // 站點 ID
  name: string;      // 站點名稱
  line: string;      // 所屬線別
  location: {        // 經緯度
    lat: number;
    lng: number;
  };
}
```

## 📱 使用流程

1. **選擇捷運線** - 從紅線、藍線、綠線中選擇
2. **選擇站點** - 水平滑動選擇捷運站
3. **（選用）設定篩選條件** - 點擊「進階條件篩選」設定預算、距離、類型等
4. **隨機推薦** - 點擊「🎲 隨機推薦」按鈕
5. **互動** - 對推薦的餐廳進行收藏、已吃過或不喜歡的操作

## 📄 授權

MIT License

## 👥 貢獻者

- 開發者：Your Name
