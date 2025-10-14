import { createI18n } from 'vue-i18n'

/**
 * 多語言設定
 */
const messages = {
  'zh-TW': {
    button: {
      no_auth: '無權限',
    },
  },
  en: {
    button: {
      no_auth: 'No Authorization',
    },
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages,
})

export default i18n
