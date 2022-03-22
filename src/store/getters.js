const getters = {
  sidebar: (state) => state.app.sidebar,
  device: (state) => state.app.device,
  // 建立token的快捷访问
  token: (state) => state.user.token,
  // 建立用户名的快捷访问
  name: (state) => state.user.userInfo.username,
  userId: (state) => state.user.userInfo.userId,
  // 建立头像的快捷访问
  staffPhoto: (state) => state.user.userInfo.staffPhoto,
  // 建立对于公司ID的快捷访问
  companyId: (state) => state.user.userInfo.companyId,
};
export default getters;
