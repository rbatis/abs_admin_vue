<!--
  CsvExport - CSV导出组件

  支持分页导出大量数据，带进度条和取消功能

  @example
  基础用法：
  <CsvExport
    :api="fetchUsers"
    :columns="columns"
    :query-params="searchParams"
  />

  自定义文件名前缀：
  <CsvExport
    :api="fetchUsers"
    :columns="columns"
    file-name-prefix="用户列表"
  />

  @props
  - api: Function - 数据获取API（必需）
  - columns: Array<{label: string, key: string, formatter?: Function}> - 列配置（必需）
  - queryParams: Object - 查询参数
  - disabled: boolean - 是否禁用
  - fileNamePrefix: string - 文件名前缀，默认 'data'
  - maxExport: number - 最大导出条数，默认 10000

  @events
  - export-complete - 导出完成时触发，参数: { data: any[], count: number }
  - export-error - 导出失败时触发，参数: error

  @columns 格式
  {
    label: '列名',
    key: 'dataKey',
    formatter: (value, row) => value || ''  // 可选，格式化函数
  }
-->
<template>
  <div class="csv-export">
    <a-button
      type="primary"
      :loading="exporting"
      :disabled="disabled"
      @click="handleExport"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      {{ t('common.exportCsv') }}
    </a-button>

    <!-- 导出进度对话框 -->
    <a-modal
      v-model:open="exportModalVisible"
      :title="t('common.exportProgress')"
      :mask-closable="false"
      :closable="false"
      :footer="null"
      width="400px"
    >
      <div style="text-align: center; padding: 20px;">
        <a-progress :percent="exportProgress" />
        <div style="margin-top: 16px; font-size: 14px; color: #666;">
          {{ exportMessage }}
        </div>
        <div style="margin-top: 24px;">
          <a-button
            type="primary"
            danger
            size="small"
            @click="handleCancelExport"
          >
            {{ t('common.cancel') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()

// 定义列配置接口
export interface CsvColumn {
  label: string
  key: string
  formatter?: (value: any, row: any) => string
}

// 定义 props
interface Props {
  queryParams?: Record<string, any>
  disabled?: boolean
  api: (params: any) => Promise<any>
  columns: CsvColumn[]
  fileNamePrefix?: string
  maxExport?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryParams: () => ({}),
  disabled: false,
  fileNamePrefix: 'data',
  maxExport: 10000
})

// 定义 emits
const emit = defineEmits<{
  'export-complete': [{ data: any[], count: number }]
  'export-error': [error: any]
}>()

// 状态
const exporting = ref(false)
const cancelExport = ref(false)
const exportModalVisible = ref(false)
const exportProgress = ref(0)
const exportMessage = ref('')

// 处理取消导出
const handleCancelExport = () => {
  cancelExport.value = true
  message.warning(t('common.cancelling'))
}

// 处理导出
const handleExport = async () => {
  try {
    // 复制查询参数，移除分页相关参数
    const { page_no, page_size, ...queryParamsWithoutPagination } = props.queryParams
    const params = { ...queryParamsWithoutPagination }

    exporting.value = true

    // 获取总数
    const totalCountParams = { ...params, page_no: 1, page_size: 1 }
    const res = await props.api(totalCountParams)
    const total = res.data?.total || 0

    if (total === 0) {
      message.warning(t('common.noDataToExport'))
      exporting.value = false
      return
    }

    const exportCount = Math.min(total, props.maxExport)

    if (total > props.maxExport) {
      await confirmExport(total, exportCount, params)
    } else {
      await startExport(exportCount, params)
    }
  } catch (error) {
    console.error('Export failed:', error)
    message.error(t('common.exportFailed'))
    exporting.value = false
  }
}

// 确认导出
const confirmExport = (total: number, exportCount: number, baseParams: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: t('common.dataTooLarge'),
      content: t('common.exportLimitConfirm', { total, limit: exportCount }),
      onOk: () => {
        startExport(exportCount, baseParams).then(resolve).catch(reject)
      },
      onCancel: () => reject(new Error('User cancelled'))
    })
  })
}

// 开始导出
const startExport = async (totalCount: number, baseParams: any) => {
  cancelExport.value = false
  exportProgress.value = 0
  exportMessage.value = t('common.preparingExport')
  exportModalVisible.value = true

  try {
    const pageSize = 100
    const totalPages = Math.ceil(totalCount / pageSize)
    const allData: any[] = []

    for (let page = 1; page <= totalPages; page++) {
      // 检查是否取消导出
      if (cancelExport.value) {
        exportModalVisible.value = false
        message.warning(t('common.exportCancelled'))
        return
      }

      const progress = Math.round((page / totalPages) * 100)
      exportProgress.value = progress
      exportMessage.value = t('common.exportingProgress', {
        percent: progress,
        current: page,
        total: totalPages
      })

      const params = { ...baseParams, page_no: page, page_size: pageSize }
      const res = await props.api(params)
      const records = res.data?.records || []
      allData.push(...records)

      // 添加延迟避免请求过快
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // 再次检查是否取消导出
      if (cancelExport.value) {
        exportModalVisible.value = false
        message.warning(t('common.exportCancelled'))
        return
      }
    }

    // 关闭导出对话框
    exportModalVisible.value = false

    // 生成CSV
    await generateAndDownloadCSV(allData)

    message.success(t('common.exportSuccess'))
    emit('export-complete', { data: allData, count: allData.length })
  } catch (error) {
    console.error('Export failed:', error)
    message.error(t('common.exportFailed'))
    emit('export-error', error)
  } finally {
    exporting.value = false
    cancelExport.value = false
    exportModalVisible.value = false
  }
}

// 生成并下载CSV文件
const generateAndDownloadCSV = (data: any[]) => {
  if (data.length === 0) {
    message.warning(t('common.noDataToExport'))
    return
  }

  try {
    downloadCSV(data)
  } catch (error) {
    console.error('Generate CSV failed:', error)
    message.error(t('common.generateCSVFailed'))
    throw error
  }
}

// 下载CSV
const downloadCSV = (data: any[]) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const columns = props.columns
      if (!columns || columns.length === 0) {
        throw new Error('No columns configured')
      }

      // CSV头部
      const headers = columns.map(col => col.label)

      // 转换数据
      const csvData = data.map(item => {
        return columns.map(col => {
          const value = item[col.key]
          return col.formatter ? col.formatter(value, item) : (value ?? '')
        })
      })

      // 生成CSV内容
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => {
          // 处理包含逗号、引号或换行符的字段
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(','))
      ].join('\n')

      // 添加BOM以支持中文
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      // 生成文件名
      const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
      const fileName = `${props.fileNamePrefix}_${timestamp}.csv`

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      resolve()
    } catch (error) {
      console.error('Download CSV failed:', error)
      reject(error)
    }
  })
}
</script>

<style scoped>
.csv-export {
  display: inline-block;
}
</style>
