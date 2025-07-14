import { createApp } from "vue"
import { createPinia } from "pinia"
import {
  createWebHistory,
  createWebHashHistory,
  createRouter,
} from "vue-router"
import { getToken } from "@/utils/token"
import App from "./App.vue"
import "./style.css"

import RegisterForm from "@/components/users/RegisterForm.vue"
import LoginForm from "@/components/users/LoginForm.vue"
import YouBikeApp from "@/components/youbike/YouBikeApp.vue"

const routes = [
  { path: "/register", component: RegisterForm },
  { path: "/login", component: LoginForm },
  { path: "/youbike", component: YouBikeApp },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = getToken()
  if (to.path === "/") {
    if (token) {
      next("/youbike")
    } else {
      next("/login")
    }
  } else {
    next()
  }
})

const pinia = createPinia()

createApp(App).use(pinia).use(router).mount("#app")

// const app = createApp(App)
// app.use(pinia)
// app.mount('#app')
