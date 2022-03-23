// 管理所有的自定义指令
// 先定义自定义指令，再到main.js中注册自定义指令

export const imagerror = {
  // 指令对象 会在当前的dom元素插入到节点之后执行 => 初始化时执行
  inserted(dom, options) {
    // dom 当前指令作用的dom对象 此时就是图片 当图片有地址但加载失败时报错
    // 触发图片的onerror事件，
    // options是指令中的变量的解释，中有属性value
    dom.src = dom.src || options.value; // 初始化使时 如果有值则赋值 如果没值则进行默认值赋值
    dom.onerror = function () {
      // DOM可以注册error事件 设置默认图片,不能写死
      // 当图片出现异常的时候 会将指令配置的默认图片设置为该图片的内容
      dom.src = options.value;
    };
  },
  // 该函数同inserted一样 也是一个钩子函数
  componentUpdated(dom, options) {
    // 会在当前指令作用的组件更新数据完毕后执行 而inserted只会执行一次
    dom.src = dom.src || options.value;
  },
};
