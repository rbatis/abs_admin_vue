<template>

  <div class='dataBody'>
    <a-form
      layout='inline'
    >
      <!--<a-form-item>-->
      <!--<a-input-->
      <!--placeholder="请输入手机号"-->
      <!--v-model="queryData.phone"-->
      <!--&gt;-->
      <!--<a-icon-->
      <!--slot="prefix"-->
      <!--type="user"-->
      <!--style="color:rgba(0,0,0,.25)"-->
      <!--/>-->
      <!--</a-input>-->
      <!--</a-form-item>-->
      <a-form-item>
        <a-input
          v-model='queryData.name'
          placeholder='请输入名称'
          :allowClear='true'
        >
        </a-input>
      </a-form-item>
      <a-form-item
        :wrapper-col='{ span: 12, offset: 5 }'
      >
        <a-button
          type='primary'
          html-type='submit'
          @click='fetch_no_page'
        >
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <div class='operate'>
      <a-button type='dashed' style='width: 100%' icon='plus' @click='addData'>添加</a-button>
    </div>
    <a-table :columns='columns'
             :rowKey='record => record.id'
             :dataSource='data'
             :pagination='pagination'
             :loading='loading'
             :indentSize='15'
             childrenColumnName='childs'
             @change='handleTableChange'
    >


      <!--<template slot="rate" slot-scope="rate">-->
      <!--{{rate+'%'}}-->
      <!--</template>-->
      <template slot='action' slot-scope='scope'>
        <div style='width: 110px;'>
          <a style='padding-right: 5px;' @click='handleAddChild({"parent_id":scope.id})'>添加下级</a>
          <a-dropdown>
            <a class='ant-dropdown-link'>
              更多
              <a-icon type='down' />
            </a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a style='color: #1890ff' @click='handleEdit(scope)'>编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a style='color:#f5222d' @click='handleDelete(scope)'>删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>

      </template>
    </a-table>

    <a-modal
      :title="dialogMode==='add'?'添加':'编辑'"
      cancelText='取消'
      okText='确定'
      v-if='visible'
      v-model='visible'
      :width='500'
      :maskClosable='false'
      @ok='handleAddData'
    >
      <a-form
        labelAlign='right'
        v-bind='{
        labelCol: {
          // xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          //xs: { span: 24 },
          sm: { span: 20 },
        },
      }'
      >
        <!--        <a-form-item label='id'>-->
        <!--          <a-input-->
        <!--            style='width: 300px'-->
        <!--            v-model='dialogData.id'-->
        <!--            placeholder='请输入ID(唯一)'>-->
        <!--          </a-input>-->
        <!--        </a-form-item>-->

        <a-form-item :label="dialogData.is_menu?'菜单名称':'权限名称'">
          <a-input
            v-model='dialogData.name'
            :placeholder="dialogData.is_menu?'菜单名称':'权限名称'"
          >
          </a-input>
        </a-form-item>
        <a-form-item label='父级(选填)'>
          <a-input
            v-model='dialogData.parent_id'
            placeholder='父级id'>
          </a-input>
          <a-tag>权限集</a-tag>

          <a-spin v-if='loading_all_res' />
          <a-tree
            :disabled='loading_all_res'
            v-model='dialogData.permission_ids'
            :replace-fields="{children: 'childs', title: 'name', key: 'id'}"
            :auto-expand-parent='true'
            :tree-data='all_res'
            checkable
            :checkStrictly='true'
            @check='onResCheck'
          />
        </a-form-item>
        <a-form-item label='标识'>
          <a-input
            v-model='dialogData.permission'
            placeholder='菜单、权限标识'
          >
          </a-input>
        </a-form-item>
        <a-form-item label='是否菜单'>
          <a-row>
            <a-col>
              <a-switch checked-children='菜单'
                        un-checked-children='权限'
                        v-model='dialogData.is_menu'
                        @change='function(val){
                            if (val===false){
                               dialogData.path = "";
                            }
                        }'
              ></a-switch>
            </a-col>
            <a-col>
              <a-input
                :disabled='!dialogData.is_menu'
                v-model='dialogData.path'
                placeholder='填写路径为菜单！'>
              </a-input>
            </a-col>
          </a-row>
        </a-form-item>

      </a-form>


    </a-modal>
  </div>

</template>

<script>
const columns = [
  {
    title: 'id',
    dataIndex: 'id'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '名称',
    dataIndex: 'name'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '权限标识',
    dataIndex: 'permission'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '路由',
    dataIndex: 'path'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '创建时间',
    dataIndex: 'create_date'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '操作',
    // dataIndex: 'create_time',
    scopedSlots: { customRender: 'action' }
  }
]


