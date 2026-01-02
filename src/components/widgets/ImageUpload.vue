<template>
  <div class="image-upload">
    <a-upload
      v-model:file-list="fileList"
      name="file"
      list-type="picture-card"
      :custom-request="customRequest"
      :before-upload="beforeUpload"
      @change="handleChange"
      @preview="handlePreview"
      :disabled="!enable"
    >
      <div v-if="fileList.length < maxCount && enable">
        <PlusOutlined />
        <div class="ant-upload-text">{{ t('common.upload') }}</div>
      </div>
    </a-upload>

    <!-- 图片预览弹窗 -->
    <a-modal
      v-model:open="previewVisible"
      :footer="null"
      @cancel="handleCancel"
      :width="650"
      centered
      :bodyStyle="{ padding: '20px' }"
    >
      <div
        class="preview-container"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <img
          alt="preview"
          :src="previewImage"
          :style="{
            width: `${imageWidth * scale}px`,
            height: `${imageHeight * scale}px`,
            transform: `translate(${translateX}px, ${translateY}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            maxWidth: 'none',
            maxHeight: 'none'
          }"
          @dragstart.prevent
        />

        <!-- 悬浮控制按钮 -->
        <div class="preview-controls">
          <div class="control-btn" @click="resetZoom" :title="t('common.reset')">
            <ReloadOutlined />
          </div>
          <div class="control-btn" @click="zoomIn" :title="t('common.zoomIn')">
            <PlusOutlined />
          </div>
          <div class="control-btn" @click="zoomOut" :title="t('common.zoomOut')">
            <MinusOutlined />
          </div>
          <div class="zoom-info">{{ Math.round(scale * 100) }}%</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import type { UploadProps } from 'ant-design-vue'
import { upload_file } from '@/api/manage'

const { t } = useI18n()

// 定义 props
interface Props {
  modelValue?: string | string[]
  maxCount?: number
  enable?: boolean
  accept?: string
  maxSize?: number // MB
  uploadUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxCount: Infinity,
  enable: true,
  accept: 'image/*',
  maxSize: 5,
  uploadUrl: '/admin/upload'
})

// 定义 emits
const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'change': [value: string | string[]]
}>()

// 文件列表
const fileList = ref<any[]>([])

// 预览相关状态
const previewVisible = ref(false)
const previewImage = ref('')
const scale = ref(1)
const imageWidth = ref(0)
const imageHeight = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// 是否多图模式
const isMultiple = computed(() => props.maxCount !== 1)

// 初始化文件列表
const initFileList = () => {
  if (!props.modelValue) {
    fileList.value = []
    return
  }

  if (isMultiple.value) {
    const urls = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    fileList.value = urls.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url: url
    }))
  } else {
    const url = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
    fileList.value = url ? [{
      uid: '-1',
      name: 'image',
      status: 'done',
      url: url
    }] : []
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, () => {
  initFileList()
}, { immediate: true })

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error(t('common.onlyImageAllowed'))
    return false
  }
  const isLtSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtSize) {
    message.error(t('common.imageSizeLimit', { size: props.maxSize }))
    return false
  }
  return true
}

// 自定义上传
const customRequest: UploadProps['customRequest'] = async (options) => {
  if (!props.enable) return

  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('file', file as File)

  try {
    const res = await upload_file(formData)
    if (res.code === '0') {
      onSuccess?.(res)
      message.success(t('common.uploadSuccess'))
      emitChange()
    } else {
      onError?.(new Error(res.msg || 'Upload failed'))
      message.error(res.msg || t('common.uploadFailed'))
    }
  } catch (err) {
    onError?.(err as Error)
    message.error(t('common.uploadFailed'))
  }
}

// 处理文件变化
const handleChange: UploadProps['onChange'] = (info) => {
  if (!props.enable) return

  fileList.value = info.fileList

  if (info.file.status === 'done' || info.file.status === 'removed') {
    emitChange()
  }
}

// 触发变化事件
const emitChange = () => {
  const urls = fileList.value
    .filter(file => file.status === 'done')
    .map(file => (file.response?.data) || file.url)

  if (isMultiple.value) {
    emit('update:modelValue', urls)
    emit('change', urls)
  } else {
    emit('update:modelValue', urls[0] || '')
    emit('change', urls[0] || '')
  }
}

// 预览图片
const handlePreview: UploadProps['onPreview'] = (file) => {
  previewImage.value = file.url || file.thumbUrl || ''
  previewVisible.value = true
  resetZoom()

  // 加载图片获取原始尺寸
  const img = new Image()
  img.onload = () => {
    const maxWidth = 600
    const maxHeight = 400
    const aspectRatio = img.width / img.height

    if (img.width > maxWidth || img.height > maxHeight) {
      if (aspectRatio > maxWidth / maxHeight) {
        imageWidth.value = maxWidth
        imageHeight.value = maxWidth / aspectRatio
      } else {
        imageHeight.value = maxHeight
        imageWidth.value = maxHeight * aspectRatio
      }
    } else {
      imageWidth.value = img.width
      imageHeight.value = img.height
    }
  }
  img.src = previewImage.value
}

// 关闭预览
const handleCancel = () => {
  previewVisible.value = false
  resetZoom()
}

// 重置缩放
const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// 放大
const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
  updateImageSize()
}

// 缩小
const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.1)
  updateImageSize()
}

// 更新图片尺寸
const updateImageSize = () => {
  const newWidth = imageWidth.value * scale.value
  const newHeight = imageHeight.value * scale.value

  const containerWidth = 600
  const containerHeight = 600
  const maxTranslateX = Math.max(0, (newWidth - containerWidth) / 2)
  const maxTranslateY = Math.max(0, (newHeight - containerHeight) / 2)

  translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
  translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
}

// 鼠标滚轮缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  scale.value = Math.max(0.1, Math.min(5, scale.value * delta))
  updateImageSize()
}

// 鼠标拖拽
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = event.clientX - lastMouseX.value
  const deltaY = event.clientY - lastMouseY.value

  translateX.value += deltaX
  translateY.value += deltaY

  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY

  updateImageSize()
}

const handleMouseUp = () => {
  isDragging.value = false
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.preview-container {
  width: 600px;
  height: 600px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  position: relative;
  cursor: grab;
  margin: 0 auto;
}

.preview-controls {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}

.zoom-info {
  height: 32px;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  min-width: 45px;
}

.ant-upload-text {
  margin-top: 8px;
  font-size: 12px;
}
</style>
