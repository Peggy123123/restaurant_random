import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'
import "./assets/css/style.css";


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
app.mount('#app')
