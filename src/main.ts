import { createSSRApp } from 'vue';
import App from './App.vue';
import router, { routeInterceptor } from './router';
import 'virtual:uno.css';
import './static/iconfont.css';

import * as Pinia from 'pinia';

export function createApp() {
  const app = createSSRApp(App);
  const store = Pinia.createPinia();
  app.use(router);
  app.use(routeInterceptor);
  app.use(store);
  return {
    app,
  };
}
