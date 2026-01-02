<template>
  <div class="csv-import">
    <a-upload
      name="file"
      :accept="'.csv'"
      :before-upload="beforeUpload"
      :custom-request="handleImport"
      :show-upload-list="false"
      :disabled="importing"
    >
      <a-button
        :loading="importing"
        :disabled="disabled"
        type="primary"
      >
        <template #icon>
          <UploadOutlined />
        </template>
        {{ t('common.importCsv') }}
      </a-button>
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import type { UploadProps } from 'ant-design-vue'

const { t } = useI18n()

// 定义导入配置接口
export interface ImportConfig {
  idColumns?: string[]
  targetField?: string
  merge?: boolean
}

// 定义 props
interface Props {
  importConfig?: ImportConfig
  disabled?: boolean
  maxSize?: number // MB
}

const props = withDefaults(defineProps<Props>(), {
  importConfig: () => ({
    idColumns: ['id', 'ID', 'userId', 'user_id'],
    targetField: 'user_ids_input',
    merge: true
  }),
  disabled: false,
  maxSize: 2
})

// 定义 emits
const emit = defineEmits<{
  'import-data': [{ ids: string[], data: any[], file: File }]
}>()

// 状态
const importing = ref(false)

// CSV 行数据接口
interface CsvRow {
  [key: string]: string
}

// 导入前的验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
  if (!isCSV) {
    message.error(t('common.onlyCsvAllowed'))
    return false
  }
  const isLtSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtSize) {
    message.error(t('common.fileSizeLimit', { size: props.maxSize }))
    return false
  }
  return true
}

// 处理导入
const handleImport: UploadProps['customRequest'] = (options) => {
  const { file } = options

  importing.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const csv = e.target?.result as string
      const parsedData = parseCSV(csv)

      if (parsedData.length === 0) {
        message.error(t('common.csvNoData'))
        importing.value = false
        return
      }

      const ids = extractIds(parsedData)

      if (ids.length === 0) {
        message.error(t('common.csvNoIdColumn'))
        importing.value = false
        return
      }

      // 发出导入数据事件
      emit('import-data', {
        ids,
        data: parsedData,
        file: file as File
      })

      message.success(t('common.importSuccess', { count: ids.length }))
    } catch (error) {
      console.error('CSV parse failed:', error)
      message.error(t('common.csvParseFailed'))
    } finally {
      importing.value = false
    }
  }
  reader.onerror = () => {
    message.error(t('common.fileReadFailed'))
    importing.value = false
  }
  reader.readAsText(file as File, 'UTF-8')
}

// 解析CSV数据
const parseCSV = (csv: string): CsvRow[] => {
  const lines = csv.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // 跳过BOM头
  const firstLine = lines[0].replace(/^\uFEFF/, '')

  // 解析标题行
  const headers = parseCSVLine(firstLine)

  // 解析数据行
  const result: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: CsvRow = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : ''
      })
      result.push(row)
    }
  }

  return result
}

// 解析CSV行
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// 提取ID
const extractIds = (data: CsvRow[]): string[] => {
  const idColumns = props.importConfig.idColumns || []
  return data
    .map(row => {
      for (const col of idColumns) {
        if (row[col]) return row[col]
      }
      return null
    })
    .filter((id): id is string => id !== null)
}
</script>

<style scoped>
.csv-import {
  display: inline-block;
}
</style>
