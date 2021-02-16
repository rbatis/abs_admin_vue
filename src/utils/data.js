export function showMsg(self,res) {
    if (res!= null  && res!=undefined && res.code != undefined) {
       if (res.code==="SUCCESS"){
         self.$notification['success']({
           message: '成功',
           description: res.msg,
         });
       }else{
         self.$notification['info']({
           message: '失败',
           description: res.msg,
         });
       }
    }
}