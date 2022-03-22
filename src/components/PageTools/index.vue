<template>
  <el-card class="page-tools">
    <el-row type="flex" justify="between" align="middle">
      <el-col>
        <!-- 前插槽 showBefore控制图标的显示和隐藏 -->
        <!-- 定义一个插槽 有名字的叫具名插槽 没名字的叫匿名插槽  -->
        <div v-if="showBefore" class="before">
          <i class="el-icon-info" />
          <slot name="before" />
        </div>
      </el-col>
      <el-col>
        <!-- 再加一个el-row 不然会将行平分后向左对齐 -->
        <el-row type="flex" justify="end">
          <!-- 后插槽 -->
          <slot name="after" />
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
export default {
  props: {
    // 如果左侧内容不传 图标应该不显示
    showBefore: {
      default: false,
      type: Boolean,
    },
  },
};
</script>
<style lang="scss">
.page-tools {
  margin: 10px 0;
  .before {
    line-height: 34px;
    i {
      margin-right: 5px;
      color: #409eff;
    }
    display: inline-block;
    padding: 0px 10px;
    border-radius: 3px;
    border: 1px solid rgba(145, 213, 255, 1);
    background: rgba(230, 247, 255, 1);
  }
}
</style>
