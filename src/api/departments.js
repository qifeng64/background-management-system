import request from "@/utils/request";

/* 
    获取组织架构的数据 封装接口
*/
export function getDepartments() {
  return request({
    url: "/company/department",
    // 默认类型就是get，不用写方法
  });
}

/**
 *  删除组织架构的部门
 */
export function delDepartments(id) {
  return request({
    url: `/company/department/${id}`,
    // 接口满足restful接口规范 同样的地址 不同的方法 执行不同的业务
    /* delete删除业务
       get  获取业务
       post 新增火添加业务
       put  修改业务
     */
    method: "delete",
  });
}

/**
 * 新增部门
 */
export function addDepartments(data) {
  return request({
    // 满足restful接口规范 同样的地址 不同的方法 执行不同的业务
    url: "/company/department",
    method: "post",
    data, // axios的body参数 data
  });
}

/**
 * 获取部门详情 编辑时显示
 */
export function getDepartDetail(id) {
  return request({
    url: `/company/department/${id}`,
  });
}

/**
 * 保存编辑的数据 新增和编辑共用弹层 完善编辑时的确认按钮 data:编辑后的数据
 */
export function updateDepartments(data) {
  return request({
    url: `/company/department/${data.id}`,
    method: "put",
    data,
  });
}
