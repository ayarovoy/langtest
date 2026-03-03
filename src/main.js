import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import './styles.css';
import LangTestPlugin from './index';
createApp(App).use(LangTestPlugin).use(ElementPlus).mount('#app');
