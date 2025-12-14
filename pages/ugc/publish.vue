<template>
  <view class="page">
    <!-- 顶部标题区域 -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">发布动态</text>
        <view class="type-badge">{{ mediaTypes[mediaIndex] }}</view>
      </view>
    </view>

    <!-- 标题输入区域 -->
    <view class="title-section">
      <view class="section-label">
        <text class="label-text">标题</text>
        <text class="label-tip">给你的内容起个好标题</text>
      </view>
      <input 
        class="title-input" 
        v-model="form.title" 
        placeholder="输入标题..." 
        placeholder-style="color: #999;"
        maxlength="50"
        :focus="false"
        :cursor-spacing="0"
      />
    </view>

    <!-- 正文输入区域 -->
    <view class="content-section">
      <view class="section-label">
        <text class="label-text">正文</text>
        <picker :range="mediaTypes" :value="mediaIndex" @change="onMediaTypeChange">
          <view class="type-picker">
            <text>{{ mediaTypes[mediaIndex] }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <textarea 
        v-model="form.content" 
        class="content-textarea" 
        placeholder="分享此刻想法，支持长文..." 
        placeholder-style="color: #999;"
        maxlength="-1"
      />
    </view>

    <!-- 关联商品区域 -->
    <view class="product-section">
      <view class="section-label">
        <text class="label-text">关联商品</text>
        <text class="label-tip">可选，分享你喜欢的商品</text>
      </view>
      <view v-if="selectedProduct" class="selected-product">
        <image :src="selectedProduct.pic" mode="aspectFill" class="product-image"></image>
        <view class="product-info">
          <text class="product-name">{{ selectedProduct.name }}</text>
          <text class="product-price">￥{{ selectedProduct.price }}</text>
        </view>
        <text class="remove-product" @click="removeProduct">×</text>
      </view>
      <button v-else class="select-product-btn" @click="showProductSearch = true">
        <text class="btn-icon">🛍️</text>
        <text class="btn-text">选择商品</text>
      </button>
    </view>

    <!-- 商品搜索弹窗 -->
    <view v-if="showProductSearch" class="product-search-modal" @click="showProductSearch = false">
      <view class="product-search-content" @click.stop>
        <view class="search-header">
          <text class="search-title">搜索商品</text>
          <text class="close-btn" @click="showProductSearch = false">×</text>
        </view>
        <view class="search-input-wrapper">
          <input 
            v-model="productSearchKeyword" 
            class="search-input" 
            placeholder="输入商品名称搜索..."
            @input="handleSearchInput"
            @confirm="searchProducts"
            :focus="showProductSearch"
            confirm-type="search"
            type="text"
            :adjust-position="false"
            :cursor-spacing="0"
            :hold-keyboard="true"
          />
        </view>
        <scroll-view scroll-y class="search-results" v-if="productSearchResults.length > 0">
          <view 
            v-for="product in productSearchResults" 
            :key="product.id" 
            class="product-item"
            @click="selectProduct(product)"
          >
            <image :src="product.pic" mode="aspectFill" class="product-item-image"></image>
            <view class="product-item-info">
              <text class="product-item-name">{{ product.name }}</text>
              <text class="product-item-price">￥{{ product.price }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-if="searchingProduct" class="search-loading">
          <text>搜索中...</text>
        </view>
        <view v-if="!searchingProduct && productSearchKeyword && productSearchResults.length === 0" class="search-empty">
          <text>未找到相关商品</text>
        </view>
      </view>
    </view>

    <!-- 媒体上传区域 -->
    <view class="media-section">
      <view class="section-label">
        <text class="label-text">媒体</text>
        <text class="media-count">{{ images.length }} 图 / {{ videos.length }} 视频</text>
      </view>

      <view class="action-buttons">
        <button class="action-btn image-btn" @click="chooseImages">
          <text class="btn-icon">📷</text>
          <text class="btn-text">添加图片</text>
        </button>
        <button class="action-btn video-btn" @click="chooseVideo">
          <text class="btn-icon">🎥</text>
          <text class="btn-text">添加视频</text>
        </button>
      </view>

      <view class="media-grid" v-if="images.length">
        <view class="media-thumb" v-for="(url, idx) in images" :key="idx">
          <image :src="url" mode="aspectFill"></image>
          <text class="badge">图</text>
          <text class="del" @click="removeImage(idx)">×</text>
        </view>
      </view>

      <view class="media-grid video-grid" v-if="videos.length">
        <view class="media-thumb video" v-for="(url, idx) in videos" :key="idx">
          <video :src="url" controls></video>
          <text class="badge">视频</text>
          <text class="del" @click="removeVideo(idx)">×</text>
        </view>
      </view>
    </view>

    <!-- 底部发布按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="submit">
        <text class="submit-icon">✨</text>
        <text class="submit-text">立即发布</text>
      </button>
    </view>
  </view>
</template>

<script>
import { createUgcPost } from '@/api/ugc'
import { searchProductList } from '@/api/product'
import { API_BASE_URL } from '@/utils/config'
import { logTokenInfo, checkTokenFormat } from '@/utils/checkToken'

const BASE = API_BASE_URL || 'http://localhost:8085'

export default {
  data () {
    return {
      form: {
        title: '',
        content: '',
        productId: null
      },
      mediaTypes: ['TEXT', 'IMAGE', 'VIDEO', 'MIX'],
      mediaIndex: 0,
      images: [],
      videos: [],
      selectedProduct: null, // 选中的商品
      showProductSearch: false, // 是否显示商品搜索
      productSearchKeyword: '', // 商品搜索关键词
      productSearchResults: [], // 商品搜索结果
      searchingProduct: false, // 是否正在搜索商品
      searchTimer: null // 搜索防抖定时器
    }
  },
  onLoad () {
    // 页面加载时检查 token
    this.checkLoginStatus()
  },
  methods: {
    // 检查登录状态
    checkLoginStatus () {
      const token = uni.getStorageSync('token')
      if (!token) {
        console.warn('⚠️ 未检测到 token，请先登录')
        // 可以选择自动跳转到登录页
        // uni.navigateTo({ url: '/pages/public/login' })
      } else {
        // 打印 token 信息（仅用于调试）
        logTokenInfo()
        const formatCheck = checkTokenFormat()
        if (!formatCheck.valid) {
          console.warn('⚠️ Token 格式可能不正确:', formatCheck.message)
        }
      }
    },
    
    onMediaTypeChange (e) {
      this.mediaIndex = Number(e.detail.value)
    },
    async chooseImages () {
      // 检查登录状态
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/public/login' })
        return
      }

      try {
        console.log('📷 ========== 开始选择图片 ==========')
        console.log('   当前已有图片数:', this.images.length)
        console.log('   可再选择数量:', Math.max(1, 9 - this.images.length))
        
        // 使用 Promise 包装，兼容回调和 Promise 两种方式
        const res = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: Math.max(1, 9 - this.images.length),
            sourceType: ['album', 'camera'],
            success: (result) => {
              resolve(result)
            },
            fail: (error) => {
              console.error('选择图片失败:', error)
              reject(error)
            }
          })
        })

        console.log('📷 选择图片返回结果:')
        console.log('   完整响应:', JSON.stringify(res, null, 2))
        console.log('   tempFilePaths:', res.tempFilePaths)
        console.log('   tempFiles:', res.tempFiles)
        console.log('=====================================')

        // 在 H5 环境下，优先使用 tempFiles 中的 File 对象
        // 在其他平台，使用 tempFilePaths
        let files = []
        let fileObjects = []
        
        // #ifdef H5
        if (res.tempFiles && Array.isArray(res.tempFiles) && res.tempFiles.length > 0) {
          fileObjects = res.tempFiles.filter(f => f instanceof File)
          files = res.tempFilePaths || []
          console.log('✅ H5环境: 从 tempFiles 获取到', fileObjects.length, '个File对象')
        } else {
          console.warn('⚠️ H5环境: 未找到File对象')
          uni.showToast({ title: '未选择图片，请重试', icon: 'none' })
          return
        }
        // #endif
        
        // #ifndef H5
        if (res.tempFilePaths && Array.isArray(res.tempFilePaths) && res.tempFilePaths.length > 0) {
          files = res.tempFilePaths
          console.log('✅ 从 tempFilePaths 获取到', files.length, '个文件')
        } else if (res.tempFiles && Array.isArray(res.tempFiles) && res.tempFiles.length > 0) {
          files = res.tempFiles.map(f => f.path || f.tempFilePath).filter(Boolean)
          console.log('✅ 从 tempFiles 获取到', files.length, '个文件')
        } else {
          console.warn('⚠️ 未找到有效的文件路径')
          uni.showToast({ title: '未选择图片，请重试', icon: 'none' })
          return
        }
        // #endif

        if (files.length === 0 && fileObjects.length === 0) {
          console.warn('⚠️ 文件数组为空')
          uni.showToast({ title: '未选择图片，请重试', icon: 'none' })
          return
        }

        console.log('📤 准备上传', files.length || fileObjects.length, '个文件')

        uni.showLoading({ title: '上传中', mask: true })
        let uploadSuccess = 0
        let uploadErrors = []
        
        // #ifdef H5
        // H5 环境：使用 File 对象上传
        for (let i = 0; i < fileObjects.length; i++) {
          try {
            const url = await this.uploadFileH5(fileObjects[i], 'image')
            if (url) {
              this.images.push(url)
              uploadSuccess++
            }
          } catch (uploadError) {
            const errorMsg = uploadError.message || uploadError.toString()
            console.error('单个文件上传失败:', errorMsg, uploadError)
            uploadErrors.push(errorMsg)
          }
        }
        // #endif
        
        // #ifndef H5
        // 非 H5 环境：使用文件路径上传
        for (const path of files) {
          try {
            const url = await this.uploadFile(path, 'image')
            if (url) {
              this.images.push(url)
              uploadSuccess++
            }
          } catch (uploadError) {
            const errorMsg = uploadError.message || uploadError.toString()
            console.error('单个文件上传失败:', errorMsg, uploadError)
            uploadErrors.push(errorMsg)
          }
        }
        // #endif

        uni.hideLoading()
        
        if (uploadSuccess > 0) {
          if (uploadSuccess === files.length) {
            uni.showToast({ title: `成功上传${uploadSuccess}张图片`, icon: 'success' })
          } else {
            uni.showToast({ 
              title: `成功上传${uploadSuccess}张，失败${files.length - uploadSuccess}张`, 
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          const errorMsg = uploadErrors.length > 0 ? uploadErrors[0] : '图片上传失败'
          uni.showToast({ title: errorMsg, icon: 'none', duration: 2000 })
        }
      } catch (e) {
        uni.hideLoading()
        const msg = (e && e.errMsg) ? e.errMsg : '选择图片失败'
        uni.showToast({ title: msg, icon: 'none' })
        console.error('图片选择失败:', e)
      }
    },
    async chooseVideo () {
      // 检查登录状态
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/public/login' })
        return
      }

      try {
        console.log('🎬 ========== 开始选择视频 ==========')
        
        // 使用 Promise 包装，兼容回调和 Promise 两种方式
        const res = await new Promise((resolve, reject) => {
          uni.chooseVideo({
            sourceType: ['album', 'camera'],
            compressed: true,
            success: (result) => {
              resolve(result)
            },
            fail: (error) => {
              console.error('选择视频失败:', error)
              reject(error)
            }
          })
        })

        console.log('🎬 选择视频返回结果:')
        console.log('   完整响应:', JSON.stringify(res, null, 2))
        console.log('   tempFilePath:', res.tempFilePath)
        console.log('   tempFile:', res.tempFile)
        console.log('=====================================')

        uni.showLoading({ title: '上传中', mask: true })
        
        try {
          let url = null
          
          // #ifdef H5
          // H5 环境：检查是否有 File 对象
          if (res.tempFile && res.tempFile instanceof File) {
            console.log('✅ H5环境: 使用 File 对象上传视频')
            console.log('   文件名:', res.tempFile.name)
            console.log('   文件大小:', res.tempFile.size, 'bytes')
            url = await this.uploadFileH5(res.tempFile, 'video')
          } else if (res.tempFilePath) {
            // 如果没有 File 对象，尝试从 blob URL 创建 File 对象
            console.log('⚠️ H5环境: 尝试从 blob URL 创建 File 对象')
            try {
              const file = await this.blobUrlToFile(res.tempFilePath)
              if (file) {
                url = await this.uploadFileH5(file, 'video')
              } else {
                throw new Error('无法从 blob URL 创建 File 对象')
              }
            } catch (blobError) {
              console.error('从 blob URL 创建 File 失败:', blobError)
              throw new Error('视频文件处理失败，请重试')
            }
          } else {
            throw new Error('未找到有效的视频文件')
          }
          // #endif
          
          // #ifndef H5
          // 非 H5 环境：使用文件路径上传
          if (res.tempFilePath) {
            console.log('✅ 使用文件路径上传视频:', res.tempFilePath)
            url = await this.uploadFile(res.tempFilePath, 'video')
          } else {
            throw new Error('未找到有效的视频文件路径')
          }
          // #endif
          
          if (url) {
            this.videos = [url] // 只允许上传一个视频
            uni.hideLoading()
            uni.showToast({ title: '视频上传成功', icon: 'success' })
          } else {
            uni.hideLoading()
            uni.showToast({ title: '视频上传失败', icon: 'none' })
          }
        } catch (uploadError) {
          uni.hideLoading()
          const errorMsg = uploadError.message || uploadError.toString()
          console.error('视频上传失败:', errorMsg, uploadError)
          uni.showToast({ title: errorMsg, icon: 'none', duration: 2000 })
        }
      } catch (e) {
        const msg = (e && e.errMsg) ? e.errMsg : '选择视频失败'
        uni.showToast({ title: msg, icon: 'none' })
        console.error('视频选择失败:', e)
      }
    },
    
    // 将 blob URL 转换为 File 对象（H5 环境）
    blobUrlToFile (blobUrl) {
      return new Promise((resolve, reject) => {
        try {
          fetch(blobUrl)
            .then(res => res.blob())
            .then(blob => {
              // 从 blob URL 中提取文件名（如果可能）
              const fileName = `video_${Date.now()}.mp4`
              const file = new File([blob], fileName, { type: blob.type || 'video/mp4' })
              console.log('✅ 成功从 blob URL 创建 File 对象:', file.name, file.size, 'bytes')
              resolve(file)
            })
            .catch(err => {
              console.error('从 blob URL 获取数据失败:', err)
              reject(err)
            })
        } catch (err) {
          console.error('blob URL 转换失败:', err)
          reject(err)
        }
      })
    },
    removeImage (index) {
      this.images.splice(index, 1)
    },
    removeVideo (index) {
      this.videos.splice(index, 1)
    },
    // H5 环境下上传 File 对象
    uploadFileH5 (file, fileType = 'image') {
      return new Promise((resolve, reject) => {
        // 检查登录状态
        const rawToken = uni.getStorageSync('token')
        if (!rawToken) {
          const error = new Error('请先登录')
          console.error('上传失败: 未登录')
          reject(error)
          return
        }
        
        // 格式化token，确保有Bearer前缀
        let authToken = rawToken
        if (!authToken.startsWith('Bearer')) {
          authToken = `Bearer ${authToken.trim()}`
        }
        
        const uploadUrl = `${BASE}/ugc/post/upload`
        console.log('📤 ========== H5上传文件 ==========')
        console.log('   URL:', uploadUrl)
        console.log('   Token 预览:', authToken.substring(0, 30) + '...')
        console.log('   文件名:', file.name)
        console.log('   文件大小:', file.size, 'bytes')
        console.log('   文件类型:', fileType)
        console.log('=====================================')
        
        // 使用 FormData 和 XMLHttpRequest 上传
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileType', fileType)
        
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl)
        xhr.setRequestHeader('Authorization', authToken)
        
        xhr.onload = () => {
          console.log('📥 ========== H5上传响应接收 ==========')
          console.log('   状态码:', xhr.status)
          console.log('   响应数据:', xhr.responseText)
          console.log('=====================================')
          
          try {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText)
              console.log('解析后的数据:', data)
              
              if (data && data.code === 200 && data.data) {
                console.log('✅ 上传成功，URL:', data.data)
                resolve(data.data)
              } else {
                let errorMsg = data?.message || data?.msg || `上传失败(${data?.code || xhr.status})`
                if (data?.code === 401 || data?.code === 403) {
                  errorMsg = '登录已过期，请重新登录'
                  uni.removeStorageSync('token')
                  setTimeout(() => {
                    uni.navigateTo({ url: '/pages/public/login' })
                  }, 1500)
                }
                console.error('文件上传失败:', errorMsg, data)
                reject(new Error(errorMsg))
              }
            } else {
              let errorMsg = `上传失败(${xhr.status})`
              try {
                const errorData = JSON.parse(xhr.responseText)
                errorMsg = errorData.message || errorData.error || errorMsg
              } catch (e) {
                // 忽略解析错误
              }
              console.error('文件上传失败:', errorMsg)
              reject(new Error(errorMsg))
            }
          } catch (err) {
            console.error('上传解析失败:', err, xhr.responseText)
            reject(new Error('上传响应解析失败: ' + err.message))
          }
        }
        
        // 添加上传进度监听
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            console.log(`📊 上传进度: ${percent}% (${(e.loaded / 1024 / 1024).toFixed(2)} MB / ${(e.total / 1024 / 1024).toFixed(2)} MB)`)
            // 可以在这里更新 UI 显示进度
            // uni.showLoading({ title: `上传中 ${percent}%`, mask: true })
          }
        }
        
        xhr.onerror = (e) => {
          console.error('❌ H5文件上传请求失败')
          console.error('   错误详情:', e)
          console.error('   状态码:', xhr.status)
          console.error('   响应文本:', xhr.responseText)
          reject(new Error('网络请求失败，请检查后端服务和文件大小限制'))
        }
        
        xhr.ontimeout = () => {
          console.error('❌ H5文件上传超时')
          reject(new Error('上传超时，文件可能过大，请尝试压缩后上传'))
        }
        
        // 根据文件大小动态设置超时时间
        // 278 MB 的视频，假设上传速度 1 MB/s，需要约 5 分钟
        // 设置 10 分钟超时，给足够的时间
        const fileSizeMB = file.size / 1024 / 1024
        const timeout = Math.max(600000, fileSizeMB * 2000) // 至少 10 分钟，或按文件大小计算
        xhr.timeout = timeout
        console.log(`⏱️ 上传超时设置: ${(timeout / 1000 / 60).toFixed(1)} 分钟 (文件大小: ${fileSizeMB.toFixed(2)} MB)`)
        
        xhr.send(formData)
      })
    },
    
    // 非 H5 环境下上传文件路径
    uploadFile (filePath, fileType = 'image') {
      return new Promise((resolve, reject) => {
        // 检查登录状态
        const rawToken = uni.getStorageSync('token')
        if (!rawToken) {
          const error = new Error('请先登录')
          console.error('上传失败: 未登录')
          reject(error)
          return
        }
        
        // 格式化token，确保有Bearer前缀
        let authToken = rawToken
        if (!authToken.startsWith('Bearer')) {
          authToken = `Bearer ${authToken.trim()}`
        }
        
        const uploadUrl = `${BASE}/ugc/post/upload`
        console.log('📤 ========== 开始上传文件 ==========')
        console.log('   URL:', uploadUrl)
        console.log('   Token 预览:', authToken.substring(0, 30) + '...')
        console.log('   文件路径:', filePath)
        console.log('   文件类型:', fileType)
        console.log('=====================================')
        
        uni.uploadFile({
          url: uploadUrl,
          filePath,
          name: 'file',
          header: {
            'Authorization': authToken
          },
          formData: {
            fileType: fileType
          },
          success: (res) => {
            console.log('📥 ========== 上传响应接收 ==========')
            console.log('   状态码:', res.statusCode)
            console.log('   响应数据:', res.data)
            console.log('   响应头:', res.header)
            console.log('=====================================')
            try {
              const httpOk = String(res.statusCode || '') === '200'
              const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
              
              console.log('解析后的数据:', data)
              
              if (httpOk && data && data.code === 200 && data.data) {
                console.log('上传成功，URL:', data.data)
                resolve(data.data)
                return
              }
              
              // 处理错误情况
              let errorMsg = '上传失败'
              if (data) {
                if (data.code === 401 || data.code === 403) {
                  errorMsg = '登录已过期，请重新登录'
                  // 清除token，跳转到登录页
                  uni.removeStorageSync('token')
                  setTimeout(() => {
                    uni.navigateTo({ url: '/pages/public/login' })
                  }, 1500)
                } else {
                  errorMsg = data.message || data.msg || `上传失败(${data.code || res.statusCode})`
                }
              } else {
                errorMsg = `上传失败(${res.statusCode || '未知'})`
              }
              
              console.error('文件上传失败:', errorMsg, data)
              reject(new Error(errorMsg))
            } catch (err) {
              console.error('上传解析失败:', err, res.data)
              reject(new Error('上传响应解析失败: ' + err.message))
            }
          },
          fail: (e) => {
            console.error('❌ 文件上传请求失败')
            console.error('   错误对象:', e)
            console.error('   错误信息:', e.errMsg)
            console.error('   状态码:', e.statusCode)
            console.error('   完整错误:', JSON.stringify(e, null, 2))
            
            let msg = '上传失败，请重试'
            if (e.errMsg) {
              if (e.errMsg.includes('timeout')) {
                msg = '上传超时，请检查网络连接'
              } else if (e.errMsg.includes('fail')) {
                msg = '网络请求失败，请检查后端服务'
              } else {
                msg = e.errMsg
              }
            }
            
            reject(new Error(msg))
          }
        })
      })
    },
    async submit () {
      // 检查登录状态
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        uni.navigateTo({ url: '/pages/public/login' })
        return
      }

      if (!this.form.title || !this.form.content) {
        uni.showToast({ title: '请填写标题和正文', icon: 'none' })
        return
      }
      const mediaUrls = [...this.images, ...this.videos]
      const payload = {
        title: this.form.title,
        content: this.form.content,
        coverUrl: this.images[0] || '',
        mediaUrls,
        mediaType: this.mediaTypes[this.mediaIndex],
        status: 1,
        productId: this.form.productId
      }
      uni.showLoading({ title: '发布中...' })
      try {
        await createUgcPost(payload)
        uni.hideLoading()
        uni.showToast({ 
          title: '发布成功！', 
          icon: 'success',
          duration: 1500
        })
        
        // 延迟后跳转到广场页面（tabBar页面）
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/ugc/list',
            success: () => {
              console.log('✅ 已跳转到广场页面')
            },
            fail: (err) => {
              console.error('跳转失败，尝试使用 redirectTo:', err)
              // 如果 switchTab 失败，尝试使用 redirectTo
              uni.redirectTo({
                url: '/pages/ugc/list'
              })
            }
          })
        }, 1500)
      } catch (e) {
        uni.hideLoading()
        const msg = (e && e.msg) || (e && e.message) || '发布失败，请重试'
        uni.showToast({ title: msg, icon: 'none', duration: 2000 })
        console.error('发布失败:', e)
      }
    },
    // 处理搜索输入（防抖）
    handleSearchInput(e) {
      // uni-app的input事件，值在e.detail.value中
      const value = (e && e.detail && e.detail.value) || (e && e.target && e.target.value) || ''
      // 直接更新v-model绑定的值
      this.productSearchKeyword = value
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      // 如果输入为空，清空结果
      if (!this.productSearchKeyword || this.productSearchKeyword.trim() === '') {
        this.productSearchResults = []
        return
      }
      // 防抖：500ms后执行搜索
      this.searchTimer = setTimeout(() => {
        this.searchProducts()
      }, 500)
    },
    // 搜索商品
    async searchProducts() {
      if (!this.productSearchKeyword || this.productSearchKeyword.trim() === '') {
        this.productSearchResults = []
        return
      }
      this.searchingProduct = true
      try {
        const res = await searchProductList({
          keyword: this.productSearchKeyword,
          pageNum: 1,
          pageSize: 20
        })
        if (res && res.data && res.data.list) {
          this.productSearchResults = res.data.list
        } else {
          this.productSearchResults = []
        }
      } catch (e) {
        console.error('搜索商品失败:', e)
        this.productSearchResults = []
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      } finally {
        this.searchingProduct = false
      }
    },
    // 选择商品
    selectProduct(product) {
      this.selectedProduct = product
      this.form.productId = product.id
      this.showProductSearch = false
      this.productSearchKeyword = ''
      this.productSearchResults = []
      // 清除搜索定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
    },
    // 移除商品
    removeProduct() {
      this.selectedProduct = null
      this.form.productId = null
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 0 0 120rpx;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  box-sizing: border-box;
}

