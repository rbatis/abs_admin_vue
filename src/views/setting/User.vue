<template>
  <AdminLayout>
    <div class="dataBody">
    <a-form layout="inline">
      <a-form-item>
        <a-input v-model:value="queryData.account" :placeholder="$t('user.account')" :allowClear="true" :maxLength="11" />
      </a-form-item>
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
        <template v-if="column.dataIndex === 'state'">
          <a-tag v-if="record.state === 1" color="blue">{{ $t('common.enable') }}</a-tag>
          <a-tag v-else>{{ $t('common.disable') }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="flex gap-2">
            <a class="text-red-500" @click="handleEnableDisable(record)">
              {{ record.state === 0 ? $t('common.enable') : $t('common.disable') }}
            </a>
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
        <a-form-item :label="$t('user.name')">
          <a-input v-model:value="dialogData.name" :placeholder="$t('user.name')" />
        </a-form-item>
        <a-form-item :label="$t('user.account')">
          <a-input v-model:value="dialogData.account" :maxLength="11" :disabled="dialogMode !== 'add'" :placeholder="$t('user.account')" />
        </a-form-item>
        <a-form-item :label="$t('common.roleSet')">
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { sys_role_layer_top, sys_user_add, sys_user_remove, sys_user_page, sys_user_update } from '@/api/manage'
import { showMsg } from '@/utils/data'
import AdminLayout from '@/components/AdminLayout.vue'

const { t } = useI18n()

const columns = computed(() => [
  { title: t('common.id'), dataIndex: 'id' },
  { title: t('common.name'), dataIndex: 'name' },
  { title: t('user.account'), dataIndex: 'account' },
  { title: t('common.name') + '/' + t('role.name'), dataIndex: ['role', 'name'] },
  { title: t('common.state'), dataIndex: 'state' },
  { title: t('common.createTime'), dataIndex: 'create_date' },
  { title: t('common.operation'), dataIndex: 'action' }
])

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
  role_ids: [] as any,
  role_id: null
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

function handleEdit(scope: any) {
  visible.value = true
  dialogMode.value = 'edit'
  if (scope.role !== undefined && scope.role !== null) {
    Object.assign(dialogData, { role_ids: [scope.role.id], role_id: scope.role.id }, scope)
  } else {
    Object.assign(dialogData, { role_ids: [], role_id: null }, scope)
  }
}

function handleDelete(scope: any) {
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
    onOk() {
      return sys_user_remove(scope).then((res) => {
        showMsg({ message: {} }, res)
        visible.value = false
        fetch()
      })
    }
  })
}

function handleEnableDisable(scope: any) {
  const key = scope.state === 0 ? 'user.enableConfirm' : 'user.disableConfirm'
  Modal.confirm({
    title: t(key, { name: scope.name }),
    async onOk() {
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
    role_ids: [] as any,
    role_id: null
  })
}

function getAllRole() {
  sys_role_layer_top({}).then((res) => {
    all_role.value = res.data
  })
}

function onRolesCheck(data: any) {
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
