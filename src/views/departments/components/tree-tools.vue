<template>
  <el-row
    type="flex"
    justify="space-between"
    align="middle"
    style="height: 40px; width: 100%"
  >
    <!-- 放置结构内容  -->
    <el-col>
      <span>{{ treeNode.name }}</span>
    </el-col>
    <!-- 限制右侧菜单宽度 -->
    <el-col :span="4">
      <!-- 再加一个el-row用于使用flex布局 存放右侧内容 -->
      <el-row type="flex" justify="end">
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 放置下拉菜单 -->
          <!-- 监听command事件 -->
          <el-dropdown @command="operateDepts">
            <!-- 内容 -->
            <span>操作 <i class="el-icon-arrow-down" /></span>
            <!-- 下拉菜单 具名插槽 -->
            <el-dropdown-menu slot="dropdown">
              <!-- 下拉选项  -->
              <el-dropdown-item command="add"> 添加子部门 </el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">
                编辑部门
              </el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">
                删除部门
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
import { delDepartments } from "@/api/departments";
export default {
  props: {
    // 定义传入的属性
    treeNode: {
      required: true,
      type: Object,
    },
    isRoot: {
      type: Boolean, // 限制为布尔值
      default: false, // 默认不是根节点
    },
  },
  methods: {
    // 点击 编辑 删除 新增时触发
    operateDepts(type) {
      if (type === "add") {
        // 添加子部门
        // 为何传出treeNode 因为是添加子部门 需要当前部门的数据
        this.$emit("addDepts", this.treeNode); // 告诉父组件 显示弹层
      } else if (type === "edit") {
        // 编辑部门 点击编辑调用父组件的编辑方法
        this.$emit("editDepts", this.treeNode); // 触发自定义事件 点击谁编辑谁
      } else {
        // 删除部门
        // 如果点击了确定就会进入then 点击取消会进入catch
        this.$confirm("您确定要删除该组织部门吗")
          .then(() => {
            // 将执行结果返回
            return delDepartments(this.treeNode.id);
            // alert("已删除");
          })
          .then(() => {
            // 执行成功返回后进入then  失败已经在响应拦截器中进行了处理
            // 调用接口删除了 后端数据删除 前端数据未改变 需重新让父组件获取数据
            this.$emit("delDepts"); // 触发自定义事件
            this.$message.success("删除部门成功");
          });
      }
    },
  },
};
</script>
<style></style>