/* 顶部标题栏 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx 0 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.15);
}

.header-content {
  padding: 0 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.type-badge {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50rpx;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 500;
  backdrop-filter: blur(10rpx);
}

/* 标题输入区域 */
.title-section {
  background: #ffffff;
  margin: 20rpx 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.label-tip {
  font-size: 24rpx;
  color: #999;
}

.title-input {
  width: 100%;
  padding: 20rpx 24rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
  transition: all 0.3s;
  line-height: 1.5;
  height: auto;
  min-height: 80rpx;
  display: block;
  position: relative;
  z-index: 1;
}

/* 正文输入区域 */
.content-section {
  background: #ffffff;
  margin: 0 24rpx 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.type-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #f0f0f0;
  border-radius: 50rpx;
  font-size: 24rpx;
  color: #666;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
}

.content-textarea {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx 24rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  box-sizing: border-box;
  transition: all 0.3s;
}

.content-textarea:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

/* 媒体上传区域 */
.media-section {
  background: #ffffff;
  margin: 0 24rpx 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.media-count {
  font-size: 24rpx;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 12rpx;
  border-radius: 16rpx;
  border: none;
  font-size: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  height: auto;
}

.image-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.video-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.btn-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
  display: block;
  line-height: 1;
  flex-shrink: 0;
}

.btn-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
  display: block;
  white-space: nowrap;
  line-height: 1.2;
  flex-shrink: 0;
  text-align: center;
}

