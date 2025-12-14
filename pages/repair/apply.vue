<template>
	<view class="container">
		<!-- 选择店家 -->
		<view class="store-section">
			<text class="section-title">选择店家</text>
			<view v-if="storeLoading" class="store-loading">加载店家...</view>
			<view v-else class="store-list">
				<view 
					v-for="store in storeList" 
					:key="store.id" 
					class="store-item"
					:class="{ active: activeStoreId === store.id }"
					@click="selectStore(store)"
				>
					<view class="store-header">
						<text class="store-name">{{ store.storeName }}</text>
						<text class="store-score">评分 {{ store.score }}</text>
					</view>
					<text class="store-phone">☎ {{ store.phone }}</text>
					<text class="store-addr">📍 {{ store.address }}</text>
				</view>
			</view>
		</view>

		<!-- 商品信息 -->
		<view class="product-section">
			<image :src="productInfo.productPic" mode="aspectFill" class="product-image"></image>
			<view class="product-info">
				<text class="product-name">{{ productInfo.productName }}</text>
				<text class="product-attr" v-if="productInfo.productAttribute">{{ productInfo.productAttribute }}</text>
			</view>
		</view>
		
		<!-- 报修方式选择 -->
		<view class="repair-type-section">
			<text class="section-title">选择报修方式</text>
			<view class="type-options">
				<view 
					class="type-item" 
					:class="{ active: formData.repairType === 0 }"
					@click="selectRepairType(0)"
				>
					<text class="type-icon">📦</text>
					<text class="type-name">邮寄到商家</text>
				</view>
				<view 
					class="type-item" 
					:class="{ active: formData.repairType === 1 }"
					@click="selectRepairType(1)"
				>
					<text class="type-icon">🏪</text>
					<text class="type-name">线下到店</text>
				</view>
			</view>
		</view>
		
		<!-- 线下到店 - 地图和距离信息 -->
		<view class="map-section" v-if="formData.repairType === 1">
			<text class="section-title">商家位置</text>
			<view class="map-container">
				<!-- #ifdef H5 -->
				<view id="amap-container" class="map-h5"></view>
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<map
					:latitude="shopLatitude"
					:longitude="shopLongitude"
					:markers="markers"
					:scale="15"
					class="map"
					@tap="openMap"
				></map>
				<!-- #endif -->
			</view>
			<view class="distance-info" v-if="shopLatitude && shopLongitude">
				<view class="distance-items" v-if="distanceInfo">
					<view class="distance-item">
						<text class="distance-label">距离：</text>
						<text class="distance-value">{{ formatDistance(distanceInfo.distance) }}</text>
					</view>
					<view class="distance-item">
						<text class="distance-label">步行：</text>
						<text class="distance-value">{{ distanceInfo.walkingTime }}分钟</text>
					</view>
					<view class="distance-item">
						<text class="distance-label">骑车：</text>
						<text class="distance-value">{{ distanceInfo.cyclingTime }}分钟</text>
					</view>
				</view>
				<view class="nav-buttons">
					<button class="nav-btn primary" @click="openAmapNav">高德地图导航</button>
				</view>
			</view>
		</view>
		
		<!-- 邮寄地址 -->
		<view class="address-section" v-if="formData.repairType === 0">
			<text class="section-title">邮寄地址</text>
			<view class="address-info">
				<text class="address-text">{{ shopAddress || '商家地址加载中...' }}</text>
			</view>
			<view class="form-item">
				<text class="label">快递公司</text>
				<input
					class="input"
					v-model="formData.deliveryCompany"
					placeholder="请填写快递公司"
					maxlength="30"
				/>
			</view>
			<view class="form-item">
				<text class="label">快递单号</text>
				<input
					class="input"
					v-model="formData.deliverySn"
					placeholder="请选择邮寄方式时必填"
					maxlength="50"
				/>
			</view>
		</view>
		
		<!-- 报修表单 -->
		<view class="form-section">
			<view class="form-item">
				<text class="label">报修描述</text>
				<textarea 
					class="textarea" 
					v-model="formData.repairContent" 
					placeholder="请详细描述商品的问题..."
					maxlength="500"
					:show-confirm-bar="false"
				></textarea>
				<text class="char-count">{{ formData.repairContent.length }}/500</text>
			</view>
			
			<view class="form-item">
				<text class="label">上传图片（可选）</text>
				<view class="upload-section">
					<view class="image-list">
						<view v-for="(item, index) in imageList" :key="index" class="image-item">
							<image :src="item" mode="aspectFill" @click="previewImage(index)"></image>
							<text class="delete-btn" @click="deleteImage(index)">×</text>
						</view>
						<view v-if="imageList.length < 5" class="upload-btn" @click="chooseImage">
							<text class="yticon icon-add"></text>
							<text class="upload-text">添加图片</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="form-item">
				<text class="label">联系人</text>
				<input 
					class="input" 
					v-model="formData.contactName" 
					placeholder="请输入联系人姓名"
					maxlength="20"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">联系电话</text>
				<input 
					class="input" 
					v-model="formData.contactPhone" 
					placeholder="请输入联系电话"
					type="number"
					maxlength="11"
				/>
			</view>
		</view>
		
		<!-- 提交按钮 -->
		<view class="submit-section">
			<button class="submit-btn" :disabled="submitting || !canSubmit" @click="submitRepair">
				{{ submitting ? '提交中...' : '提交报修' }}
			</button>
		</view>
	</view>
