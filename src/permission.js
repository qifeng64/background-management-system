// 权限拦截在路由跳转

import router from "@/router";
import store from "@/store";
import nprogress from "nprogress"; // 引入进度条
import "nprogress/nprogress.css"; // 引入进度条样式
/* import { Message } from "element-ui";

import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title"; */

// 前置守卫  next()钩子
/* next()  放过
next(false)  跳转终止
next(地址)  跳转到某个地址 */
const whiteList = ["/login", "/404"]; // 定义白名单
router.beforeEach(async (to, from, next) => {
  nprogress.start(); // 开启进度条
  if (store.getters.token) {
    // 如果有token
    if (to.path === "/login") {
      // 如果访问的是登录页
      next("/"); // 跳到主页
    } else {
      // 只有放过的时候才获取资料
      // 如果当前vuex中有用户资料的ID，表示已经有资料了不用再获取
      if (!store.getters.userId) {
        // 如果当前vuex中没有用户资料的ID; 方法getUserInfo是异步函数
        await store.dispatch("user/getUserInfo");
      }
      next();
    }
  } else {
    // 如果没有token
    if (whiteList.indexOf(to.path) > -1) {
      // 表示要去的地址在白名单
      next();
    } else {
      next("/login");
    }
  }
  nprogress.done(); // 强制关闭  解决手动切换地址进度条的不关闭的问题
});

// 后置守卫
router.afterEach(() => {
  nprogress.done(); // 关闭进度条
});
