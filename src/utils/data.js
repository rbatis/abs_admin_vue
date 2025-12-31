import { message } from 'ant-design-vue'

export function showMsg(ctx, res) {
  if (res != null && res.code !== undefined) {
    if (res.code === '0') {
      message.success(res.msg || '操作成功')
    } else {
      ctx.$message?.error(res.msg || '操作失败')
      if (!ctx.$message) {
        message.error(res.msg || '操作失败')
      }
    }
  }
}
