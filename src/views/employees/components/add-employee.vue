<template>
  <el-dialog title="新增员工" :visible="showDialog" @close="btnCancel">
    <!-- 表单 -->
    <el-form
      ref="addEmployee"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="姓名" prop="username">
        <el-input
          style="width: 50%"
          placeholder="请输入姓名"
          v-model="formData.username"
        />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input
          style="width: 50%"
          placeholder="请输入手机号"
          v-model="formData.mobile"
        />
      </el-form-item>
      <el-form-item label="入职时间" prop="timeOfEntry">
        <el-date-picker
          style="width: 50%"
          placeholder="请选择入职时间"
          v-model="formData.timeOfEntry"
        />
      </el-form-item>
      <el-form-item label="聘用形式" prop="formOfEmployment">
        <el-select
          style="width: 50%"
          placeholder="请选择"
          v-model="formData.formOfEmployment"
        >
          <!-- 绑定的key:item.id 显示的内容:item.value 存入的值:item.id -->
          <el-option
            v-for="item in EmployeeEnum.hireType"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="工号" prop="workNumber">
        <el-input
          style="width: 50%"
          placeholder="请输入工号"
          v-model="formData.workNumber"
        />
      </el-form-item>
      <el-form-item label="部门" prop="departmentName">
        <el-input
          style="width: 50%"
          placeholder="请选择部门"
          v-model="formData.departmentName"
          @focus="getDepartments"
        />
        <!-- 放置一个树形组件 因为默认显示的是label，将label定义为name
          :default-expand-all="true"展开所有的节点 -->
        <el-tree
          v-loading="loading"
          v-if="showTree"
          :data="treeData"
          :props="{ label: 'name' }"
          :default-expand-all="true"
          @node-click="selectNode"
        ></el-tree>
      </el-form-item>
      <el-form-item label="转正时间" prop="correctionTime">
        <el-date-picker
          style="width: 50%"
          placeholder="请选择转正时间"
          v-model="formData.correctionTime"
        />
      </el-form-item>
    </el-form>
    <!-- footer插槽 slot="footer放在底部 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small" @click="btnCancel">取消</el-button>
        <el-button size="small" @click="btnOk" type="primary">确定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
// 引入获取组织架构的数据的接口
import { getDepartments } from "@/api/departments";
// 引入将列表型数据转化为树形数据的方法=>递归算法(自身调用自身)=>条件不能一样(传入参数)
import { tranListToTreeData } from "@/utils";
// 引入关于员工聘用状态的数据
import EmployeeEnum from "@/api/constant/employees";
// 引入新增员工的接口
import { addEmployee } from "@/api/employees";
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      EmployeeEnum, // EmployeeEnum: EmployeeEnum, 将引入的数据变为data数据
      // 定义表单数据
      formData: {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      },
      rules: {
        username: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
          {
            min: 1,
            max: 4,
            message: "用户姓名为1-4位",
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "手机号格式不正确",
            trigger: "blur",
          },
        ],
        formOfEmployment: [
          { required: true, message: "聘用形式不能为空", trigger: "blur" },
        ],
        workNumber: [
          { required: true, message: "工号不能为空", trigger: "blur" },
        ],
        departmentName: [
          // 因为鼠标会离开点击选择部门 所以检验触发为change
          { required: true, message: "部门不能为空", trigger: "change" },
        ],
        timeOfEntry: [{ required: true, message: "入职时间", trigger: "blur" }],
      },
      treeData: [], // 定义一个数组来接收树形结构
      showTree: false, // 默认不显示树形组件
      loading: false, // 有卡顿的情况加上一个进度条 加在需要用的组件上
    };
  },
  methods: {
    async getDepartments() {
      this.showTree = true; // 展开树形组件
      this.loading = true;
      const { depts } = await getDepartments();
      // depts是一个数组 需要转换为树形结构 才可以被 el-tree显示
      // 组织架构中所有根节点的ID都为空
      this.treeData = tranListToTreeData(depts, "");
      this.loading = false;
    },
    selectNode(node) {
      // console.log(arguments); 发现第一个参数含有想要的数据
      this.formData.departmentName = node.name; // 点击填入
      this.showTree = false; // 点击后隐藏
    },
    async btnOk() {
      try {
        // 校验表单
        await this.$refs.addEmployee.validate();
        // 校验成功
        await addEmployee(this.formData); //调用新增接口
        // 通知父组件更新数据 先判断父组件有没有方法再调用方法
        this.$parent.getEmployeeList && this.$parent.getEmployeeList();
        this.$parent.showDialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    btnCancel() {
      // 清空表单数据
      this.formData = {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      };
      this.$refs.addEmployee.resetFields(); // 移除校验
      this.$emit("update:showDialog", false);
    },
  },
};
</script>
<style></style>
