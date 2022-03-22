<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 放一个el-card  -->
      <el-card>
        <el-tabs>
          <!-- 一个表格三个页眉 -->
          <el-tab-pane label="登录账户设置">
            <!-- 放置内容 => 表格 -->
            <el-form
              ref="userForm"
              :rules="rules"
              :model="userInfo"
              label-width="120px"
              style="margin-left: 120px; margin-top: 30px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfo.username" style="width: 300px" />
              </el-form-item>
              <el-form-item label="密码" prop="password2">
                <!-- 想显示密码将password2改为password 去掉type -->
                <el-input
                  v-model="userInfo.password2"
                  style="width: 300px"
                  type="password"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveUser">保存</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="个人详情">
            <!-- 放置内容 => 个人详情 -->
            <!-- <user-info></user-info> -->
            <!-- vuejs中内置了一个组件 component 可以是任意组件 作用：动态组件，可以切换组件 -->
            <!-- <el-button type="primary" @click="UserComponent = 'el-table'"
              >切换组件</el-button
            >
            <el-button type="primary" @click="UserComponent = 'user-info'"
              >返回组件</el-button
            > -->

            <component :is="UserComponent" />
          </el-tab-pane>
          <el-tab-pane label="岗位信息">
            <!-- 放置内容 => 岗位信息 -->
            <component :is="JobComponent" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getUserDetailById } from "@/api/user";
import { saveUserDetailById } from "@/api/employees";
import UserInfo from "./components/user-info"; // 引入子组件 个人详情
import JobInfo from "./components/job-info"; // 引入子组件 岗位详情
export default {
  components: { UserInfo, JobInfo }, // 注册子组件
  data() {
    return {
      UserComponent: UserInfo,
      JobComponent: JobInfo,
      userId: this.$route.params.id, // 直接将路由中的参数赋值给了data中的属性
      userInfo: {
        username: "",
        password2: "", // 因为读取出来的password是密文 会超过限制长度
      },
      rules: {
        username: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
        ],
        password2: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 9, message: "密码长度6-9位", trigger: blur },
        ],
      },
    };
  },
  created() {
    this.getUserDetailById();
  },
  methods: {
    async getUserDetailById() {
      this.userInfo = await getUserDetailById(this.userId);
    },
    saveUser() {
      this.$refs.userForm.validate().then(async () => {
        await saveUserDetailById({
          ...this.userInfo,
          password: this.userInfo.password2,
        });
        this.$message.success("修改用户信息成功");
      });
    },
  },
};
</script>

<style></style>
