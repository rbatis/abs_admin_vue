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
            <div style="width: 110px;">
              <a style="color: #1890ff" @click="handleEdit(record)">编辑</a>
              <a-dropdown>
                <a class="ant-dropdown-link">更多 <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a style="color:#f5222d" @click="handleDelete(record)">删除</a>
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
          <a-form-item label="名称">
            <a-input v-model:value="dialogData.name" placeholder="名称" />
          </a-form-item>
          <a-form-item label="权限集">
            <a-spin v-if="loading_all_res" />
            <a-tree
              v-model:checkedKeys="dialogData.permission_ids"
              :replace-fields="{ children: 'childs', title: 'name', key: 'id' }"
              :autoExpandParent="true"
              :tree-data="all_res"
              checkable
            />
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
import { role_add, role_delete, role_page, role_update, sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
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
  role_page(queryData).then((res) => {
    loading.value = false
    data.value = res.data.records
    pagination.total = res.data.total
    pagination.pageSize = res.data.page_size
  })
}

function addData() {
  handleDialogCancel()
  visible.value = true
  dialogMode.value = 'add'
}

async function handleAddData() {
  if (dialogMode.value === 'add') {
    await role_add(dialogData)
  } else {
    await role_update(dialogData)
  }
  visible.value = false
  fetch()
}

function handleEdit(scope) {
  visible.value = true
  dialogMode.value = 'edit'
  Object.assign(dialogData, scope)
}

function handleDelete(scope) {
  Modal.confirm({
    title: '你确定要删除?',
    content: '你确定要删除！',
    onOk() {
      return role_delete(scope).then((res) => {
        showMsg({ message: {} }, res)
        visible.value = false
        fetch()
      })
    }
  })
}

function handleDialogCancel() {
  Object.assign(dialogData, { id: null, name: null, permission_ids: [] })
}

function getAllRes() {
  loading_all_res.value = true
  sys_permission_layer_top({})
    .then((res) => {
      all_res.value = res.data
      loading_all_res.value = false
    })
    .catch(() => {
      loading_all_res.value = false
    })
}

onMounted(() => {
  fetch()
  getAllRes()
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