</template>

<script>
import { createRepair, getBrandDetail, getBrandStores } from '@/api/repair.js'
import { AMAP_KEY } from '@/utils/config.js'
import logger from '@/utils/logger.js'
import { showError } from '@/utils/errorHandler.js'

export default {
	data() {
		return {
			productInfo: {
				productId: null,
				productName: '',
				productPic: '',
				productAttribute: '',
				brandId: null,
				brandName: ''
			},
			formData: {
				repairType: null, // 0-邮寄，1-线下到店
				repairContent: '',
				contactName: '',
				contactPhone: '',
					deliveryCompany: '',
					deliverySn: '',
				orderId: null,
				orderItemId: null,
				productId: null,
				brandId: null,
				userLongitude: null,
				userLatitude: null,
				userAddress: '',
				shopLongitude: null,
				shopLatitude: null,
				shopAddress: '',
				storeId: null,
				storeName: '',
				storePhone: '',
				storeScore: null
			},
			imageList: [],
			submitting: false,
			shopAddress: '',
			shopLatitude: null,
			shopLongitude: null,
			userLatitude: null,
			userLongitude: null,
			distanceInfo: null,
			markers: [],
			storeList: [],
			storeLoading: false,
			activeStoreId: null,
			// 品牌关键字映射（别称 -> 主品牌）
			brandKeywordMap: {
				'小米': ['小米', 'Xiaomi', 'Redmi'],
				'华为': ['华为', 'Huawei', 'Honor', 'Mate'],
				'Apple': ['Apple', '苹果', 'iPhone', 'iPad', 'Mac'],
				'OPPO': ['OPPO', 'OnePlus', 'Reno', 'Find X'],
				'三星': ['三星', 'Samsung', 'Galaxy', 'Z Fold', 'Z Flip'],
				'华硕': ['华硕', 'ASUS', 'ROG', 'ZenBook', 'TUF'],
				'惠普': ['惠普', 'HP', 'OMEN', 'Pavilion', 'EliteBook'],
				'戴尔': ['戴尔', 'Dell', 'Alienware', 'XPS', 'Latitude'],
				'联想': ['联想', 'Lenovo', 'ThinkPad', 'Yoga', 'Legion']
			},
			// H5 地图相关
			amapLoaded: false,
			amapInstance: null,
			amapJsKey: AMAP_KEY
		}
	},
	computed: {
		canSubmit() {
			return this.formData.storeId &&
				   this.formData.repairType !== null &&
				   this.formData.repairContent.trim() && 
				   this.formData.contactName.trim() && 
				   this.formData.contactPhone.trim() &&
				   /^1[3-9]\d{9}$/.test(this.formData.contactPhone) &&
				   (this.formData.repairType !== 0 || this.formData.deliverySn.trim())
		}
	},
	onLoad(options) {
		// 从订单详情页传入
		if (options.orderId) {
			this.formData.orderId = parseInt(options.orderId)
		}
		if (options.orderItemId) {
			this.formData.orderItemId = parseInt(options.orderItemId)
		}
		if (options.productId) {
			this.formData.productId = parseInt(options.productId)
			this.productInfo.productId = parseInt(options.productId)
		}
		if (options.productName) {
			this.formData.productName = decodeURIComponent(options.productName)
			this.productInfo.productName = decodeURIComponent(options.productName)
		}
		if (options.brandName) {
			this.productInfo.brandName = decodeURIComponent(options.brandName)
		}
		if (options.productPic) {
			this.productInfo.productPic = decodeURIComponent(options.productPic)
		}
		if (options.productAttribute) {
			this.productInfo.productAttribute = decodeURIComponent(options.productAttribute)
		}
		if (options.brandId) {
			this.formData.brandId = parseInt(options.brandId)
			this.productInfo.brandId = parseInt(options.brandId)
			this.loadBrandInfo(true)
		} else {
			this.initStores()
		}
		
		// 如果是线下到店，获取用户位置
		if (this.formData.repairType === 1) {
			this.getUserLocation()
		}
	},
	methods: {
		async initStores() {
			this.storeLoading = true
			try {
				const brand = this.detectBrandName()
				if (brand) {
					this.productInfo.brandName = brand
				}
				const res = await getBrandStores({ brandName: this.productInfo.brandName || brand })
				const list = (res && res.data) ? res.data : []
				const finalList = (list && list.length) ? list : [{
					storeName: `${this.productInfo.brandName || '品牌'}授权服务中心`,
					phone: '400-000-0000',
					address: '请联系人工确认门店',
					latitude: null,
					longitude: null,
					score: 4.5
				}]
				this.storeList = finalList.map((s, idx) => ({ id: idx + 1, ...s }))
			} catch (error) {
				logger.error('加载门店失败', error)
				this.storeList = [{
					id: 1,
					storeName: '门店加载失败，请稍后再试',
					phone: '',
					address: '',
					latitude: null,
					longitude: null,
					score: null
				}]
			} finally {
				this.storeLoading = false
			}
		},
		detectBrandName() {
			// 优先已有品牌名
			if (this.productInfo.brandName) {
				return this.productInfo.brandName
			}
			const nameStr = `${this.productInfo.productName || ''} ${this.productInfo.productAttribute || ''}`.toLowerCase()
			let matchedBrand = ''
			Object.keys(this.brandKeywordMap).some(brand => {
				const keywords = this.brandKeywordMap[brand]
				const hit = keywords.some(k => nameStr.includes(k.toLowerCase()))
				if (hit) {
					matchedBrand = brand
					return true
				}
				return false
			})
			return matchedBrand
		},
		selectStore(store) {
			this.activeStoreId = store.id
			this.formData.storeId = store.id
			this.formData.storeName = store.storeName
			this.formData.storePhone = store.phone
			this.formData.storeScore = store.score
			this.shopAddress = store.address
			this.formData.shopAddress = store.address
			// 设置门店坐标，若无坐标则根据地址进行地理编码
			this.setShopLocation(store)
			// 重置报修方式，要求先选店再选方式
			this.formData.repairType = null
		},
		setShopLocation(store) {
			const lat = store.latitude
			const lng = store.longitude
			if (lat && lng) {
				this.shopLatitude = Number(lat)
				this.shopLongitude = Number(lng)
				this.formData.shopLatitude = this.shopLatitude
				this.formData.shopLongitude = this.shopLongitude
				this.markers = [{
					id: store.id,
					latitude: this.shopLatitude,
					longitude: this.shopLongitude,
					title: store.storeName
				}]
				return
			}
			// 无坐标则按地址地理编码
			if (!store.address) return
			uni.request({
				url: 'https://restapi.amap.com/v3/geocode/geo',
				data: {
					key: AMAP_KEY,
					address: store.address
				},
				success: (res) => {
					const geos = res.data && res.data.geocodes
					if (geos && geos.length > 0) {
						const loc = geos[0].location // "lng,lat"
						const [lngStr, latStr] = loc.split(',')
						this.shopLongitude = Number(lngStr)
						this.shopLatitude = Number(latStr)
						this.formData.shopLongitude = this.shopLongitude
						this.formData.shopLatitude = this.shopLatitude
						this.markers = [{
							id: store.id,
							latitude: this.shopLatitude,
							longitude: this.shopLongitude,
							title: store.storeName
						}]
					}
				}
			})
		},
		selectRepairType(type) {
			if (!this.formData.storeId) {
				uni.showToast({ title: '请先选择店家', icon: 'none' })
				return
			}
			this.formData.repairType = type
			if (type === 1) {
				// 线下到店，获取用户位置
				this.getUserLocation()
				// #ifdef H5
				// H5 平台初始化地图
				this.$nextTick(() => {
					this.initH5Map()
				})
				// #endif
			}
		},
		async loadBrandInfo(initAfterLoad = false) {
			if (!this.formData.brandId) return
			
			try {
				const res = await getBrandDetail(this.formData.brandId)
				if (res.code === 200 && res.data) {
					const brand = res.data
					this.productInfo.brandName = brand.name
					// 假设品牌表有address、longitude、latitude字段
					// 如果没有，需要先在后台添加这些字段
					if (brand.address) {
						this.shopAddress = brand.address
						this.formData.shopAddress = brand.address
					}
					if (brand.longitude && brand.latitude) {
						this.shopLongitude = parseFloat(brand.longitude)
						this.shopLatitude = parseFloat(brand.latitude)
						this.formData.shopLongitude = this.shopLongitude
						this.formData.shopLatitude = this.shopLatitude
						this.updateMarkers()
					}
				}
				if (initAfterLoad) {
					this.initStores()
				}
			} catch (e) {
				logger.error('加载品牌信息失败:', e)
				showError(e, '加载品牌信息失败')
				if (initAfterLoad) {
					this.initStores()
				}
			}
		},
		getUserLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.userLatitude = res.latitude
					this.userLongitude = res.longitude
					this.formData.userLatitude = res.latitude
					this.formData.userLongitude = res.longitude
					
					// 逆地理编码获取地址
					uni.request({
						url: `https://restapi.amap.com/v3/geocode/regeo`,
						data: {
							key: AMAP_KEY,
							location: `${res.longitude},${res.latitude}`
						},
						success: (addrRes) => {
							if (addrRes.data.status === '1' && addrRes.data.regeocode) {
								this.formData.userAddress = addrRes.data.regeocode.formatted_address
							}
						}
					})
					
					// 计算距离和时间
					if (this.shopLatitude && this.shopLongitude) {
						this.calculateDistance()
						// #ifndef H5
						this.updateMarkers()
						// #endif
						// #ifdef H5
						// H5 平台更新地图标记
						if (this.amapInstance) {
							this.createAmapMap()
						}
						// #endif
					}
				},
				fail: (err) => {
					uni.showToast({
						title: '获取位置失败，请开启定位权限',
						icon: 'none'
					})
				}
			})
		},
		calculateDistance() {
			if (!this.userLatitude || !this.userLongitude || !this.shopLatitude || !this.shopLongitude) {
				return
			}
			
			// 使用高德地图距离计算API
			uni.request({
				url: 'https://restapi.amap.com/v3/direction/walking',
				data: {
					key: AMAP_KEY,
					origin: `${this.userLongitude},${this.userLatitude}`,
					destination: `${this.shopLongitude},${this.shopLatitude}`
				},
				success: (res) => {
					if (res.data.status === '1' && res.data.route && res.data.route.paths && res.data.route.paths.length > 0) {
						const path = res.data.route.paths[0]
						const distance = path.distance // 米
						const duration = path.duration // 秒
						
						this.distanceInfo = {
							distance: distance,
							walkingTime: Math.ceil(duration / 60),
							cyclingTime: Math.ceil(distance / 1000 / 15 * 60) // 假设骑车速度15km/h
						}
						
						this.formData.distance = distance
						this.formData.walkingTime = this.distanceInfo.walkingTime
						this.formData.cyclingTime = this.distanceInfo.cyclingTime
					}
				}
			})
		},
		updateMarkers() {
			this.markers = [
				{
					id: 1,
					latitude: this.userLatitude,
					longitude: this.userLongitude,
					iconPath: '/static/location-user.png',
					width: 30,
					height: 30,
					callout: {
						content: '我的位置',
						color: '#333',
						fontSize: 12
					}
				},
				{
					id: 2,
					latitude: this.shopLatitude,
					longitude: this.shopLongitude,
					iconPath: '/static/location-shop.png',
					width: 30,
					height: 30,
					callout: {
						content: this.productInfo.brandName || '商家位置',
						color: '#333',
						fontSize: 12
					}
				}
			]
		},
		openMap() {
			// 点击地图也可以导航
			this.openAmapNav()
		},
		// #ifdef H5
		initH5Map() {
			if (!this.shopLatitude || !this.shopLongitude) {
				return
			}
			this.ensureAmapScript()
		},
		ensureAmapScript() {
			if (this.amapLoaded) {
				this.createAmapMap()
				return
			}
			const scriptId = 'amap-sdk-repair'
			if (document.getElementById(scriptId)) {
				this.createAmapMap()
				return
			}
			const script = document.createElement('script')
			script.id = scriptId
			script.type = 'text/javascript'
			script.src = `https://webapi.amap.com/maps?v=2.0&key=${this.amapJsKey}`
			script.onload = () => {
				this.amapLoaded = true
				this.createAmapMap()
			}
			script.onerror = () => {
				logger.error('地图加载失败，请检查网络')
				showError('地图加载失败，请检查网络')
			}
			document.body.appendChild(script)
		},
		createAmapMap() {
			if (!window.AMap) {
				return
			}
			const container = document.getElementById('amap-container')
			if (!container) {
				return
			}
			// 如果地图已存在，先销毁
			if (this.amapInstance) {
				this.amapInstance.destroy()
				this.amapInstance = null
			}
			this.amapInstance = new AMap.Map('amap-container', {
				zoom: 15,
				center: [this.shopLongitude, this.shopLatitude]
			})
			
			// 添加商家标记
			if (this.shopLatitude && this.shopLongitude) {
				new AMap.Marker({
					position: [this.shopLongitude, this.shopLatitude],
					title: this.productInfo.brandName || '商家位置',
					map: this.amapInstance
				})
			}
			
			// 添加用户位置标记
			if (this.userLatitude && this.userLongitude) {
				new AMap.Marker({
					position: [this.userLongitude, this.userLatitude],
					title: '我的位置',
					icon: new AMap.Icon({
						size: new AMap.Size(30, 30),
						image: 'https://webapi.amap.com/theme/v1.3/markers/n/mid_r.png'
					}),
					map: this.amapInstance
				})
			}
		},
		// #endif
		openAmapNav() {
			if (!this.shopLatitude || !this.shopLongitude) {
				uni.showToast({
					title: '商家位置信息不完整',
					icon: 'none'
				})
				return
			}
			
			const shopName = encodeURIComponent(this.productInfo.brandName || '商家位置')
			
			// 打开高德地图导航
			// #ifdef APP-PLUS
			// APP端使用高德地图APP导航
			const amapUrl = `androidamap://navi?sourceApplication=appname&poiname=${shopName}&lat=${this.shopLatitude}&lon=${this.shopLongitude}&dev=0`
			plus.runtime.openURL(amapUrl, (error) => {
				// 如果高德地图APP未安装，提示用户
				if (error) {
					uni.showModal({
						title: '提示',
						content: '未检测到高德地图APP，是否下载安装？',
						confirmText: '去下载',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								// 打开应用商店下载高德地图
								plus.runtime.openURL('https://mobile.amap.com/')
							}
						}
					})
				}
			})
			// #endif
			// #ifdef H5
			// H5 直接打开高德地图网页导航
			const location = `${this.shopLongitude},${this.shopLatitude}`
			window.open(`https://uri.amap.com/navigation?to=${location}&toName=${shopName}&mode=car`)
			// #endif
			// #ifdef MP-WEIXIN
			// 微信小程序使用内置地图导航
			uni.openLocation({
				latitude: this.shopLatitude,
				longitude: this.shopLongitude,
				name: this.productInfo.brandName || '商家位置',
				address: this.shopAddress || '',
				scale: 18
			})
			// #endif
		},
		formatDistance(distance) {
			if (distance < 1000) {
				return distance + '米'
			}
			return (distance / 1000).toFixed(2) + '公里'
		},
		chooseImage() {
			uni.chooseImage({
				count: 5 - this.imageList.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.imageList = this.imageList.concat(res.tempFilePaths)
				}
			})
		},
		deleteImage(index) {
			this.imageList.splice(index, 1)
		},
		previewImage(index) {
			uni.previewImage({
				urls: this.imageList,
				current: index
			})
		},
		async submitRepair() {
			if (!this.canSubmit) {
				uni.showToast({
					title: '请完善报修信息',
					icon: 'none'
				})
				return
			}
			
			this.submitting = true
			
			try {
				// 处理图片上传（这里简化处理，实际应该上传到服务器）
				const pics = this.imageList.join(',')
				
				const submitData = {
					...this.formData,
					repairPics: pics,
					productName: this.productInfo.productName,
					productPic: this.productInfo.productPic,
					brandName: this.productInfo.brandName
				}
				
				const res = await createRepair(submitData)
				
				if (res.code === 200) {
					uni.showToast({
						title: '报修申请提交成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.message || '提交失败',
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '提交失败：' + (e.message || '网络错误'),
					icon: 'none'
				})
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding: 20rpx;
	background: #f7f8fa;
	min-height: 100vh;
}
.store-section {
	background: #fff;
	padding: 20rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	.store-list {
		margin-top: 16rpx;
	}
	.store-item {
		border: 1rpx solid #e5e7eb;
		border-radius: 12rpx;
		padding: 18rpx;
		margin-bottom: 12rpx;
		background: #fff;
		transition: all 0.2s ease;
	}
	.store-item.active {
		border-color: #1f7aec;
		box-shadow: 0 6rpx 18rpx rgba(31, 122, 236, 0.12);
		background: #f2f6fd;
	}
	.store-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}
	.store-name {
		font-size: 30rpx;
		font-weight: 600;
	}
	.store-score {
		color: #e53935;
		font-size: 26rpx;
	}
	.store-phone, .store-addr {
		display: block;
		color: #4b5563;
		font-size: 24rpx;
		margin-top: 4rpx;
	}
	.store-loading {
		color: #8b95a1;
		font-size: 26rpx;
		margin-top: 10rpx;
	}
}

.product-section {
	display: flex;
	background: #fff;
	padding: 20rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	
	.product-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}
	
	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		
		.product-name {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.product-attr {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.repair-type-section {
	background: #fff;
	padding: 30rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.type-options {
		display: flex;
		justify-content: space-around;
		
		.type-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 30rpx 40rpx;
			border: 2rpx solid #e0e0e0;
			border-radius: 10rpx;
			transition: all 0.3s;
			
			&.active {
				border-color: #1f7aec;
				background: #eaf2ff;
			}
			
			.type-icon {
				font-size: 60rpx;
				margin-bottom: 10rpx;
			}
			
			.type-name {
				font-size: 28rpx;
				color: #333;
			}
		}
	}
}

.map-section {
	background: #fff;
	padding: 30rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.map-container {
		width: 100%;
		height: 400rpx;
		margin-bottom: 20rpx;
		
		.map {
			width: 100%;
			height: 100%;
		}
		
		.map-h5 {
			width: 100%;
			height: 100%;
		}
	}
	
	.distance-info {
		padding: 20rpx;
		background: #f0f4f8;
		border-radius: 10rpx;
		
		.distance-items {
			display: flex;
			align-items: center;
			justify-content: space-around;
			margin-bottom: 20rpx;
			
			.distance-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.distance-label {
					font-size: 24rpx;
					color: #8b95a1;
					margin-bottom: 5rpx;
				}
				
				.distance-value {
					font-size: 28rpx;
					color: #1f7aec;
					font-weight: bold;
				}
			}
		}
		
		.nav-buttons {
			display: flex;
			
			.nav-btn {
				width: 100%;
				height: 70rpx;
				line-height: 70rpx;
				text-align: center;
				border: none;
				border-radius: 35rpx;
				font-size: 28rpx;
				background: #1f7aec;
				color: #fff;
			}
		}
	}
}

.address-section {
	background: #fff;
	padding: 30rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.address-info {
		padding: 20rpx;
		background: #f0f4f8;
		border-radius: 10rpx;
		
		.address-text {
			font-size: 28rpx;
			color: #4b5563;
			line-height: 1.6;
		}
	}
}

.form-section {
	background: #fff;
	padding: 30rpx;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
	
	.form-item {
		margin-bottom: 30rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 15rpx;
			display: block;
		}
		
		.textarea {
			width: 100%;
			min-height: 200rpx;
			padding: 20rpx;
			background: #f0f4f8;
			border-radius: 10rpx;
			font-size: 28rpx;
			color: #333;
		}
		
		.char-count {
			font-size: 24rpx;
			color: #8b95a1;
			text-align: right;
			margin-top: 10rpx;
			display: block;
		}
		
		.input {
			width: 100%;
			height: 80rpx;
			padding: 0 20rpx;
			background: #f5f5f5;
			border-radius: 10rpx;
			font-size: 28rpx;
			color: #333;
		}
		
		.upload-section {
			.image-list {
				display: flex;
				flex-wrap: wrap;
				
				.image-item {
					position: relative;
					width: 150rpx;
					height: 150rpx;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
					
					image {
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
					}
					
					.delete-btn {
						position: absolute;
						top: -10rpx;
						right: -10rpx;
						width: 40rpx;
						height: 40rpx;
						background: #1f7aec;
						color: #fff;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 30rpx;
					}
				}
				
				.upload-btn {
					width: 150rpx;
					height: 150rpx;
					border: 2rpx dashed #cbd5e1;
					border-radius: 10rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					
					.icon-add {
						font-size: 50rpx;
						color: #999;
						margin-bottom: 10rpx;
					}
					
					.upload-text {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
	}
}

.submit-section {
	padding: 30rpx 0;
	
	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: #1f7aec;
		color: #fff;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
		
		&[disabled] {
			background: #cbd5e1;
		}
	}
}
</style>

