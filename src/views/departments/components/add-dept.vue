<template>
  <!-- 放置弹层组件 Dialog对话框 visible="true"默认显示 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单数据 label-width设置所有标题的宽度 -->
    <el-form
      ref="deptForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <!-- @focus.native中native修饰符 可以找到原生元素的事件 -->
        <el-select
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
          @focus="getEmployeeSimple"
        >
          <!-- el-select的选项是el-option -->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          v-model="formData.introduce"
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <!-- 确定和取消 el-row支持flex布局 居中 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 设置宽度为6 -->
      <el-col :span="6">
        <el-button @click="btnOk" size="small" type="primary">确定</el-button>
        <el-button @click="btnCancel" size="small">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
// 引入接口
import {
  getDepartments,
  addDepartments,
  getDepartDetail,
  updateDepartments,
} from "@/api/departments";
import { getEmployeeSimple } from "@/api/employees";
export default {
  // 父组件传给子组件的数据props
  props: {
    // 控制弹层组件的显示和隐藏
    showDialog: {
      type: Boolean,
      default: false,
    },
    // 当前操作的节点 获取ID判断同级是否有相同的子部门
    treeNode: {
      type: Object,
      default: null, // 定义为空 父组件传数据
    },
  },
  data() {
    // 定义自定义方法
    // 检查同级部门下部门名称是否重复
    const checkNameRepeat = async (rule, value, callback) => {
      // 调用接口方法 得到部门数据判断 value是部门名称
      // {depts}从调用方法得到的返回数据中解构出depts
      const { depts } = await getDepartments();
      // 去找同级部门下 有没有和value相同的数据 .some会返回一个布尔值true or false
      // 检查重复 需支持 新增和编辑
      let isRepeat = false;
      if (this.formData.id) {
        // 有ID 编辑模式 filter找到不重名的其它子部门(pid相同)
        isRepeat = depts
          .filter(
            (item) =>
              item.pid === this.treeNode.pid && item.id !== this.formData.id
          )
          .some((item) => item.name === value);
        // 为true 则不让过 下面返回错误
      } else {
        // 没有则为新增模式
        isRepeat = depts
          .filter((item) => item.pid === this.treeNode.id)
          .some((item) => item.name === value);
      }
      // 如果isRepeat为true 表示找到了一样的名字 不让过 返回错误
      isRepeat
        ? callback(new Error(`同级部门下已经存在这个${value}部门了`))
        : callback();
    };
    // 检查编码是否重复
    const checkCodeRepeat = async (rule, value, callback) => {
      const { depts } = await getDepartments();

      let isRepeat = false;
      if (this.formData.id) {
        // 编辑模式 要求不能有一样的code 先排除自己不能和自己比较
        // 加一个条件 code不能为空
        isRepeat = depts
          .filter((item) => item.id !== this.treeNode.id)
          .some((item) => item.code === value && value);
      } else {
        // 新增模式
        isRepeat = depts.some((item) => item.code === value && value);
      }

      isRepeat
        ? callback(new Error(`组织架构下已经存在这个${value}编码了`))
        : callback();
    };
    return {
      formData: {
        name: "",
        code: "",
        manager: "",
        introduce: "",
      }, // 校验规则 {key: 数组[{第一条规则},{...}]}
      rules: {
        // trigger默认值为change  blur失去焦点后校验
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门名称长度为1-50个字符",
            trigger: "blur",
          },
          // 自定义函数 validator: 方法
          { trigger: "blur", validator: checkNameRepeat },
        ],
        code: [
          { required: true, message: "部门编码不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门编码长度为1-50个字符",
            trigger: "blur",
          },
          // 自定义函数 validator: 方法
          { trigger: "blur", validator: checkCodeRepeat },
        ],
        manager: [
          { required: true, message: "部门负责人不能为空", trigger: "blur" },
        ],
        introduce: [
          { required: true, message: "部门介绍不能为空", trigger: "blur" },
          {
            min: 1,
            max: 300,
            message: "部门介绍长度为1-300个字符",
            trigger: "blur",
          },
        ],
      },
      peoples: [],
    };
  },
  // 弹层显示的标题应该是动态的 => 新增部门 or 编辑部门
  computed: {
    showTitle() {
      return this.formData.id ? "编辑部门" : "新增子部门";
    },
  },
  methods: {
    // 新增时 获取员工的简单信息
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple();
    },

    btnOk() {
      // $refs
      this.$refs.deptForm.validate(async (isOk) => {
        if (isOk) {
          // 判断是编辑还是新增
          if (this.formData.id) {
            // 编辑 此时校验规则也需要改变
            await updateDepartments(this.formData);
          } else {
            // 新增
            // 表单校验通过 可以提交 formData中只有四项基本数据 追加pid ...表示将数据解构出来
            await addDepartments({ ...this.formData, pid: this.treeNode.id });
          }

          // 告诉父组件更新数据
          this.$emit("addDepts"); // 触发一个自定义事件 父组件需要监听事件
          this.$emit("update:showDialog", false);
          // 关闭dialog时会触发el_dialog的close事件 从而调用btnCancel方法 所以不需要单独重置数据
        }
      });
    },
    btnCancel() {
      // 重置表单 因为resetFields只能重置表单上的数据 非表单 如ID不能重置
      (this.formData = {
        name: "",
        code: "",
        manager: "",
        introduce: "",
      }),
        this.$emit("update:showDialog", false);
      // 清除表单前一次检验提示信息
      this.$refs.deptForm.resetFields();
    },
    // 点击编辑 获取详情方法
    async getDepartDetail(id) {
      // props传值异步 可能取到treeNode 也可能取不到
      this.formData = await getDepartDetail(id);
    },
  },
};
</script>
