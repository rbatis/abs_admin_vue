<template>
  <AdminLayout>
    <div class="dataBody">
      <a-form layout="inline">
        <a-form-item>
          <a-input v-model:value="queryData.name" :placeholder="$t('common.enterName')" :allowClear="true" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetch_no_page">{{ $t('common.query') }}</a-button>
        </a-form-item>
      </a-form>
      <div class="operate">
        <a-button type="dashed" style="width: 100%" @click="addData">
          <PlusOutlined /> {{ $t('common.add') }}
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
              <a class="text-blue-500" @click="handleEdit(record)">{{ $t('common.edit') }}</a>
              <a-dropdown>
                <a class="text-gray-600">{{ $t('common.more') }} <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a class="text-red-500" @click="handleDelete(record)">{{ $t('common.delete') }}</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>

      <a-modal
        :title="dialogMode === 'add' ? $t('common.add') : $t('common.edit')"
        v-model:open="visible"
        :width="500"
        :maskClosable="false"
        :confirmLoading="dialogLoading"
        @ok="handleAddData"
      >
        <a-form labelAlign="right" :label-col="{ sm: { span: 4 } }" :wrapper-col="{ sm: { span: 20 } }">
          <a-form-item :label="$t('common.name')">
            <a-input v-model:value="dialogData.name" :placeholder="$t('common.name')" />
          </a-form-item>
          <a-form-item :label="$t('common.permissionSet')">
            <a-spin v-if="loading_all_res" />
            <a-tree
              v-model:checkedKeys="dialogData.permission_ids"
              :field-names="{ children: 'childs', title: 'name', key: 'id' }"
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

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { role_add, role_delete, role_page, role_update, sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const { t } = useI18n()

const columns = computed(() => [
  { title: t('common.id'), dataIndex: 'id' },
  { title: t('common.name'), dataIndex: 'name' },
  { title: t('common.createTime'), dataIndex: 'create_date' },
  { title: t('common.operation'), dataIndex: 'action' }
])

const data = ref([])
const loading = ref(false)
const visible = ref(false)
const dialogLoading = ref(false)
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
  dialogLoading.value = true
  try {
    if (dialogMode.value === 'add') {
      await role_add(dialogData)
    } else {
      await role_update(dialogData)
    }
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
  Object.assign(dialogData, scope)
}

function handleDelete(scope) {
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
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
