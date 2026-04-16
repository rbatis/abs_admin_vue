<template>
  <AdminLayout>
    <div class="home-page">
      <h1>欢迎使用 AbsAdmin 后台管理系统</h1>

      <a-divider />

      <!-- 单图上传示例 -->
      <a-card title="单图上传" style="margin-bottom: 24px;">
        <ImageUpload
          v-model="singleImage"
          :max-count="1"
        />
        <div v-if="singleImage" style="margin-top: 16px;">
          <a-alert message="已上传" type="success">
            <template #description>
              {{ singleImage }}
            </template>
          </a-alert>
        </div>
      </a-card>

      <!-- 多图上传示例 -->
      <a-card title="多图上传（最多5张）" style="margin-bottom: 24px;">
        <ImageUpload
          v-model="multipleImages"
          :max-count="5"
        />
        <div v-if="multipleImages.length > 0" style="margin-top: 16px;">
          <a-alert :message="`已上传 ${multipleImages.length} 张图片`" type="success">
            <template #description>
              <div v-for="(url, index) in multipleImages" :key="index" style="margin-top: 4px;">
                {{ index + 1 }}. {{ url }}
              </div>
            </template>
          </a-alert>
        </div>
      </a-card>

      <!-- Dict CSV 导入导出示例 -->
      <a-card title="字典-导入导出csv表格演示">
        <a-form layout="inline" style="margin-bottom: 16px;">
          <a-form-item>
            <a-input v-model:value="dictQueryParams.name" :placeholder="$t('common.enterName')" :allowClear="true" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="dictQueryParams.code" :placeholder="$t('common.enterCode')" :allowClear="true" />
          </a-form-item>
          <a-form-item>
            <a-button-group>
              <a-button type="primary" @click="loadDictData">{{ $t('common.query') }}</a-button>
              <a-button @click="handleDictOpenAdd">{{ $t('common.add') }}</a-button>
            </a-button-group>
          </a-form-item>
          <a-form-item>
            <CsvExport
              :api="dictPage"
              :columns="dictColumns"
              :query-params="dictQueryParams"
              file-name-prefix="dict"
            />
          </a-form-item>
          <a-form-item>
            <CsvImport
              :import-config="{
                idColumns: ['id'],
                targetField: 'id'
              }"
              @import-data="handleDictImport"
            />
          </a-form-item>
        </a-form>

        <a-table
          :columns="dictColumns"
          :data-source="dictData"
          :pagination="dictPagination"
          :loading="dictLoading"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'state'">
              <a-tag :color="record.state === 1 ? 'blue' : 'default'">
                {{ record.state === 1 ? 'Enable' : 'Disable' }}
              </a-tag>
            </template>
          </template>
        </a-table>

        <a-modal
          :title="dictDialogMode === 'add' ? $t('common.add') : $t('common.edit')"
          v-model:open="dictVisible"
          :width="500"
          :maskClosable="false"
          centered
          :confirmLoading="dictDialogLoading"
          @ok="handleDictSave"
        >
          <a-form
            ref="dictFormRef"
            labelAlign="right"
            :model="dictDialogData"
            :rules="dictRules"
            :label-col="{ sm: { span: 4 } }"
            :wrapper-col="{ sm: { span: 20 } }"
          >
            <a-form-item :label="$t('common.id')" name="id">
              <a-input v-model:value="dictDialogData.id" :placeholder="$t('common.enterId')" />
            </a-form-item>
            <a-form-item :label="$t('common.name')" name="name">
              <a-input v-model:value="dictDialogData.name" :placeholder="$t('common.enterName')" />
            </a-form-item>
            <a-form-item :label="$t('common.code')" name="code">
              <a-textarea :rows="4" v-model:value="dictDialogData.code" :placeholder="$t('common.enterCode')" />
            </a-form-item>
            <a-form-item :label="$t('common.enabledDisabled')" name="state">
              <a-radio-group v-model:value="dictDialogData.state">
                <a-radio :value="1">Enable</a-radio>
                <a-radio :value="0">Disable</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-modal>
      </a-card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import AdminLayout from '@/components/AdminLayout.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import CsvExport from '@/components/CsvExport.vue'
import CsvImport from '@/components/CsvImport.vue'
import { dictPage, dictAdd } from '@/api/manage'

// 单图
const singleImage = ref<string>('')

// 多图
const multipleImages = ref<string[]>([])

// Dict CSV 相关
const dictLoading = ref(false)
const dictData = ref<any[]>([])
const dictQueryParams = reactive({
  name: null,
  code: null,
  page_no: 1,
  page_size: 10
})
const dictPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const dictVisible = ref(false)
const dictDialogLoading = ref(false)
const dictDialogMode = ref('add')
const dictFormRef = ref()

const dictDialogData = reactive({
  id: null,
  name: null,
  code: null,
  state: 1
})

const dictRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

const dictColumns = [
  { title: 'ID', label: 'id', dataIndex: 'id', key: 'id' },
  { title: 'Name', label: 'name', dataIndex: 'name', key: 'name' },
  { title: 'Code', label: 'code', dataIndex: 'code', key: 'code' },
  { title: 'State', label: 'state', dataIndex: 'state', key: 'state' },
  { title: 'Create time', label: 'create_date', dataIndex: 'create_date', key: 'create_date' }
]

// 加载字典数据
function loadDictData() {
  dictLoading.value = true
  dictPage(dictQueryParams).then((res: any) => {
    dictLoading.value = false
    dictData.value = res.data.records || []
    dictPagination.total = res.data.total || 0
  }).catch(() => {
    dictLoading.value = false
  })
}

// 处理字典导入
function handleDictImport({ data }: { ids: string[], data: any[], file: File }) {
  console.log('导入的字典数据:', data)
  message.success(`成功解析 ${data.length} 条字典数据`)

  // 批量添加字典
  const promises = data.map((item: any) => {
    return dictAdd({
      id: item.id,
      name: item.name,
      code: item.code,
      state: parseInt(item.state) || 1
    })
  })

  Promise.allSettled(promises).then((results) => {
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length
    message.success(`导入完成: 成功 ${successCount} 条${failCount > 0 ? `, 失败 ${failCount} 条` : ''}`)
    loadDictData()
  })
}

// 打开发起添加对话框
function handleDictOpenAdd() {
  dictDialogMode.value = 'add'
  dictQueryParams.page_no = 1
  dictQueryParams.name = null
  dictQueryParams.code = null
  Object.assign(dictDialogData, { id: null, name: null, code: null, state: 1 })
  dictVisible.value = true
}

// 保存字典
async function handleDictSave() {
  dictDialogLoading.value = true
  try {
    await dictFormRef.value.validate()
    await dictAdd(dictDialogData)
    dictVisible.value = false
    loadDictData()
  } catch (e) {
    // 失败时不关闭对话框，错误已在拦截器中处理
  } finally {
    dictDialogLoading.value = false
  }
}

// 初始化加载字典数据
loadDictData()
</script>

<style scoped>
.home-page {
  padding: 24px;
}
</style>
