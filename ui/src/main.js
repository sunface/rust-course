// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
// import 'mavon-editor/dist/markdown/github-markdown.min.css'

Vue.use(mavonEditor)

import './assets/icon/iconfont.css';

import App from './App'

Vue.use(ElementUI);
import router from './router'

// 全局范围加载通用样式，每个vue page里无需重复引入
import '!style-loader!css-loader!less-loader!./theme/eleui-style.less'
import '!style-loader!css-loader!less-loader!./theme/style.less'

Vue.config.productionTip = false

import i18n from './lang' // Internationalization


import store from './store'

 
router.beforeEach((to, _, next) => {
    next()
})

router.afterEach(() => {
})



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})
