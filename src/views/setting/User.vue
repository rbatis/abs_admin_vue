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
      <div
        slot='expandedRowRender'
        slot-scope='record'
        style='margin: 0'>
        <a-tag color='blue'>角色名称: {{ record.role.name }}</a-tag>
        <a-tree
          :selected-keys='[]'
          :replace-fields="{  children: 'childs',  title: 'name',   key: 'id' }"
          :autoExpandParent='true'
          :tree-data='[record.role]'
        />
      </div>


      <!--<template slot="rate" slot-scope="rate">-->
      <!--{{rate+'%'}}-->
      <!--</template>-->
      <template slot='state' slot-scope='state'>
        <a-tag color='blue'>{{ state == 1 ? '启用' : '禁用' }}</a-tag>
      </template>
      <template slot='action' slot-scope='scope'>
        <div style='width: 110px;'>
          <a style='color:#f5222d' @click='handleDelete(scope)'>禁用</a>
          <a-dropdown style='margin-left: 5px'>
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
      title='添加'
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

        <a-form-item label='名称'>
          <a-input
            v-model='dialogData.name'
            placeholder='名称'>
          </a-input>
        </a-form-item>
        <a-form-item label='角色集'>
          <a-tree
            v-model='dialogData.role_ids'
            :replace-fields="{ children: 'childs', title: 'name', key: 'id'  }"
            checkable
            :auto-expand-parent='true'
            :tree-data='all_role'
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
    title: '账号',
    dataIndex: 'account'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '角色名称',
    dataIndex: 'role.name'
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '状态',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
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

import { sys_role_layer_top, sys_user_add, sys_user_delete, sys_user_page, sys_user_update } from '@/api/manage'
import { showMsg } from '@/utils/data'

export default {
  mounted() {
    this.fetch()
    this.getAllRole()
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
        role_ids: []
      },
      visible: false,
      dialogMode: 'add',
      all_role: []
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
      sys_user_page(arg).then((res) => {
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
      if (this.dialogData.role_ids.length >= 1) {
        this.dialogData.role_id = this.dialogData.role_ids[0];
      } else {
        this.dialogData.role_id = null;
      }
      if (this.dialogMode === 'add') {
        sys_user_add(this.dialogData)
          .then((res) => {
            showMsg(this, res)
            this.visible = false
            this.fetch()
          })
      } else if (this.dialogMode === 'edit') {
        sys_user_update(this.dialogData)
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
      if (scope.role !== undefined && scope.role !== null) {
        this.dialogData = Object.assign({ role_ids: [scope.role.id] }, scope)
      } else {
        this.dialogData = Object.assign({ role_ids: [] }, scope)
      }
    },
    //handleEdit
    handleEdit: function(scope) {
      this.visible = true
      this.dialogMode = 'edit'
      if (scope.role !== undefined && scope.role !== null) {
        this.dialogData = Object.assign({ role_ids: [scope.role.id] }, scope)
      } else {
        this.dialogData = Object.assign({ role_ids: [] }, scope)
      }
    },
    handleDelete: function(scope) {
      let self = this
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          sys_user_delete(scope)
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
    getAllRole: function() {
      sys_role_layer_top({})
        .then((res) => {
          this.all_role = res.data
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