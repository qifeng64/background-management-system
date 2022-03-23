// 负责所有全局自定义 组件 的注册 避免每次使用组件都要引入和注册

import PageTools from "./PageTools";
import UpdateExcel from "./UpdateExcel";
import ImageUpload from "./ImageUpload";
export default {
  // Vue.use()其实就是调用install方法
  install(Vue) {
    // 组件的注册 参数：'组件名称', 组件对象
    Vue.component("PageTools", PageTools);
    Vue.component("UpdateExcel", UpdateExcel);
    Vue.component("ImageUpload", ImageUpload); // 注册上传图片组件
  },
};
