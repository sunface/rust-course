import Vue from 'vue'
import Router from 'vue-router'

import Nav from '@/views/nav'
Vue.use(Router)



const router = new Router({
  mode: 'history',
  routes: [
    {  
      path: '/', 
      component: Nav,
      children: [
        { path: '/', meta: {'title':'im.dev'}, component: () => import('@/views/home')},
        { path: '/x/article/new', meta: {'title':'Post - im.dev'},component: () => import('@/views/article/edit')},
        { path: '/:uname/:arID', meta: {'title':'Article - im.dev',},component: () => import('@/views/article/detail')},
        { path: '/:uname/:arID/edit', meta: {'title':'Post - im.dev'},component: () => import('@/views/article/edit')},
      ]
    },
    // { path: '/404', component: () => import('@/views/errorPage/page404')},
    // { path: '*', redirect: '/404'}
  ],
  scrollBehavior (to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
        resolve(savedPosition)
        } else {
        resolve( { x: 0, y: 0 })
        }
      }, 500)
    })
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
