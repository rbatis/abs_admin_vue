<template>
  <AdminLayout>
    <div class="dataBody">
      <a-form layout="inline">
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
          <template v-if="column.dataIndex === 'action'">
            <div class="flex gap-2">
              <a class="text-blue-500" @click="handleAddChild({ parent_id: record.id })">添加下级</a>
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
        @ok="handleAddData"
      >
        <a-form labelAlign="right" :label-col="{ sm: { span: 4 } }" :wrapper-col="{ sm: { span: 20 } }">
          <a-form-item :label="dialogData.is_menu ? '菜单名称' : '权限名称'">
            <a-input v-model:value="dialogData.name" />
          </a-form-item>
          <a-form-item label="父级(选填)">
            <a-input v-model:value="dialogData.parent_id" placeholder="父级id" />
            <a-tree
              :disabled="loading_all_res"
              v-model:checkedKeys="dialogData.permission_ids"
              :replace-fields="{ children: 'childs', title: 'name', key: 'id' }"
              :autoExpandParent="true"
              :tree-data="all_res"
              checkable
              :checkStrictly="true"
              @check="onResCheck"
            />
          </a-form-item>
          <a-form-item label="标识">
            <a-input v-model:value="dialogData.permission" placeholder="菜单、权限标识" />
          </a-form-item>
          <a-form-item label="是否菜单">
            <a-row>
              <a-col>
                <a-switch
                  checked-children="菜单"
                  un-checked-children="权限"
                  v-model:checked="dialogData.is_menu"
                />
              </a-col>
              <a-col>
                <a-input :disabled="!dialogData.is_menu" v-model:value="dialogData.path" placeholder="填写路径为菜单！" />
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { res_add, res_delete, res_page, res_update, sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '权限标识', dataIndex: 'permission' },
  { title: '路由', dataIndex: 'path' },
  { title: '创建时间', dataIndex: 'create_date' },
  { title: '操作', dataIndex: 'action' }
]

const data = ref([])
const loading = ref(false)
const visible = ref(false)
const dialogMode = ref('add')
const all_res = ref([])
const loading_all_res = ref(false)

const queryData = reactive({
  name: null,
  page_no: 1,
  page_size: 5
})

const dialogData = reactive({
  id: null,
  name: null,
  permission: null,
  path: null,
  parent_id: null,
  is_menu: false,
  permission_ids: []
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

function fetch() {
  loading.value = true
  res_page(queryData).then((res) => {
    loading.value = false
    data.value = res.data.records
    pagination.total = res.data.total
    pagination.pageSize = res.data.page_size
  })
}

function addData() {
  handleDialogCancel()
  getAllRes()
  visible.value = true
  dialogMode.value = 'add'
}

async function handleAddData() {
  if (!dialogData.is_menu) {
    dialogData.path = null
  }
  if (dialogMode.value === 'add') {
    await res_add(dialogData)
  } else {
    await res_update(dialogData)
  }
  visible.value = false
  fetch()
}

function handleAddChild(scope) {
  getAllRes()
  visible.value = true
  dialogMode.value = 'add'
  Object.assign(dialogData, { is_menu: scope.path === null, permission_ids: [] }, scope)
  if (dialogData.parent_id === '') {
    dialogData.parent_id = null
  }
  if (scope.parent_id !== null) {
    dialogData.permission_ids = [scope.parent_id]
  }
}

function handleEdit(scope) {
  getAllRes(scope.id)
  visible.value = true
  dialogMode.value = 'edit'
  Object.assign(dialogData, { is_menu: scope.path === null, permission_ids: [] }, scope)
  if (scope.parent_id !== null) {
    dialogData.permission_ids = [scope.parent_id]
  }
  if (dialogData.parent_id === '') {
    dialogData.parent_id = null
  }
  if (dialogData.path === null) {
    dialogData.is_menu = false
  } else {
    dialogData.is_menu = true
  }
}

function handleDelete(scope) {
  Modal.confirm({
    title: '你确定要删除?',
    content: '你确定要删除！',
    onOk() {
      return res_delete(scope).then((res) => {
        showMsg({ message: {} }, res)
        visible.value = false
        fetch()
      })
    }
  })
}

function handleDialogCancel() {
  Object.assign(dialogData, {
    id: null,
    name: null,
    permission: null,
    path: null,
    parent_id: null,
    is_menu: false,
    permission_ids: []
  })
}

function onResCheck(data) {
  const len = data.checked.length
  if (len >= 1) {
    dialogData.permission_ids = { checked: [data.checked[len - 1]], halfChecked: [] }
    dialogData.parent_id = data.checked[len - 1]
  } else {
    dialogData.permission_ids = []
    dialogData.parent_id = null
  }
}

function getAllRes(skipId) {
  loading_all_res.value = true
  sys_permission_layer_top({})
    .then((res) => {
      loading_all_res.value = false
      const arr = []
      for (let index = 0; index < res.data.length; index++) {
        const item = res.data[index]
        if (skipId !== undefined && skipId !== null && item.id === skipId) {
          continue
        }
        arr.push(item)
      }
      all_res.value = arr
    })
    .catch(() => {
      loading_all_res.value = false
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
  .operate {
    margin-bottom: 16px;
  }
}
</style>
