import Cookies from 'js-cookie'

const misc = {
  state: {
    theme: Cookies.get('imdev-theme') || 'light',
    lang: Cookies.get('imdev-lang') || 'en',
    readingLang: getReadingLang(self.lang),
    needSignin: 0,
    navFixed : true
  },
  mutations: {
    SET_THEME: (state, theme) => {
      state.theme = theme
      Cookies.set('imdev-theme', theme)
    },
    SET_LANG: (state, lang) => {
      state.lang = lang
      Cookies.set('imdev-lang', lang)
    },
    SET_READING_LANG: (state, lang) => {
      if (lang.length == 0) {
        Cookies.remove('imdev-reading-lang')
      } else {
        state.readingLang = lang
        Cookies.set('imdev-reading-lang', JSON.stringify(lang))
      }
    },
    SET_NEEDSIGNIN: (state, _) => {
      state.needSignin++
    },
    SET_NAVFIXED: (state, val) => {
      state.navFixed = val
    }
  },
  actions: {
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    },
    setLang({ commit }, val) {
      commit('SET_LANG', val)
    },
    setReadingLang({ commit }, val) {
      commit('SET_READING_LANG', val)
    },
    setNeedSignin({ commit }, val) {
      commit('SET_NEEDSIGNIN', val)
    },
    setNavFixed({ commit }, val) {
      commit('SET_NAVFIXED', val)
    }
  }
}

function getReadingLang() {
   var lang = Cookies.get('imdev-lang') || 'en'
   var c = Cookies.get('imdev-reading-lang')
   if (c == undefined) {
     return [lang]
   } else {
     return JSON.parse(c)
   }  
}
export default misc
