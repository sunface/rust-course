import Vue from 'vue'
import Router from 'vue-router'

import Nav from '@/views/nav'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {  
      path: '/', 
      component: Nav,
      children: [
        { path: '/', component: () => import('@/views/home')},
      ]
    },
    { path: '/404', component: () => import('@/views/errorPage/page404')},
    { path: '*', redirect: '/404'}
  ]
})
