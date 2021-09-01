export function showMsg (self, res) {
    if (res != null && res.code !== undefined) {
       if (res.code === 'SUCCESS') {
         self.$message.info('成功')
       } else {
         self.$message.error(res.msg)
       }
    }
}
