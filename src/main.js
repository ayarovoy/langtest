import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';
import LangTestPlugin from './index';
createApp(App).use(LangTestPlugin).mount('#app');
