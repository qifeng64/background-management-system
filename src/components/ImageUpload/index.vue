<template lang="">
  <div>
    <!-- 自带的上传组件 list-type="picture-card"设置呈现效果 -->
    <!-- limit限制上传的数量 
    action为上传地址 这里我们要自定义 所以给action一个# 就不会报错了 -->
    <!-- file-list是上传的文件列表 可以绑定到上传组件上 让上传组件来显示 -->
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :beforeUpload="beforeUpload"
      :http-request="upload"
      :file-list="fileList"
      :class="{ disabled: fileComputed }"
    >
      <!-- +号图标 -->
      <i class="el-icon-plus"></i>
    </el-upload>
    <!-- 图片上传进度条 -->
    <el-progress
      v-if="showPercent"
      :percentage="percent"
      style="width: 180px"
    />
    <!-- 放置一个预览弹层组件 -->
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <img :src="imgUrl" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>
<script>
// 在package.json中查看 引入腾讯云COS包
import COS from "cos-js-sdk-v5";
// 实例化COS对象
const cos = new COS({
  SecretId: "AKIDhEVVFiuoSpvlMgjV0ECtJSKvFJ6dtrgE", // 身份识别 ID
  SecretKey: "MRGo54nGTP6WS8WeV5OQBeqmRpwlKdgS", // 身份秘钥
});
export default {
  data() {
    return {
      fileList: [],
      showDialog: false,
      imgUrl: "",
      currentFileUid: "", // 设置变量 在上传之前将上传图片的UID保存下来
      percent: 0, // 当前上传进度的百分条
      showPercent: false, // 控制进度条的显示
    };
  },
  computed: {
    // 如果为true 表示不应该再显示+号上传
    fileComputed() {
      return this.fileList.length === 1;
    },
  },
  methods: {
    // 点击预览事件
    preview(file) {
      //   console.log(file);
      this.imgUrl = file.url;
      this.showDialog = true;
    },
    // file是删除的文件 fileList是删除后的文件 this.fileList无变化需要更新
    handleRemove(file, fileList) {
      /* console.log(file);
      console.log(fileList);
      console.log(this.fileList); */
      // 将当前的删除文件排除在外
      // this.fileList = this.fileList.filter((item) => item.uid !== file.uid);
      this.fileList = fileList;
    },
    changeFile(file, fileList) {
      // file是当前的文件 fileList是当前的最新数组
      // console.log(file);
      // console.log(fileList.length);
      // console.log(this.fileList);
      // 不能用push 这个钩子会执行多次 this.fileList.push(file);
      this.fileList = fileList.map((item) => item);
      // 因为上传不成功 所有第二次进来的数据 一定是个空
      // 上传成功 => 数据才能进来 => 腾讯云cos
    },
    // 上传之前检查
    beforeUpload(file) {
      console.log(file);
      // 检查文件类型 先定义可上传的文件类型列表
      const types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      if (!types.some((item) => item === file.type)) {
        this.$message.error("上传图片只能是 JPG、GIF、BMP、PNG 格式!");
        // 如果不存在 不可上传 => 上传终止
        return false;
      }
      // 检查文件大小5M  1M =1024KB 1KB = 1024B
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        // 超过限制的文件大小
        this.$message.error("上传的图片大小不能大于5M");
        return false;
      }
      // 已经确认上传的就是当前的这个file
      this.currentFileUid = file.uid; // 记录上传的UID
      this.showPercent = true;
      return true; // 最后一定要return true
    },
    upload(params) {
      // console.log(params); 需要的是params中的file参数
      if (params.file) {
        // 执行上传操作 腾讯云文档
        cos.putObject(
          {
            // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
            Bucket: "background-management-1310435310", // 存储桶
            Region: "ap-beijing", // 地域
            Key: params.file.name, // 文件名
            Body: params.file, // 要上传的文件对象
            StorageClass: "STANDARD", // 上传的模式类型 直接默认 标准模式即可
            onprogress: (params) => {
              // console.log(params); params中的percent属性
              this.percent = params.percent * 100; // 赋值
            }, // 进度条的回调函数
          },
          // 因为下面用了this，这里要变成箭头函数
          // function (err, data) {
          (err, data) => {
            // data返回数据之后 应该如何处理
            console.log(err || data);
            // data中有一个statusCode === 200 的时候说明上传成功
            if (!err && data.statusCode === 200) {
              // 此时说明文件上传成功 要获取成功的返回地址并将其赋给fileLis中
              // 的url fileList是一个数组 需要知道上传成功的是哪一张图片
              this.fileList = this.fileList.map((item) => {
                if (item.uid === this.currentFileUid) {
                  // 找到则返回在腾讯云COS中对应的地址
                  return { url: "http://" + data.Location, upload: true };
                  // 添加一个属性 upload为true表示这张图片已经上传完毕 为后期应用的时候做标记
                  // 保存  => 图片有大有小 => 上传速度有快又慢 =>要根据有没有upload这个标记来决定是否去保存
                }
                return item;
              });
            }
            // 上传成功后关闭进度条 重置百分比
            // 由于小文件上传速度太快 设置延时1s后执行
            setTimeout(() => {
              this.showPercent = false;
              this.percent = 0;
            }, 1000);
          }
        );
      }
    },
  },
};
</script>
<style>
.disabled .el-upload--picture-card {
  display: none;
}
</style>
