export function showMsg(self,res) {
    if (res != null && res.code !== undefined) {
       if (res.code==="SUCCESS"){
         self.$message.info(res.msg);
       }else{
         self.$message.error(res.msg);
       }
    }
}