/* 媒体网格 */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 20rpx;
}

.media-grid.video-grid {
  grid-template-columns: repeat(2, 1fr);
}

.media-thumb {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f5f5;
  border: 2rpx solid #e9ecef;
}

.media-thumb video,
.media-thumb image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-thumb.video {
  padding-top: 70%;
}

.badge {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
  z-index: 2;
}

.del {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: rgba(255, 77, 79, 0.9);
  color: #fff;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 28rpx;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.del:active {
  transform: scale(0.9);
}

/* 底部发布按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 20%, #ffffff 100%);
  backdrop-filter: blur(20rpx);
  z-index: 100;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 0;
  font-size: 0;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.submit-icon {
  font-size: 32rpx;
}

.submit-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 关联商品区域 */
.product-section {
  background: #ffffff;
  margin: 0 24rpx 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.selected-product {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-top: 16rpx;
  position: relative;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 32rpx;
  color: #fa436a;
  font-weight: 700;
}

.remove-product {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 77, 79, 0.9);
  color: #fff;
  border-radius: 50%;
  font-size: 32rpx;
  font-weight: bold;
}

.select-product-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 0;
  margin-top: 16rpx;
}

.select-product-btn .btn-icon {
  font-size: 32rpx;
}

.select-product-btn .btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 商品搜索弹窗 */
.product-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-search-content {
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}

.search-input-wrapper {
  padding: 20rpx 30rpx;
}

.search-input {
  width: 100%;
  padding: 20rpx 24rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  line-height: 1.5;
  min-height: 80rpx;
  display: block;
  -webkit-appearance: none;
  appearance: none;
}

.search-input:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  outline: none;
}

.search-results {
  flex: 1;
  max-height: 60vh;
  padding: 20rpx 30rpx;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.product-item-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.product-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-item-name {
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-item-price {
  font-size: 28rpx;
  color: #fa436a;
  font-weight: 600;
}

.search-loading,
.search-empty {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
</style>
