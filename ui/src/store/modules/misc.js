import Cookies from 'js-cookie'

const misc = {
  state: {
    theme: Cookies.get('imdev-theme') || 'light',
    lang: Cookies.get('imdev-lang') || 'en',
  },
  mutations: {
    SET_THEME: (state, theme) => {
      state.theme = theme
      Cookies.set('imdev-theme', theme)
    },
    SET_LANG: (state, lang) => {
      state.lang = lang
      Cookies.set('imdev-lang', lang)
    }
  },
  actions: {
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    },
    setLang({ commit }, val) {
      commit('SET_LANG', val)
    }
  }
}

export default misc
