import {
  getToken,
  setToken,
  removeToken,
  getTimeStamp,
  setTimeStamp,
} from "@/utils/auth";
import { login, getUserInfo, getUserDetailById } from "@/api/user";
// 状态
const state = {
  // token持久化-->放到缓存中
  token: getToken(), // 设置token为共享状态,初始化vuex时先从缓存中读取
  userInfo: {}, // 定义一个空对象->getters会在userInfo中读取数据，存放数据
};

const mutations = {
  setToken(state, token) {
    state.token = token; // 将数据设置给vuex
    // 同步给缓存
    setToken(token);
  },
  // 删除缓存
  removeToken(state) {
    state.token = null; // 删除vuex的token-->数据置空
    removeToken(); // 同步到缓存
  },
  setUserInfo(state, result) {
    // 更新对象
    state.userInfo = result; // 是响应式
    // state.userInfo = { ...result } // 浅拷贝 赋值对象 数据更新后，才会触发组件更新
  },
  // 删除用户信息
  removeUserInfo(state) {
    state.userInfo = {};
  },
};

const actions = {
  // 执行异步
  async login(context, data) {
    // 调用api接口 拿到token
    const result = await login(data);
    // 已经在响应拦截器对数据进行了处理 设置token
    context.commit("setToken", result);
    setTimeStamp(); // 设置时间戳
  },
  async getUserInfo(context) {
    const result = await getUserInfo(); // 得到的就是返回数据中的data
    const baseInfo = await getUserDetailById(result.userId); // 用户详情
    // 将两个接口数据合并，将全部数据存于state中
    context.commit("setUserInfo", { ...result, ...baseInfo }); // 提交到mutations
    return result;
  },
  // 登出action
  logout(context) {
    // 删除token
    context.commit("removeToken"); // 不仅会删除vuex中的，还会删除缓存中的
    // 删除用户资料
    context.commit("removeUserInfo");
  },
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
