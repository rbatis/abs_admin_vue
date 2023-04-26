export function showMsg (self, res) {
    if (res != null && res.code !== undefined) {
       if (res.code === 'SUCCESS') {
         
       } else {
         self.$message.error(res.msg)
       }
    }
}
