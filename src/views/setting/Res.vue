<template>

  <div class='productBody'>
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
          placeholder='请输入权限名称'
          :allowClear="true"
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
             childrenColumnName = "childs"
             @change='handleTableChange'
    >


      <!--<template slot="rate" slot-scope="rate">-->
      <!--{{rate+'%'}}-->
      <!--</template>-->
      <template slot='action' slot-scope='scope'>
        <div style='width: 110px;' >
          <a style='padding-right: 10px;' @click='handleAddChildProduct({"parent_id":scope.id})'>添加</a>
          <a-dropdown>
            <a class='ant-dropdown-link'>
              更多
              <a-icon type='down' />
            </a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a style='color: #1890ff' @click='handleEditProduct(scope)'>编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a style='color:#f5222d' @click='handleDeleteProduct(scope)'>删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>

      </template>
    </a-table>

    <a-modal
      title='添加'
      v-model='visible'
      :width='500'
      :maskClosable='false'
      @ok='handleAddData'

    >
      <a-form
        :labelAlign='right'
        v-bind="{
        labelCol: {
          // xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          //xs: { span: 24 },
          sm: { span: 20 },
        },
      }"
      >
<!--        <a-form-item label='id'>-->
<!--          <a-input-->
<!--            style='width: 300px'-->
<!--            v-model='dialogData.id'-->
<!--            placeholder='请输入ID(唯一)'>-->
<!--          </a-input>-->
<!--        </a-form-item>-->

        <a-form-item  label='权限名称'>
          <a-input
            v-model='dialogData.name'
            placeholder='权限名称'>
          </a-input>
        </a-form-item>
        <a-form-item label='父级ID'>
          <a-input
            v-model='dialogData.parent_id'
            placeholder='父级id'>
          </a-input>
        </a-form-item>
        <a-form-item label='权限标识'>
          <a-input
            v-model='dialogData.permission'
            placeholder='权限标识'>
          </a-input>
        </a-form-item>
        <a-form-item  label='是否菜单' >
          <a-row>
            <a-col>
              <a-switch v-model='dialogData.is_menu'></a-switch>
            </a-col>
            <a-col>
              <a-input
                :disabled='!dialogData.is_menu'
                v-model='dialogData.path'
                placeholder='路径'>
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
    dataIndex: 'id',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '名称',
    dataIndex: 'name',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '路由',
    dataIndex: 'path',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '创建时间',
    dataIndex: 'create_date',
    // scopedSlots: {customRender: 'name'},
  },
  {
    title: '操作',
    // dataIndex: 'create_time',
    scopedSlots: { customRender: 'action' }
  }
]


import { res_page, res_add, res_update, res_delete } from '@/api/manage'
import { showMsg } from '@/utils/data'
import moment from 'moment'

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
      },
      visible: false,
      dialogMode: 'add',

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
      this.visible = true;
      this.dialogMode = 'add';
    },
    //处理添加产品
    handleAddData: function() {
      if (this.dialogMode === 'add') {
         res_add(this.dialogData)
          .then((res) => {
            showMsg(this, res)
            this.visible = false;
            this.fetch();
          })
      } else if (this.dialogMode === 'edit') {
        res_update(this.dialogData)
          .then((res) => {
            //showMsg(this, res)
            this.visible = false;
            this.fetch();
          })
      }
    },
    handleAddChildProduct: function(scope) {
      this.visible = true
      this.dialogMode = 'add'
      this.dialogData = Object.assign({ is_menu:scope.path === null}, scope)
    },
    //handleEditProduct
    handleEditProduct: function(scope) {
      this.visible = true
      this.dialogMode = 'edit'
      this.dialogData = Object.assign({is_menu:scope.path === null}, scope)
      if (this.dialogData.path === null){
        this.dialogData.is_menu = false;
      }else{
        this.dialogData.is_menu = true;
      }
    },
    handleDeleteProduct: function(scope) {
      let self = this
      this.$confirm({
        title: '你确定要删除?',
        content: '你确定要删除！',
        onOk() {
          res_delete(scope)
            .then((res) => {
              showMsg(self, res)
              self.visible = false;
              self.fetch();
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
      }
    },

  }
}
</script>

<style lang='less'>
.productBody {
  background: #ffffff;
  padding: 10px;
}
</style>