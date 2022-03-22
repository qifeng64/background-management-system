<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容 头部 -->
      <el-card class="tree-card">
        <!-- 放置结构内容  -->
        <tree-tools :treeNode="company" :isRoot="true" @addDepts="addDepts" />
        <!-- 放置一个el-tree  -->
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="true"
        >
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
          <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每
            个节点的数据对象-->
          <!-- 只有除痛头部外的部门有删除功能 监听的时间名 调用的方法-->
          <tree-tools
            slot-scope="{ data }"
            :treeNode="data"
            @delDepts="getDepartments"
            @addDepts="addDepts"
            @editDepts="editDepts"
          />
        </el-tree>
      </el-card>
    </div>
    <!-- 放置新增弹层组件 -->
    <add-dept
      ref="addDept"
      :showDialog.sync="showDialog"
      :treeNode="node"
      @addDepts="getDepartments"
    />
  </div>
</template>

<script>
// 引入组件
import TreeTools from "./components/tree-tools";
// 引入封装的接口
import { getDepartments } from "@/api/departments";
// 引入对接口传入数据的处理
import { tranListToTreeData } from "@/utils";
// 引入新增弹层组件
import AddDept from "./components/add-dept";
export default {
  // 注册组件
  components: { TreeTools, AddDept },
  data() {
    return {
      company: { name: "前端小黑马科技股份有限公司 ", manager: "负责人" },
      departs: [],
      defaultProps: {
        label: "name", // 表示从这个属性显示内容
        children: "children", // 从这个属性去找子节点
      },
      showDialog: false, // 默认不显示窗体
      node: null, // 记录当前点击的node
    };
  },
  created() {
    // 调用自身的方法
    this.getDepartments();
  },
  methods: {
    // 定义一个方法(同名随意)去接收接口返回的数据=>因为会频繁调用接口
    async getDepartments() {
      const result = await getDepartments();
      this.departs = tranListToTreeData(result.depts, "");
      // this.departs = result.depts;
      // this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.company = { id: "" };
      console.log(result);
    },
    // 监听tree-tools中触发的点击添加子部门事件
    addDepts(node) {
      this.showDialog = true;
      this.node = node;
    },
    // 编辑功能
    editDepts(node) {
      this.showDialog = true; // 弹出弹层
      this.node = node; // 已设置node的值 并通过props传给子组件add-dept
      // 在这调用获取部门详情的方法
      // console.log(this.$refs.addDept); 查看是否有getdepartDetail方法
      this.$refs.addDept.getDepartDetail(node.id);
    },
  },
};
</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
