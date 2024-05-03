export function showMsg (self, res) {
    if (res != null && res.code !== undefined) {
       if (res.code === '0') {
         
       } else {
         self.$message.error(res.msg)
       }
    }
}
