import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'

import eleEN from 'element-ui/lib/locale/lang/en'
import eleZh from 'element-ui/lib/locale/lang/zh-CN'

import enLocale from './en'
import zhLocale from './zh'

Vue.use(VueI18n)
Vue.locale = () => {}

const messages = {
  en: {
    ...enLocale,
    ...eleEN
  },
  zh: {
    ...zhLocale,
    ...eleZh
  }
}

const i18n = new VueI18n({
  // set locale
  // options: en or zh
  locale: Cookies.get('imdev-lang') || 'en',
  // set locale messages
  messages
})

export default i18n
