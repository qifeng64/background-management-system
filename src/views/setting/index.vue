<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 放置内容 -->
      <el-card>
        <el-tabs>
          <!-- 左侧 -->
          <el-tab-pane label="角色管理">
            <!-- 左侧内容：新增角色 和 一个Table表格 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                type="primary"
                size="small"
                @click="showDailog = true"
                >新增角色</el-button
              >
            </el-row>
            <!-- 给表格绑定数据list type="index"让序号从1开始 -->
            <el-table border="" :data="list">
              <el-table-column
                align="center"
                type="index"
                label="序号"
                width="120"
              ></el-table-column>
              <el-table-column
                align="center"
                prop="name"
                label="名称"
                width="240"
              ></el-table-column>
              <el-table-column
                align="center"
                prop="description"
                label="描述"
              ></el-table-column>
              <el-table-column align="center" label="操作">
                <!-- 作用域插槽 slot-scope可以获取table（内部的状态管理:row, column, $index 和 store）的数据 -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success">分配权限</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="editRole(row.id)"
                    >编辑</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteRole(row.id)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 放置分页组件 运用flex布局让组件水平居中(justify)垂直居中(align) -->
            <el-row
              type="flex"
              justify="center"
              align="middle"
              style="height: 60px"
            >
              <!-- @current-change监听方法 -->
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev, pager, next"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <!-- 右侧 -->
          <el-tab-pane label="公司信息">
            <!-- 提示（警示）消息 closable默认为true 可关闭
            show-icon属性来显示 Alert 的 icon-->
            <el-alert
              type="info"
              :show-icon="true"
              :closable="false"
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
            ></el-alert>
            <!-- 右侧内容 label-width给标题120px宽度 disabled禁止输入 -->
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="企业名称">
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="公司电话">
                <el-input
                  v-model="formData.companyPhone"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  disabled
                  style="width: 400px"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置一个弹层组件 -->
    <!-- close事件在点击确定时也会触发 -->
    <el-dialog title="编辑部门" :visible="showDailog" @close="btnCancel">
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <!-- 角色描述不需要维护 故不写prop -->
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 取消和确定 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button size="small" @click="btnCancel">取消</el-button>
          <el-button type="primary" size="small" @click="btnOk">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRoleList,
  getCompanyInfo,
  deleteRole,
  getRoleDetail,
  updateRole,
  addRole,
} from "@/api/setting";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      list: [],
      page: {
        page: 1,
        pagesize: 10, // 分页最大记录数
        total: 0, // 记录总数
      },
      formData: {
        // 公司信息
      },
      showDailog: false, // 控制弹层显示
      roleForm: {
        name: "",
        description: "",
      },
      rules: {
        name: [{ required: true, message: "角色名称不能为空", trigger: blur }],
      },
    };
  },
  computed: {
    // 引入存于vuex（store）中的companyID
    ...mapGetters(["companyId"]),
  },
  created() {
    this.getRoleList(); // 获取角色列表
    this.getCompanyInfo(); // 获取公司信息
  },
  methods: {
    // 封装方法
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page);
      this.page.total = total;
      this.list = rows;
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId); // 给formData赋值
    },
    changePage(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage; // 将当前点击的页码赋值页码
      this.getRoleList(); // 封装方法的好处
    },
    async deleteRole(id) {
      // 点击删除提示信息
      try {
        await this.$confirm("确认删除该角色吗");
        // 只有点击了确定 才能进入到下方
        await deleteRole(id); // 调用删除接口
        this.getRoleList(); // 重新加载数据
        this.$message.success("删除角色成功");
      } catch (error) {
        console.log(error);
      }
    },
    async editRole(id) {
      this.roleForm = await getRoleDetail(id); // 实现数据的回写 写在显示弹层前让显示效果更好
      this.showDailog = true; // 显示弹层
    },
    async btnOk() {
      try {
        await this.$refs.roleForm.validate();
        // 只有校验通过 才会执行await下方的内容 也就是点击确定成功后
        // roleForm有ID就是编辑 没有就是新增
        if (this.roleForm.id) {
          await updateRole(this.roleForm); // 更新后端数据
        } else {
          // 新增业务
          await addRole(this.roleForm);
        }
        // 重新拉取数据
        this.getRoleList();
        this.$message.success("操作成功");
        this.showDailog = false; // 关闭弹层 => 触发el-dialog的close事件
      } catch (error) {
        console.log(error);
      }
    },
    btnCancel() {
      console.log("触发关闭事件");
      this.roleForm = {
        name: "",
        description: "",
      };

      this.$refs.roleForm.resetFields(); // 移除校验
      this.showDailog = false; // 关闭弹层
    },
  },
};
</script>

<style></style>
