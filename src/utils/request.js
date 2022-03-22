// 导出一个axios的实例  而且这个实例要有请求拦截器 响应拦截器
import axios from "axios";
import store from "@/store";
import router from "@/router"; // 用于路由跳转
import { Message } from "element-ui";
import { getTimeStamp } from "@/utils/auth";

const TimeOut = 3600; // 定义超时时间 一小时
const service = axios.create({
  // 当执行 npm run dev => .evn.development => /api =>跨域代理
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 50000, // 定义5秒超时
}); // 创建一个axios的实例

// 请求拦截器 axios注入token
service.interceptors.request.use(
  (config) => {
    // config 是请求的配置信息
    // 注入token
    if (store.getters.token) {
      // 只有在有token的情况下 才有必要去检查时间戳是否超时
      if (IsCheckTimeOut()) {
        // 调用isCheckTimeOut方法得到返回值 true 已超时 --> 删除token
        store.dispatch("user/logout"); // 调用登出操作
        router.push("/login"); // 跳到登录页面
        return Promise.reject(new Error("token超时了"));
      }
      config.headers["Authorization"] = `Bearer ${store.getters.token}`;
    }
    return config; // 必须return config
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // axios默认加一层data
    const { success, message, data } = response.data;
    // 根据success的成功与否决定下面的操作
    if (success) {
      return data;
    } else {
      // 业务出错 提示并进入catch
      Message.error(message);
      return Promise.reject(new Error(message));
    }
  },
  (error) => {
    // error 信息里面的response的对象
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === 10002
    ) {
      // 当等于10002时表示后端告诉已超时
      store.dispatch("user/logout"); // 登出action
      router.push("/login"); // 跳转到登录页面
    } else {
      Message.error(error.message); // 提示错误信息
    }
    return Promise.reject(error); // 返回执行错误 让当前执行链跳出成功 直接进入catch
  }
);
// 是否超时 超时逻辑：当前时间 - 时间戳 ?> 超时时间
function IsCheckTimeOut() {
  var currentTime = Date.now(); // 当前时间戳
  var timeStamp = getTimeStamp(); // 缓存时间戳
  return (currentTime - timeStamp) / 1000 > TimeOut; // 判断是否超时 返回true or false
}
export default service; // 导出axios实例
