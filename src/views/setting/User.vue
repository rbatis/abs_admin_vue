<template>
  <AdminLayout>
    <div class="dataBody">
    <a-form layout="inline">
      <a-form-item>
        <a-input v-model:value="queryData.account" placeholder="请输入账号" :allowClear="true" :maxLength="11" />
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="queryData.name" placeholder="请输入名称" :allowClear="true" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="fetch_no_page">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="operate">
      <a-button type="dashed" style="width: 100%" @click="addData">
        <PlusOutlined /> 添加
      </a-button>
    </div>
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
          <a-tag v-if="record.state === 1" color="blue">启用</a-tag>
          <a-tag v-else>禁用</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="flex gap-2">
            <a class="text-red-500" @click="handleEnableDisable(record)">
              {{ record.state === 0 ? '启用' : '禁用' }}
            </a>
            <a-dropdown>
              <a class="text-gray-600">更多 <DownOutlined /></a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a class="text-blue-500" @click="handleEdit(record)">编辑</a>
                  </a-menu-item>
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
      :confirmLoading="dialogLoading"
      @ok="handleAddData"
    >
      <a-form labelAlign="right" :label-col="{ sm: { span: 4 } }" :wrapper-col="{ sm: { span: 20 } }">
        <a-form-item label="姓名">
          <a-input v-model:value="dialogData.name" placeholder="姓名" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="dialogData.account" :maxLength="11" :disabled="dialogMode !== 'add'" placeholder="账号/手机号" />
        </a-form-item>
        <a-form-item label="角色集">
          <a-tree
            v-model:checkedKeys="dialogData.role_ids"
            :field-names="{ children: 'childs', title: 'name', key: 'id' }"
            checkable
            :auto-expand-parent="true"
            :tree-data="all_role"
            :checkStrictly="true"
            @check="onRolesCheck"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { sys_role_layer_top, sys_user_add, sys_user_remove, sys_user_page, sys_user_update } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '账号', dataIndex: 'account' },
  { title: '角色名称', dataIndex: ['role', 'name'] },
  { title: '状态', dataIndex: 'state' },
  { title: '创建时间', dataIndex: 'create_date' },
  { title: '操作', dataIndex: 'action' }
]

const data = ref([])
const loading = ref(false)
const visible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref('add')
const all_role = ref([])

const queryData = reactive({
  account: null,
  name: null,
  page_no: 1,
  page_size: 5
})

const dialogData = reactive({
  id: null,
  name: null,
  account: null,
  role_ids: [],
  role_id: null
})

const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})

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

async function fetch() {
  loading.value = true
  try {
    const arg = { ...queryData }
    if (arg.account === '') arg.account = null
    if (arg.name === '') arg.name = null

    const res = await sys_user_page(arg)
    loading.value = false
    data.value = res.data.records
    pagination.total = res.data.total
    pagination.pageSize = res.data.page_size
  } catch (err) {
    loading.value = false
    // 错误已在拦截器中处理
  }
}

function addData() {
  handleDialogCancel()
  visible.value = true
  dialogMode.value = 'add'
}

async function handleAddData() {
  dialogLoading.value = true
  try {
    if (dialogMode.value === 'add') {
      await sys_user_add(dialogData)
    } else if (dialogMode.value === 'edit') {
      await sys_user_update(dialogData)
    }
    // 成功后关闭对话框并刷新列表
    visible.value = false
    fetch()
  } catch (err) {
    // 失败时不关闭对话框，错误已在拦截器中处理
  } finally {
    dialogLoading.value = false
  }
}

function handleEdit(scope) {
  visible.value = true
  dialogMode.value = 'edit'
  if (scope.role !== undefined && scope.role !== null) {
    Object.assign(dialogData, { role_ids: [scope.role.id], role_id: scope.role.id }, scope)
  } else {
    Object.assign(dialogData, { role_ids: [], role_id: null }, scope)
  }
}

function handleDelete(scope) {
  Modal.confirm({
    title: '你确定要删除?',
    content: '你确定要删除！',
    onOk() {
      return sys_user_remove(scope).then((res) => {
        showMsg({ message: {} }, res)
        visible.value = false
        fetch()
      })
    }
  })
}

function handleEnableDisable(scope) {
  Modal.confirm({
    title: scope.state === 0 ? `你确定要启用账号:${scope.name}?` : `你确定要禁用账号:${scope.name}?`,
    async onOk() {
      const state_old = scope.state
      const new_state = scope.state === 0 ? 1 : 0
      // 先更新到服务器
      try {
        await sys_user_update({ ...scope, state: new_state })
        // 成功后才更新本地状态和刷新列表
        fetch()
      } catch (err) {
        // 失败时不修改状态，错误已在拦截器中处理
      }
    }
  })
}

function handleDialogCancel() {
  Object.assign(dialogData, {
    id: null,
    name: null,
    account: null,
    role_ids: [],
    role_id: null
  })
}

function getAllRole() {
  sys_role_layer_top({}).then((res) => {
    all_role.value = res.data
  })
}

function onRolesCheck(data) {
  const len = data.checked.length
  if (len >= 1) {
    dialogData.role_ids = { checked: [data.checked[len - 1]], halfChecked: [] }
    dialogData.role_id = data.checked[len - 1]
  } else {
    dialogData.role_ids = []
    dialogData.role_id = null
  }
}

onMounted(() => {
  fetch()
  getAllRole()
})
</script>

<style lang="less">
.dataBody {
  background: #ffffff;
  padding: 10px;
  .operate {
    margin-bottom: 16px;
  }
}
</style>
