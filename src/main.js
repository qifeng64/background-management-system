import Vue from "vue";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/en"; // lang i18n

import "@/styles/index.scss"; // global css

import App from "./App";
import store from "./store";
import router from "./router";
import Components from "@/components"; // 引入全局自定义组件

import * as directives from "@/directives"; // 注册自定义指令,将自定义指令中所有的变量拿出来
import * as filters from "@/filters"; // 引入filter中的所有方法
import "@/icons"; // icon
import "@/permission"; // permission control

// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// 注册自定义指令
Object.keys(directives).forEach((key) => {
  Vue.directive(key, directives[key]);
});

// 循环注册自定义过滤器
Object.keys(filters).forEach((key) => {
  // key为过滤器名字 filters[key]为过滤器方法
  Vue.filter(key, filters[key]);
});

// 注册自定义组件
Vue.use(Components);
Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
