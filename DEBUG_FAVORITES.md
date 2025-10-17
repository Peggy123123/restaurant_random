# Debug Favorites Issue

## 問題
在 Map.vue 點擊收藏或已吃過按鈕後，Favorites.vue 列表沒有顯示餐廳。

## 已實作的修正

### 1. 自動計算最近捷運站
- `src/stores/restaurant.ts` 新增 `loadStations()` 載入所有捷運站資料
- `src/stores/restaurant.ts` 新增 `findNearestStation()` 計算最近站點
- `src/stores/restaurant.ts` 修正 `upsertRestaurant()` 正規化邏輯，檢查空字串站點名稱

### 2. localStorage 持久化
- 當點擊收藏/已吃過時，`RestaurantCard.vue` 呼叫 `restaurantStore.upsertRestaurant()`
- `upsertRestaurant()` 將餐廳物件正規化後存入 `localStorage` (key: `restaurants_cache`)
- `main.ts` 啟動時呼叫 `restaurantStore.initFromStorage()` 載入快取

### 3. 除錯日誌
已加入 console.log 追蹤：
- 捷運站載入數量
- upsert 時的餐廳名稱與站點
- localStorage 寫入/讀取狀態

## 測試步驟

### 測試 1: 收藏功能
1. 開啟瀏覽器開發者工具的 Console
2. 重新整理頁面，應該看到：
   ```
   [Restaurant Store] 從 localStorage 載入 X 筆餐廳
   [Restaurant Store] 已載入 Y 個捷運站
   ```
3. 進入 Map 頁面
4. 點擊任一餐廳卡片的「收藏」按鈕（紅色愛心）
5. Console 應該顯示：
   ```
   [Restaurant Store] upsert餐廳: [餐廳名稱] 站點: { name: '[站名]', line: '[線別]' }
   [Restaurant Store] 已存入 localStorage，共 X 筆餐廳
   ```
6. 進入「收藏」分頁（底部導航）
7. 應該看到剛才收藏的餐廳卡片

### 測試 2: 已吃過功能
1. 在 Map 頁面點擊任一餐廳卡片的「吃過」按鈕（綠色打勾）
2. 進入「收藏」分頁，切換到「已吃過」標籤
3. 應該看到剛才標記的餐廳卡片

### 測試 3: 重新整理後持久化
1. 收藏或標記幾間餐廳
2. 按 F5 重新整理頁面
3. Console 應該顯示載入了之前的餐廳數量
4. 進入「收藏」分頁，應該仍看到之前的餐廳

## 常見問題排查

### 如果 Favorites 列表仍是空的

**檢查 localStorage:**
```javascript
// 在瀏覽器 Console 執行
localStorage.getItem('favorites')          // 應該看到 ID 陣列
localStorage.getItem('restaurants_cache')  // 應該看到餐廳物件陣列
```

**檢查捷運站是否載入:**
```javascript
// 如果看到 0 個站點，代表 stations.json 載入失敗
```

**檢查 API Key:**
- 確認環境變數 `VITE_GOOGLE_MAPS_API_KEY` 已設定
- Map.vue 需要 Google Maps API 才能顯示餐廳

### 如果站點顯示為空

- 檢查 Console 是否有「已載入 X 個捷運站」訊息
- 如果是 0，檢查 `public/data/stations.json` 是否存在
- 確認 `main.ts` 有呼叫 `restaurantStore.loadStations()`

## 下一步

如果問題仍存在，請提供：
1. Console 的完整輸出
2. localStorage 的 `favorites` 和 `restaurants_cache` 內容
3. 是否有任何錯誤訊息

