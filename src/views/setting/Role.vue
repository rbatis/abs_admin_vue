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
        labelAlign="right"
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

        <a-form-item label='名称'>
          <a-input
            v-model='dialogData.name'
            placeholder='名称'>
          </a-input>
        </a-form-item>
        <a-form-item label='权限集'>
          <a-spin v-if='loading_all_res' />
          <a-tree
            :disabled='loading_all_res'
            v-model='dialogData.resource_ids'
            :selected-keys="dialogData.resource_ids"
            :replace-fields="{children: 'childs', title: 'name', key: 'id'}"
            :auto-expand-parent="true"
            :tree-data="all_res"
            :checkable='true'
          />
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

import { role_add, role_delete, role_page, role_update,sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'
export default {
  mounted() {
    this.fetch()
    this.getAllRes()
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
        page_size: 5,
      },
      dialogData: {
        id: null,
        value: null,
      },
      visible: false,
      dialogMode: 'add',
      all_res:[],
      loading_all_res:false,
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
      role_page(arg).then((res) => {
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
      this.visible = true
      this.dialogMode = 'add'
    },
    //处理添加产品
    handleAddData: function() {
      if (this.dialogMode === 'add') {
        role_add(this.dialogData)
          .then((res) => {
            showMsg(this, res)
            this.visible = false
            this.fetch()
          })
      } else if (this.dialogMode === 'edit') {
        role_update(this.dialogData)
          .then((res) => {
            //showMsg(this, res)
            this.visible = false
            this.fetch()
          })
      }
    },
    handleAddChild: function(scope) {
      this.visible = true
      this.dialogMode = 'add'
      this.dialogData = Object.assign({}, scope)
    },
    //handleEdit
    handleEdit: function(scope) {
      this.visible = true
      this.dialogMode = 'edit'
      this.dialogData = Object.assign({  }, scope)
    },
    handleDelete: function(scope) {
      let self = this
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          role_delete(scope)
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
        value: null
      }
    },
    getAllRes: function() {
      this.loading_all_res = true;
      sys_permission_layer_top({})
        .then((res) => {
            this.all_res = res.data;
          this.loading_all_res = false;
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