import { res_add, res_delete, res_page, res_update, sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'

export default {
  mounted() {
    this.fetch()
  },
  data() {
    return {
      data: [],
      pagination: {},
      loading: false,
      columns,

      queryData: {
        id: null,
        name: null,
        page_no: 1,
        page_size: 5
      },
      dialogData: {
        id: null,
        value: null,
        is_menu: false,
        permission_ids: []
      },
      visible: false,
      dialogMode: 'add',
      all_res: [],
      loading_all_res: false,
    }
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      pager.pageSize = 5
      this.pagination = pager
      this.queryData.page_no = pagination.current
      this.fetch()
    },
    fetch_no_page() {
      this.pagination.current = 1
      this.queryData.page_no = 1
      this.queryData.page_size = 5
      this.fetch()
    },
    fetch() {
      this.loading = true
      var arg = Object.assign({}, this.queryData)
      if (arg.time_start != null) {
        arg.time_start = arg.time_start.format('YYYY-MM-DDThh:mm:ss')
      }
      if (arg.time_end != null) {
        arg.time_end = arg.time_end.format('YYYY-MM-DDThh:mm:ss')
      }
      //取分页数据
      res_page(arg).then((res) => {
        //alert(JSON.stringify(res))
        const pagination = { ...this.pagination }
        this.loading = false
        this.data = res.data.records
        pagination.total = res.data.total
        pagination.pageSize = res.data.page_size
        this.pagination = pagination
      })
    },

    addData: function() {
      this.handleDialogCancel()
      this.getAllRes()
      this.visible = true
      this.dialogMode = 'add'
    },
    //处理添加产品
    handleAddData: function() {
      if (this.dialogData.is_menu === false) {
        this.dialogData.path = null
      }
      if (this.dialogMode === 'add') {
        res_add(this.dialogData)
          .then((res) => {
            showMsg(this, res)
            this.visible = false
            this.fetch()
          })
      } else if (this.dialogMode === 'edit') {
        res_update(this.dialogData)
          .then((res) => {
            //showMsg(this, res)
            this.visible = false
            this.fetch()
          })
      }
    },
    handleAddChild: function(scope) {
      this.getAllRes();
      this.visible = true
      this.dialogMode = 'add'
      this.dialogData = Object.assign({ is_menu: scope.path === null, permission_ids: [] }, scope)
      if (this.dialogData.parent_id === '') {
        this.dialogData.parent_id = null
      }
      if (scope.parent_id !== null) {
        this.dialogData.permission_ids = [scope.parent_id]
      }
    },
    //handleEdit
    handleEdit: function(scope) {
      this.getAllRes(scope.id)
      this.visible = true
      this.dialogMode = 'edit'
      this.dialogData = Object.assign({ is_menu: scope.path === null, permission_ids: [] }, scope)
      if (scope.parent_id !== null) {
        this.dialogData.permission_ids = [scope.parent_id]
      }
      if (this.dialogData.parent_id === '') {
        this.dialogData.parent_id = null
      }
      if (this.dialogData.path === null) {
        this.dialogData.is_menu = false
      } else {
        this.dialogData.is_menu = true
      }
    },
    handleDelete: function(scope) {
      let self = this
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          res_delete(scope)
            .then((res) => {
              showMsg(self, res)
              self.visible = false
              self.fetch()
            })
        },
        onCancel() {
          // console.log('Cancel');
        },
        class: 'test'
      })
    },
    handleDialogCancel: function() {
      this.dialogData = {
        id: null,
        remark: null,
        value: null,
        is_menu: false,
        permission_ids: []
      }
    },
    onResCheck: function(data) {
      let len = data.checked.length
      if (len >= 1) {
        this.dialogData.permission_ids = { 'checked': [data.checked[len - 1]], 'halfChecked': [] }
        this.dialogData.parent_id = data.checked[len - 1]
      } else {
        this.dialogData.permission_ids = []
        this.dialogData.parent_id = null
      }
    },
    getAllRes: function(skipId) {
      this.loading_all_res = true;
      sys_permission_layer_top({})
        .then((res) => {
          this.loading_all_res = false;
          let arr = []
          for (let index = 0; index < res.data.length; index++) {
            let item = res.data[index]
            if (skipId !== undefined && skipId !== null && item.id === skipId) {
              //nothing
            } else {
              arr.push(item)
            }
          }
          this.all_res = arr;
        }).catch((e)=>{
        this.loading_all_res = false;
      })
    }

  }
}
</script>

<style lang='less'>
.dataBody {
  background: #ffffff;
  padding: 10px;
}
</style>