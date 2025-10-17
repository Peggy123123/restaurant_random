import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'
import "./assets/css/style.css";
import { useUserStore } from '@/stores/user'
import { useRestaurantStore } from '@/stores/restaurant'


// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

// 添加所有圖示到庫
library.add(fas, far)

const app = createApp(App)
const pinia = createPinia()

// 註冊 Font Awesome 元件
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(i18n)

// 初始化本地儲存資料與站點資料
const userStore = useUserStore()
const restaurantStore = useRestaurantStore()

// 先載入捷運站資料（同步），再載入使用者資料和餐廳快取
;(async () => {
  await restaurantStore.loadStations()
  userStore.initFromStorage()
  restaurantStore.initFromStorage()
})()

app.mount('#app')
