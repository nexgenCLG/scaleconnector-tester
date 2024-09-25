import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(), // Use hash mode instead of history mode
  routes: [
    // your routes here
  ],
});

export default router;