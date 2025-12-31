import { message } from 'ant-design-vue'

interface ApiResponse {
  code: string
  msg?: string
  data?: any
}

export function showMsg(ctx: any, res: ApiResponse): void {
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
