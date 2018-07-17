import VueRouter from 'vue-router'
import IonRouterVue from './ion-router-vue.vue'

export default class Router extends VueRouter {
  constructor(...args) {
    super(...args)
    this.direction = args.direction || 1
    this.viewCount = args.viewCount || 0
    this.prevRouteStack = [this.history.current]
    this.extendHistory()
  }
  extendHistory() {
    this.history._updateRoute = this.history.updateRoute
    this.history.updateRoute = nextRoute => {
      this.direction = this.guessDirection(nextRoute)
      this.viewCount += this.direction
      this.history._updateRoute(nextRoute)
    }
  }
  push(...args) {
    super.push(...args)
    this.direction = 1
    this.viewCount++
  }
  go(n) {
    super.go(n)
    this.viewCount += n
    this.direction = n > 0 ? 1 : -1
  }
  canGoBack() {
    return this.viewCount > 0 && this.currentRoute.path.length > 1
  }
  guessDirection(nextRoute) {
    // We've no where to go - go forward
    if (this.prevRouteStack.length === 0) {
      return 1
    }

    const prevRoute = this.prevRouteStack[this.prevRouteStack.length - 1]

    // Last route is the same as the next one - go back, pop prev route
    // we could also check for the / (root) route and reset the whole stack
    if (prevRoute.fullPath === nextRoute.fullPath) {
      this.prevRouteStack.pop()
      return -1
    }

    // Forward movement, push next route to stack
    this.prevRouteStack.push(this.history.current)
    return 1
  }
}

Router.install = function(Vue) {
  if (Router.install.installed) return
  Router.install.installed = true
  VueRouter.install(Vue)
  Vue.component('IonRouterVue', IonRouterVue)
}

// Auto-install when vue is found (eg. in browser via <script> tag)
let globalVue = null
if (typeof window !== 'undefined') {
  globalVue = window.Vue
} else if (typeof global !== 'undefined') {
  globalVue = global.Vue
}
if (globalVue) {
  globalVue.use(Router)
}
