<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <template v-slot:before>
          <span>共{{ page.total }}条记录</span>
        </template>
        <!-- 右侧显示按钮 excel导入 excel导出 新增员工 -->
        <!-- @click="$router.push('/import')跳转到导入Excel页面 -->
        <template v-slot:after>
          <el-button
            size="small"
            type="success"
            @click="$router.push('/import')"
            >excel导入</el-button
          >
          <el-button size="small" type="danger" @click="exportData"
            >excel导出</el-button
          >
          <el-button size="small" type="primary" @click="showDialog = true"
            >新增员工</el-button
          >
        </template>
      </page-tools>
      <!-- 表格组件 sortable可排序 -->
      <el-table v-loading="loading" :data="list">
        <!-- 表格中显示序号  -->
        <el-table-column type="index" label="序号" sortable="" />
        <el-table-column prop="username" label="姓名" sortable="" />
        <el-table-column width="120px" label="头像" align="center">
          <!-- 插槽 父组件传递数据 -->
          <template v-slot="{ row }">
            <img
              v-imagerror="require('@/assets/common/head.jpg')"
              :src="row.staffPhoto"
              alt=""
              style="
                border-radius: 50%;
                width: 100px;
                height: 100px;
                padding: 10px;
              "
            />
          </template>
        </el-table-column>
        <el-table-column prop="workNumber" label="工号" sortable="" />
        <el-table-column
          prop="formOfEmployment"
          label="聘用形式"
          sortable=""
          :formatter="formatEmployment"
        />
        <el-table-column prop="departmentName" label="部门" sortable="" />
        <!-- 作用域插槽来做 + 过滤器 -->
        <el-table-column prop="timeOfEntry" label="入职时间" sortable="">
          <template v-slot="{ row }">
            <!-- 将时间格式化 -->
            {{ row.timeOfEntry | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="enableState" label="账户状态" sortable="">
          <template v-slot="{ row }">
            <el-switch :value="row.enableState === 1"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" sortable="" fixed="right" width="280">
          <!-- <template slot-scope="{ row }"> -->
          <template v-slot="{ row }">
            <el-button
              type="text"
              size="small"
              @click="$router.push(`employees/detail/${row.id}`)"
              >查看</el-button
            >

            <el-button type="text" size="small">转正</el-button>
            <el-button type="text" size="small">调岗</el-button>
            <el-button type="text" size="small">离职</el-button>
            <el-button type="text" size="small">角色</el-button>
            <el-button type="text" size="small" @click="delEmployee(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" justify="center" align="middle" style="height: 60px">
        <el-pagination
          :current-page="page.page"
          :page-size="page.size"
          :total="page.total"
          layout="prev, pager, next"
          @current-change="changePage"
        />
      </el-row>
    </div>
    <!-- 放置弹层组件 -->
    <!-- sync修饰符 子组件改变父组件数据的一个语法糖 -->
    <AddEmployee :show-dialog.sync="showDialog"></AddEmployee>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from "@/api/employees";
import EmployeeEnum from "@/api/constant/employees"; // 引入员工的枚举对象
import AddEmployee from "./components/add-employee"; // 引入新增员工的弹层组件
import { formatDate } from "@/filters"; //
export default {
  components: {
    AddEmployee,
  }, // 注册组件
  data() {
    return {
      list: [], // 接收数组
      page: {
        page: 1,
        size: 10,
        total: 0, // 总数
      },
      loading: false, // 遮罩层
      showDialog: false, // 弹层默认关闭
    };
  },
  created() {
    this.getEmployeeList();
  },
  methods: {
    async getEmployeeList() {
      this.loading = true;
      const { total, rows } = await getEmployeeList(this.page);
      this.page.total = total;
      this.list = rows;
      this.loading = false;
    },
    // newPage就是点击想要切换的页码
    changePage(newPage) {
      this.page.page = newPage; // 赋值最新的页码
      this.getEmployeeList(); // 重新拉取新的数据
    },
    formatEmployment(row, column, cellValue, index) {
      // console.log(cellValue);
      // cellValue(单元格的值)为1，找到hireType(聘用形式)为1的数据
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue);
      // return什么 就会显示什么 obj内有数据则为真返回 hireType.value
      return obj ? obj.value : "未知";
    },
    async delEmployee(id) {
      try {
        await this.$confirm("确定删除该员工吗？");
        // 点击确定进入下一步
        await delEmployee(id);
        this.$message.success("删除员工成功");
        this.getEmployeeList(); // 重新拉取数据
      } catch (error) {
        console.log(error);
      }
    },
    exportData() {
      const headers = {
        姓名: "username",
        手机号: "mobile",
        入职日期: "timeOfEntry",
        聘用形式: "formOfEmployment",
        转正日期: "correctionTime",
        工号: "workNumber",
        部门: "departmentName",
      };
      // 导出excel 只有点击后才会引入该文件
      import("@/vendor/Export2Excel").then(async (excel) => {
        // list只是当前第一页的数据 调用getEmployeeList接口并将所有数据存入
        // 一个页面中(重新定义页面)
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total,
        });
        // 要转化数据结构 还要和表头的顺序对应上
        const data = this.formatJson(headers, rows);
        // 复杂表头 => 多行表头
        const multiHeader = [["姓名", "主要信息", "", "", "", "", "部门"]];
        // 合并多余的行列
        const merges = ["A1:A2", "B1:F1", "G1:G2"];
        // excel是引入文件的导出对象 调用引入文件的方法
        excel.export_json_to_excel({
          /* header: [],
          data: [],
          filename: "", */
          header: Object.keys(headers),
          data: data,
          filename: "员工资料表",
          multiHeader, // 复杂表头
          merges, // 合并选项
        });
      });
    },
    // data数据格式需转化 [{username: '张三', mobile: 13647589274}] =>[[]]
    formatJson(headers, rows) {
      // map将传入函数依次作用于序列每个参数并将结果返回
      return rows.map((item) => {
        // item是一个对象 {mobile: 13647589274, username: '张三'...}
        // Object.keys(headers) => ['手机号', '入职时间'...]
        return Object.keys(headers).map((key) => {
          // 需要判断字段
          if (
            headers[key] === "timeOfEntry" ||
            headers[key] === "correctionTime"
          ) {
            // 格式化日期
            return formatDate(item[headers[key]]);
          } else if (headers[key] === "formOfEmployment") {
            // 格式化聘用形式 员工的枚举对象已引用
            const obj = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            );
            // 如果obj存在则显示Object.value 否则显示未知
            return obj ? obj.value : "未知";
          }
          // headers[key] => ['mobile', 'username'...]
          return item[headers[key]];
        });
      });
    },
  },
};
</script>

<style></style>
