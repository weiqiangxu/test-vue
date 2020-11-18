import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
// 定义路由
const frame = () => import('../views/frame');
const error = () => import('../views/error');
const collect = () => import('../views/error');
// 收集表单页
const form = () => import('../views/collect/form');
const routes = [{
    path: '/', name: 'frame', component: frame,
    children: [
        { path: 'collect', name: 'collect', component: collect, meta: { type: 'collect',},
            children: [
                { path: 'form', name: 'form', component: form, meta: { type: 'collect',}},
            ]
        },
        { path: '*', name: 'error', component: error, meta: { scrollToTop: true } }
    ]
}];

export default new Router({
    mode: 'history',
    base: "/",//路由前缀
    //切换新路由时-控制页面滚动条
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {
                x: 0,
                y: 0
            }
        }
    },
    routes: routes
});