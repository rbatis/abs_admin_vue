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
              <a class="text-blue-500" @click="handleAddChild({ parent_id: record.id })">{{ $t('common.addChild') }}</a>
              <a-dropdown>
                <a class="text-gray-600">{{ $t('common.more') }} <DownOutlined /></a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a class="text-blue-500" @click="handleEdit(record)">{{ $t('common.edit') }}</a>
                    </a-menu-item>
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
          <a-form-item :label="dialogData.is_menu ? $t('common.menuName') : $t('common.permissionName')">
            <a-input v-model:value="dialogData.name" />
          </a-form-item>
          <a-form-item :label="$t('common.parent')">
            <a-input v-model:value="dialogData.parent_id" :placeholder="$t('common.parentId')" />
            <a-tree
              :disabled="loading_all_res"
              v-model:checkedKeys="dialogData.permission_ids"
              :field-names="{ children: 'childs', title: 'name', key: 'id' }"
              :autoExpandParent="true"
              :tree-data="all_res"
              checkable
              :checkStrictly="true"
              @check="onResCheck"
            />
          </a-form-item>
          <a-form-item :label="$t('common.identifier')">
            <a-input v-model:value="dialogData.permission" :placeholder="$t('common.permissionIdentifier')" />
          </a-form-item>
          <a-form-item :label="$t('common.isMenu')">
            <a-row>
              <a-col>
                <a-switch
                  :checked-children="$t('common.menu')"
                  :un-checked-children="$t('common.permission')"
                  v-model:checked="dialogData.is_menu"
                />
              </a-col>
              <a-col>
                <a-input :disabled="!dialogData.is_menu" v-model:value="dialogData.path" :placeholder="$t('common.pathPlaceholder')" />
              </a-col>
            </a-row>
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
import { res_add, res_delete, res_page, res_update, sys_permission_layer_top } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const { t } = useI18n()

const columns = computed(() => [
  { title: t('common.id'), dataIndex: 'id' },
  { title: t('common.name'), dataIndex: 'name' },
  { title: t('res.permission'), dataIndex: 'permission' },
  { title: t('common.route'), dataIndex: 'path' },
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
  permission: null,
  path: null,
  parent_id: null,
  is_menu: false,
  permission_ids: [] as any
})

const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})

function handleTableChange(pag: any) {
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
  dialogLoading.value = true
  try {
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
  } catch (err) {
    // 失败时不关闭对话框，错误已在拦截器中处理
  } finally {
    dialogLoading.value = false
  }
}

function handleAddChild(scope: any) {
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

function handleEdit(scope: any) {
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

function handleDelete(scope: any) {
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
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
    permission_ids: [] as any
  })
}

function onResCheck(data: any) {
  const len = data.checked.length
  if (len >= 1) {
    dialogData.permission_ids = { checked: [data.checked[len - 1]], halfChecked: [] }
    dialogData.parent_id = data.checked[len - 1]
  } else {
    dialogData.permission_ids = []
    dialogData.parent_id = null
  }
}

function getAllRes(skipId?: any) {
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
      all_res.value = arr as any
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
