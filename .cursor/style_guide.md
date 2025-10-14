# 請遵從以下風格及技術範圍完成專案

## 技術架構：
### Vue 3 + TypeScript + Tailwind CSS 技術棧
### Pinia 狀態管理、Vue Router 路由
### Vite 建構工具


## 撰寫風格：
### 程式碼風格規範：
1. 使用 Vue 3 + Composition API
2. 若有狀態管理，用 Pinia
3. 若有 API 呼叫，用 fetch 並集中管理於 /api 資料夾
4. 統一的 API 層設計和錯誤處理機制
5. 每個元件要有明確職責，避免過度耦合。
6. 使用函式表示式

### 樣式：
1. 採用 Tailwind CSS，UI 要乾淨簡約，有留白。
2. 自定義樣式管理系統 (useStyle hook)。
3. 版面為手機版。

### 命名：
1. 元件命名採 PascalCase，例如 RestaurantCard.vue
2. 變數命名採 LcamelCase，例如 restaurantCard

### 註解：
1. 保持可維護性：方法與變數需有註解，命名語意化。


## 性能優化：
### 代碼分割和組件延遲載入策略
### 防重複提交機制
### 關鍵資源優先載入

## 最佳實踐：
類型安全、代碼品質、用戶體驗、可維護性


