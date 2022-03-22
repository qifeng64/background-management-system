<!-- 公共导入组件 在router/index.js下**新建一个公共的导入页面 -->
<template lang="">
  <update-excel :on-success="success"></update-excel>
</template>
<script>
import { importEmployee } from "@/api/employees";
export default {
  methods: {
    async success({ header, results }) {
      // header为key 中文 results也是 需转化 应与新增员工的属性一致
      //   username: "",  姓名
      //   mobile: "",   手机号
      //   formOfEmployment: "",
      //   workNumber: "",    工号
      //   departmentName: "",
      //   timeOfEntry: "",  入职日期
      //   correctionTime: "",   转正日期
      const userRelations = {
        入职日期: "timeOfEntry",
        手机号: "mobile",
        姓名: "username",
        转正日期: "correctionTime",
        工号: "workNumber",
      };
      //   var arr = []; // 定义空数组
      //   results.forEach((item) => {
      //     var userInfo = {}; // 容器
      //     Object.keys(item).forEach((key) => {
      //       // 现在key是中文 转换为英文后放入容器 item[key]为key所对应的value
      //       userInfo[userRelations[key]] = item[key];
      //     });
      //     arr.push(userInfo);

      var newArr = results.map((item) => {
        // map将传入函数依次作用于序列的每个参数 并将结果返回
        var userInfo = {}; // 容器
        Object.keys(item).forEach((key) => {
          // 进行判断如果是日期有关则对其进行转换
          if (
            userRelations[key] === "timeOfEntry" ||
            userRelations[key] === "correctionTime"
          ) {
            // 后端接口限制 不能是字符串 需要转换为时间类型
            userInfo[userRelations[key]] = new Date(this.formatDate(item[key]));
          } else {
            // 现在key是中文 转换为英文后放入容器 item[key]为key所对应的value
            userInfo[userRelations[key]] = item[key];
          }
        });
        return userInfo;
      });
      // console.log(newArr);
      // 已经导入接口
      await importEmployee(newArr); // 接收一个数组
      this.$message.success("导入excel成功");
      this.$router.back(); // 回到上一个页面
    },
    // Excel独有的日期格式 需对其进行转化
    formatDate(numb, format) {
      const time = new Date((numb - 1) * 24 * 3600000 + 1);
      time.setYear(time.getFullYear() - 70);
      const year = time.getFullYear() + "";
      const month = time.getMonth() + 1 + "";
      const date = time.getDate() - 1 + "";
      if (format && format.length === 1) {
        return year + format + month + format + date;
      }
      return (
        year +
        (month < 10 ? "0" + month : month) +
        (date < 10 ? "0" + date : date)
      );
    },
  },
};
</script>
<style lang=""></style>
