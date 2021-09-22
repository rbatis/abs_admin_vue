<template>
  <div class="dataBody">
    <a-form-model layout="inline">
      <a-form-model-item>
        <a-input
          v-model="queryData.name"
          placeholder="请输入名称"
          :allowClear="true"
        >
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-input
          v-model="queryData.code"
          placeholder="请输入编码"
          :allowClear="true"
        >
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button-group>
          <a-button
            type="primary"
            html-type="submit"
            @click="fetch_no_page"
          >
            查询
          </a-button>
          <a-button @click="handleAdd()">添加</a-button>
        </a-button-group>
      </a-form-model-item>
    </a-form-model>
    <a-table
      :columns="columns"
      :rowKey="record => record.id"
      :dataSource="data"
      :pagination="pagination"
      :loading="loading"
      :indentSize="15"
      childrenColumnName="childs"
      @change="handleTableChange"
    >
      <template #state="value, record">{{ STATE[+value] }}</template>
      <template slot="action" slot-scope="scope">
        <div style="width: 110px;">
          <a-dropdown>
            <a class="ant-dropdown-link">更多<a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a style="color: #1890ff" @click="handleEdit(scope)">编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a style="color:#f5222d" @click="handleDelete(scope)">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </template>
    </a-table>

    <a-modal
      :title="dialogMode==='add'?'添加':'编辑'"
      cancelText="取消"
      okText="确定"
      v-if="visible"
      v-model="visible"
      :width="500"
      :maskClosable="false"
      centered
      @ok="handleAddData"
    >
      <a-form-model
        ref="formAdd"
        labelAlign="right"
        :model="dialogData"
        :rules="rules"
        v-bind="{ labelCol: { sm: { span: 4 }, }, wrapperCol: { sm: { span: 20 }, } }"
      >
        <a-form-model-item label="名称" prop="name">
          <a-input v-model="dialogData.name" placeholder="请输入名称"></a-input>
        </a-form-model-item>
        <a-form-model-item label="编码" prop="code">
          <a-input v-model="dialogData.code" placeholder="请输入编码"></a-input>
        </a-form-model-item>
        <a-form-model-item label="启用/停用" prop="state">
          <a-radio-group v-model="dialogData.state">
            <a-radio :value="1">{{ STATE[1] }}</a-radio>
            <a-radio :value="0">{{ STATE[0] }}</a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>

</template>

<script>
import { dictAdd, dictDelete, dictPage, dictUpdate } from '@/api/manage'
import { showMsg } from '@/utils/data'
const columns = [
  // { title: 'id', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '编码', dataIndex: 'code' },
  { title: '状态', dataIndex: 'state', scopedSlots: { customRender: 'state' } },
  { title: '创建时间', dataIndex: 'create_date' },
  { title: '操作', scopedSlots: { customRender: 'action' } }
]
const RULE_REQUIRED = { required: true, message: '请输入编码', trigger: 'blur' }
const STATE = ['停用', '启用']

export default {
  data () {
    return {
      STATE,
      data: [],
      pagination: {},
      loading: false,
      columns,

      queryData: {
        name: null,
        code: null,
        page_no: 1,
        page_size: 5
      },
      dialogData: { id: null, name: null, code: null, parent_id: null, state: 1 },
      visible: false,
      all_res: [],
      loading_all: false,
      rules: {
        name: [RULE_REQUIRED],
        code: [RULE_REQUIRED]
      },
      dialogMode: 'add'
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      pager.pageSize = 5
      this.pagination = pager
      this.queryData.page_no = pagination.current
      this.fetch()
    },
    fetch_no_page () {
      this.pagination.current = 1
      this.queryData.page_no = 1
      this.queryData.page_size = 5
      this.fetch()
    },
    fetch () {
      this.loading = true
      var arg = Object.assign({}, this.queryData)
      if (arg.time_start != null) {
        arg.time_start = arg.time_start.format('YYYY-MM-DDThh:mm:ss')
      }
      if (arg.time_end != null) {
        arg.time_end = arg.time_end.format('YYYY-MM-DDThh:mm:ss')
      }
      // 取分页数据
      dictPage(arg).then((res) => {
        const pagination = { ...this.pagination }
        this.loading = false
        this.data = res.data.records
        pagination.total = res.data.total
        pagination.pageSize = res.data.page_size
        this.pagination = pagination
      })
    },


    handleAdd: function (scope) {
      this.queryData = { id: null, name: null, code: null, parent_id: null, state: 1 };
      if (scope && scope.id) this.dialogData.parent_id = scope.id
      this.visible = true
    },
    handleAddData: function () {
      this.$refs.formAdd && this.$refs.formAdd.validate(valid => {
        if (!valid) return
        if (this.dialogMode === 'add') {
          dictAdd(this.dialogData)
            .then((res) => {
              showMsg(this, res)
              this.visible = false
              this.fetch()
            })
        } else if (this.dialogMode === 'edit') {
          dictUpdate(this.dialogData)
            .then((res) => {
              this.visible = false
              this.fetch()
            })
        }
      })
    },
    handleEdit: function (scope) {
      this.dialogMode = 'edit';
      this.visible = true
      this.dialogData = Object.assign({}, scope)
      if (this.dialogData.parent_id === '') {
        this.dialogData.parent_id = null
      }
    },
    handleDelete: function (scope) {
      const self = this
      this.$confirm({
        title: '你确定要删除?',
        content: `${scope.code} - ${scope.name}`,
        onOk () {
          dictDelete(scope)
            .then((res) => {
              showMsg(self, res)
              self.visible = false
              self.fetch()
            })
        }
      })
    },
  }
}
</script>
