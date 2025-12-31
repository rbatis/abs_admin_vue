<template>
  <AdminLayout>
    <div class="dataBody">
      <a-form layout="inline">
        <a-form-item>
          <a-input v-model:value="queryData.remark" placeholder="请输入计划备注" />
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
            <div style="width: 80px">
              <a @click="handleEdit(record)">编辑</a>
              <a-dropdown>
                <a class="ant-dropdown-link">更多 <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a @click="handleDelete(record)">删除</a>
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
        :width="600"
        :maskClosable="false"
        @ok="handleAddData"
      >
        <a-form layout="inline">
          <a-form-item label="ID">
            <a-input style="width: 300px" v-model:value="dialogData.id" placeholder="请输入ID(唯一)" />
          </a-form-item>
          <a-form-item label="值">
            <a-textarea :rows="2" style="width: 300px" v-model:value="dialogData.value" placeholder="请输入值" />
          </a-form-item>
          <a-form-item label="备注">
            <a-input style="width: 300px" v-model:value="dialogData.remark" placeholder="请输入备注" />
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
import AdminLayout from '@/components/AdminLayout.vue'

const columns = [
  { title: 'key', dataIndex: 'id', width: '5%' },
  { title: '备注', dataIndex: 'remark', width: '5%' },
  { title: '值', dataIndex: 'value', width: '5%' },
  { title: '操作', dataIndex: 'action', width: '5%' }
]

const data = ref([])
const loading = ref(false)
const visible = ref(false)
const dialogMode = ref('add')

const queryData = reactive({
  remark: null,
  page_no: 1,
  page_size: 5
})

const dialogData = reactive({
  id: null,
  value: null,
  remark: null
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
  // TODO: 实现 API 调用
  loading.value = false
}

function addData() {
  handleDialogCancel()
  visible.value = true
  dialogMode.value = 'add'
}

async function handleAddData() {
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
      visible.value = false
      fetch()
    }
  })
}

function handleDialogCancel() {
  Object.assign(dialogData, { id: null, remark: null, value: null })
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
