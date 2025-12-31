<template>
  <AdminLayout>
    <div class="dataBody">
      <a-form layout="inline">
        <a-form-item>
          <a-input v-model:value="queryData.name" placeholder="请输入名称" :allowClear="true" />
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="queryData.code" placeholder="请输入编码" :allowClear="true" />
        </a-form-item>
        <a-form-item>
          <a-button-group>
            <a-button type="primary" @click="fetch_no_page">查询</a-button>
            <a-button @click="handleAdd()">添加</a-button>
          </a-button-group>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :rowKey="record => record.id"
        :dataSource="data"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'state'">
            <a-tag :color="record.state === 1 ? 'blue' : 'default'">{{ STATE[record.state] }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <div class="flex gap-2">
              <a class="text-blue-500" @click="handleEdit(record)">编辑</a>
              <a-dropdown>
                <a class="text-gray-600">更多 <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a class="text-red-500" @click="handleDelete(record)">删除</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>

      <a-modal
        :title="dialogMode === 'add' ? '添加' : '编辑'"
        v-model:open="visible"
        :width="500"
        :maskClosable="false"
        centered
        :confirmLoading="dialogLoading"
        @ok="handleAddData"
      >
        <a-form
          ref="formAddRef"
          labelAlign="right"
          :model="dialogData"
          :rules="rules"
          :label-col="{ sm: { span: 4 } }"
          :wrapper-col="{ sm: { span: 20 } }"
        >
          <a-form-item label="id" name="id">
            <a-input v-model:value="dialogData.id" placeholder="请输入id" />
          </a-form-item>
          <a-form-item label="名称" name="name">
            <a-input v-model:value="dialogData.name" placeholder="请输入名称" />
          </a-form-item>
          <a-form-item label="编码" name="code">
            <a-textarea :rows="4" v-model:value="dialogData.code" placeholder="请输入编码" />
          </a-form-item>
          <a-form-item label="启用/停用" name="state">
            <a-radio-group v-model:value="dialogData.state">
              <a-radio :value="1">{{ STATE[1] }}</a-radio>
              <a-radio :value="0">{{ STATE[0] }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { dictAdd, dictDelete, dictPage, dictUpdate } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const STATE = ['停用', '启用']
const RULE_REQUIRED = { required: true, message: '请输入编码', trigger: 'blur' }

const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '编码', dataIndex: 'code' },
  { title: '状态', dataIndex: 'state' },
  { title: '创建时间', dataIndex: 'create_date' },
  { title: '操作', dataIndex: 'action' }
]

const data = ref([])
const loading = ref(false)
const visible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref('add')
const formAddRef = ref()

const queryData = reactive({
  name: null,
  code: null,
  page_no: 1,
  page_size: 5
})

const dialogData = reactive({
  id: null,
  name: null,
  code: null,
  parent_id: null,
  state: 1
})

const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})

const rules = {
  name: [RULE_REQUIRED],
  code: [RULE_REQUIRED]
}

function handleTableChange(pag) {
  pagination.current = pag.current
  queryData.page_no = pag.current
  fetch()
}

function fetch_no_page() {
  pagination.current = 1
  queryData.page_no = 1
  fetch()
}

function fetch() {
  loading.value = true
  const arg = { ...queryData }
  if (arg.name === '') arg.name = null
  if (arg.code === '') arg.code = null

  dictPage(arg).then((res) => {
    loading.value = false
    data.value = res.data.records
    pagination.total = res.data.total
    pagination.pageSize = res.data.page_size
  })
}

function handleAdd() {
  dialogMode.value = 'add'
  queryData.page_no = 1
  queryData.name = null
  queryData.code = null
  Object.assign(dialogData, { id: null, name: null, code: null, parent_id: null, state: 1 })
  visible.value = true
}

async function handleAddData() {
  dialogLoading.value = true
  try {
    await formAddRef.value.validate()
    if (dialogMode.value === 'add') {
      await dictAdd(dialogData)
    } else {
      await dictUpdate(dialogData)
    }
    visible.value = false
    fetch()
  } catch (e) {
    // 失败时不关闭对话框，错误已在拦截器中处理
  } finally {
    dialogLoading.value = false
  }
}

function handleEdit(scope) {
  dialogMode.value = 'edit'
  visible.value = true
  Object.assign(dialogData, scope)
  if (dialogData.parent_id === '') {
    dialogData.parent_id = null
  }
}

function handleDelete(scope) {
  Modal.confirm({
    title: '你确定要删除?',
    content: `${scope.code} - ${scope.name}`,
    onOk() {
      return dictDelete(scope).then((res) => {
        showMsg({ message }, res)
        visible.value = false
        fetch()
      })
    }
  })
}

onMounted(() => {
  fetch()
})
</script>

<style lang="less">
.dataBody {
  background: #ffffff;
  padding: 10px;
}
</style>
