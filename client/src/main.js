import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)
}

app.use(createPinia())
app.use(router)

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

app.mount('#app')