import { IonicVue, alertController } from '@ionic/vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'


const app = createApp(App)
app.use(IonicVue);
app.use(router)
app.use(createPinia())

router.isReady().then(() => {
  app.mount('#app');
});
