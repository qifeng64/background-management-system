// 导出员工的路由规则
import Layout from "@/layout";
export default {
  // 路由规则
  path: "/attendances", // 路由地址
  name: "attendances", // 给路由规则加一个name
  component: Layout, // 动态路由应与静态路由并列
  children: [
    {
      // 二级路由的path什么都不写的时候 表示该路由为当前二级路由的默认路由
      path: "", // 表示不但有布局layout，还有下面的组件即员工主页
      // 动态按需引入attendances组件
      component: () => import("@/views/attendances"),
      // 路由元信息 其实就是一个储存数据的地方 可以放任何内容
      meta: {
        title: "考勤", // 左侧导航栏会读取这里的title属性
        icon: "skill",
      },
    },
  ],
};
