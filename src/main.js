import Vue from 'vue';
import router from './router';
import VueBus from 'vue-bus';
Vue.use(VueBus);
import App from './App';

new Vue({
    router,
    render: h => h(App),
    renderError(h, err) {
        return h('pre', { style: { color: 'red' } }, err.stack)
    }
}).$mount('#app');
