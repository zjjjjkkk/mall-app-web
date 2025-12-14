<template>
	<view class="container">
		<!-- 顶部搜索和定位区域 -->
		<view class="top-header">
			<!-- 搜索框 -->
			<view class="search-section">
				<view class="search-box" @click="onSearch">
					<text class="search-icon">🔍</text>
					<input 
						class="search-input" 
						type="text" 
						v-model="searchKeyword" 
						placeholder="搜索商品" 
						@confirm="handleSearch"
						@focus="onSearch"
						:disabled="false"
					/>
				</view>
			</view>
			<!-- 定位信息 -->
			<view class="location-section" @click="getCurrentLocation">
				<view class="location-wrapper">
					<text class="location-icon">📍</text>
					<text class="location-text">{{ currentLocationText }}</text>
				</view>
			</view>
		</view>

		<!-- 头部轮播 -->
		<view class="carousel-section">
			<swiper class="carousel" circular @change="swiperChange">
				<swiper-item v-for="(item, index) in advertiseList" :key="index" class="carousel-item"
					@click="navToAdvertisePage(item)" v-if="item && item.pic">
					<image :src="item.pic || '/static/images/default-product.png'" />
				</swiper-item>
			</swiper>
			<!-- 自定义swiper指示器 -->
			<view class="swiper-dots">
				<text class="num">{{ swiperCurrent + 1 }}</text>
				<text class="sign">/</text>
				<text class="num">{{ swiperLength }}</text>
			</view>
		</view>
		<!-- 快捷功能区 -->
		<view class="quick-access-section">
			<view class="quick-access-item" @click="navTo('/pages/category/category')">
				<view class="quick-icon-wrapper">
					<text class="quick-icon">📦</text>
				</view>
				<text class="quick-text">分类</text>
			</view>
			<view class="quick-access-item" @click="navTo('/pages/coupon/couponList')">
				<view class="quick-icon-wrapper">
					<text class="quick-icon">🎫</text>
				</view>
				<text class="quick-text">优惠券</text>
			</view>
			<view class="quick-access-item" @click="navTo('/pages/brand/list')">
				<view class="quick-icon-wrapper">
					<text class="quick-icon">🏷️</text>
				</view>
				<text class="quick-text">品牌</text>
			</view>
			<view class="quick-access-item" @click="navTo('/pages/product/newProductList')">
				<view class="quick-icon-wrapper">
					<text class="quick-icon">✨</text>
				</view>
				<text class="quick-text">新品</text>
			</view>
		</view>

		<!-- 品牌制造商直供 -->
		<view class="section-card">
			<view class="section-header" @click="navToRecommendBrandPage()">
				<view class="section-title-wrapper">
					<text class="section-icon">🏭</text>
					<view class="section-title-box">
						<text class="section-title">品牌制造商直供</text>
						<text class="section-subtitle">工厂直达消费者，剔除品牌溢价</text>
					</view>
				</view>
				<text class="section-more">更多 ></text>
			</view>
			<scroll-view class="brand-scroll" scroll-x>
				<view class="brand-list">
					<view v-for="(item, index) in brandList" :key="index" class="brand-item"
						@click="navToBrandDetailPage(item)" v-if="item && item.logo">
						<view class="brand-image-wrapper">
							<image :src="item.logo || '/static/images/default-brand.png'" mode="aspectFit"></image>
						</view>
						<text class="brand-name clamp">{{ item.name || '' }}</text>
						<text class="brand-count">{{ item.productCount || 0 }}件商品</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 秒杀专区 -->
		<view class="section-card flash-section" v-if="homeFlashPromotion !== null">
			<view class="section-header flash-header">
				<view class="section-title-wrapper">
					<text class="section-icon flash-icon">⚡</text>
					<view class="section-title-box">
						<text class="section-title flash-title">限时秒杀</text>
						<text class="section-subtitle">下一场 {{ homeFlashPromotion.nextStartTime | formatTime }} 开始</text>
					</view>
				</view>
				<view class="countdown-box">
					<text class="countdown-label">距结束</text>
					<view class="countdown-timer">
						<text class="timer-item">{{ String(cutDownTime.endHour).padStart(2, '0') }}</text>
						<text class="timer-separator">:</text>
						<text class="timer-item">{{ String(cutDownTime.endMinute).padStart(2, '0') }}</text>
						<text class="timer-separator">:</text>
						<text class="timer-item">{{ String(cutDownTime.endSecond).padStart(2, '0') }}</text>
					</view>
				</view>
			</view>
			<scroll-view class="product-scroll" scroll-x>
				<view class="product-list-horizontal">
					<view v-for="(item, index) in homeFlashPromotion.productList" :key="index" class="product-item-horizontal"
						@click="navToDetailPage(item)" v-if="item && item.pic">
						<view class="product-image-wrapper">
							<image :src="item.pic || '/static/images/default-product.png'" mode="aspectFill"></image>
							<view class="flash-badge">秒杀</view>
						</view>
						<view class="product-info">
							<text class="product-price">￥{{ item.price || 0 }}</text>
							<text class="product-name clamp">{{ item.name || '' }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 新鲜好物 -->
		<view class="section-card">
			<view class="section-header" @click="navToNewProudctListPage()">
				<view class="section-title-wrapper">
					<text class="section-icon">🆕</text>
					<view class="section-title-box">
						<text class="section-title">新鲜好物</text>
						<text class="section-subtitle">为你寻觅世间好物</text>
					</view>
				</view>
				<text class="section-more">更多 ></text>
			</view>
			<scroll-view class="product-scroll" scroll-x>
				<view class="product-list-horizontal">
					<view v-for="(item, index) in newProductList" :key="index" class="product-item-horizontal"
						@click="navToDetailPage(item)" v-if="item && item.pic">
						<view class="product-image-wrapper">
							<image :src="item.pic || '/static/images/default-product.png'" mode="aspectFill"></image>
							<view class="new-badge">新品</view>
						</view>
						<view class="product-info">
							<text class="product-name clamp">{{ item.name || '' }}</text>
							<text class="product-subtitle clamp">{{ item.subTitle || '' }}</text>
							<text class="product-price">￥{{ item.price || 0 }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 人气推荐 -->
		<view class="section-card">
			<view class="section-header" @click="navToHotProudctListPage()">
				<view class="section-title-wrapper">
					<text class="section-icon">🔥</text>
					<view class="section-title-box">
						<text class="section-title">人气推荐</text>
						<text class="section-subtitle">大家都赞不绝口的</text>
					</view>
				</view>
				<text class="section-more">更多 ></text>
			</view>
			<view class="hot-product-grid">
				<view v-for="(item, index) in hotProductList.slice(0, 5)" :key="index" class="hot-product-item"
					@click="navToDetailPage(item)" v-if="item && item.pic">
					<view class="hot-product-image">
						<image :src="item.pic || '/static/images/default-product.png'" mode="aspectFill"></image>
						<view class="hot-badge">热销</view>
					</view>
					<view class="hot-product-content">
						<text class="hot-product-name clamp">{{ item.name || '' }}</text>
						<text class="hot-product-subtitle clamp">{{ item.subTitle || '' }}</text>
						<view class="hot-product-footer">
							<text class="hot-product-price">￥{{ item.price || 0 }}</text>
							<text class="hot-product-tag">热卖中</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 猜你喜欢 -->
		<view class="section-card">
			<view class="section-header">
				<view class="section-title-wrapper">
					<text class="section-icon">❤️</text>
					<view class="section-title-box">
						<text class="section-title">猜你喜欢</text>
						<text class="section-subtitle">为你精心推荐</text>
					</view>
				</view>
			</view>
			<view class="product-grid">
				<view v-for="(item, index) in recommendProductList.slice(0, 10)" :key="index" class="product-card"
					@click="navToDetailPage(item)" v-if="item && item.pic">
					<view class="product-image-container">
						<image :src="item.pic || '/static/images/default-product.png'" mode="aspectFill"></image>
					</view>
					<view class="product-card-content">
						<text class="product-card-name clamp">{{ item.name || '' }}</text>
						<text class="product-card-subtitle clamp">{{ item.subTitle || '' }}</text>
						<view class="product-card-footer">
							<text class="product-card-price">￥{{ item.price || 0 }}</text>
							<text class="product-card-sale" v-if="item.sale">已售{{ item.sale }}</text>
						</view>
					</view>
				</view>
			</view>
			<uni-load-more :status="loadingType"></uni-load-more>
		</view>
	</view>
</template>

<script>
import {
	fetchContent,
	fetchRecommendProductList,
	fetchLocationAddress
} from '@/api/home.js'
import {
	formatDate
} from '@/utils/date'
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
export default {
	components: {
		uniLoadMore
	},
	data () {
		return {

			swiperCurrent: 0,
			swiperLength: 0,
			carouselList: [],
			goodsList: [],
			advertiseList: [],
			brandList: [],
			homeFlashPromotion: [],
			newProductList: [],
			hotProductList: [],
			recommendProductList: [],
			recommendParams: {
				pageNum: 1,
				pageSize: 10
			},
			loadingType: 'more',
			currentLocation: null,
			currentLocationText: '点击获取定位',
			searchKeyword: ''
		}
	},
	onLoad () {
		this.loadData()
	},
	//下拉刷新
	onPullDownRefresh () {
		this.recommendParams.pageNum = 1
		this.loadData()
	},
		//加载更多（猜你喜欢只展示10个商品，禁用加载更多）
		onReachBottom () {
			// 猜你喜欢只展示10个商品，不加载更多
			if (this.recommendProductList.length >= 10) {
				this.loadingType = 'nomore'
				return
			}
			this.recommendParams.pageNum++
			this.loadingType = 'loading'
			fetchRecommendProductList(this.recommendParams).then(response => {
				// 过滤掉 null 值和没有 pic 的商品
				let addProductList = (response.data || []).filter(item => item != null && item.pic != null)
				// 限制总数不超过10个
				const remaining = 10 - this.recommendProductList.length
				const limitedList = addProductList.slice(0, remaining)
				
				if (limitedList.length === 0 || this.recommendProductList.length + limitedList.length >= 10) {
					this.loadingType = 'nomore'
					if (this.recommendParams.pageNum > 1) {
						this.recommendParams.pageNum--
					}
				} else {
					this.loadingType = 'more'
				}
				this.recommendProductList = this.recommendProductList.concat(limitedList)
			})
		},
	computed: {
		cutDownTime () {
			let endTime = new Date(this.homeFlashPromotion.endTime)
			let endDateTime = new Date()
			let startDateTime = new Date()
			endDateTime.setHours(endTime.getHours())
			endDateTime.setMinutes(endTime.getMinutes())
			endDateTime.setSeconds(endTime.getSeconds())
			let offsetTime = (endDateTime.getTime() - startDateTime.getTime())
			let endHour = Math.floor(offsetTime / (60 * 60 * 1000))
			let offsetMinute = offsetTime % (60 * 60 * 1000)
			let endMinute = Math.floor(offsetMinute / (60 * 1000))
			let offsetSecond = offsetTime % (60 * 1000)
			let endSecond = Math.floor(offsetSecond / 1000)
			return {
				endHour: endHour,
				endMinute: endMinute,
				endSecond: endSecond
			}
		}
	},
	filters: {
		formatTime (time) {
			if (time == null || time === '') {
				return 'N/A'
			}
			let date = new Date(time)
			return formatDate(date, 'hh:mm:ss')
		},
	},
	methods: {
		/**
		 * 加载数据
		 */
		async loadData () {
			fetchContent().then(response => {
				console.log("onLoad", response.data)
				this.getCurrentLocation()
				// 过滤掉 null 值并确保数据安全
				this.advertiseList = (response.data.advertiseList || []).filter(item => item != null)
				this.swiperLength = this.advertiseList.length

				this.brandList = (response.data.brandList || []).filter(item => item != null)
				
				// 处理秒杀数据
				if (response.data.homeFlashPromotion) {
					const flashPromotion = response.data.homeFlashPromotion
					if (flashPromotion.productList) {
						flashPromotion.productList = flashPromotion.productList.filter(item => item != null && item.pic != null)
					}
					this.homeFlashPromotion = flashPromotion
				} else {
					this.homeFlashPromotion = null
				}
				
				// 过滤新品列表中的 null 值
				this.newProductList = (response.data.newProductList || []).filter(item => item != null && item.pic != null)
				
				// 过滤人气推荐列表中的 null 值
				this.hotProductList = (response.data.hotProductList || []).filter(item => item != null && item.pic != null)
				
				fetchRecommendProductList(this.recommendParams).then(response => {
					// 过滤推荐商品列表中的 null 值，并限制最多10个商品
					const filteredList = (response.data || []).filter(item => item != null && item.pic != null)
					this.recommendProductList = filteredList.slice(0, 10)
					uni.stopPullDownRefresh()
				})
			})
		},
		//轮播图切换修改背景色
		swiperChange (e) {
			const index = e.detail.current
			this.swiperCurrent = index
		},
		//商品详情页
		navToDetailPage (item) {
			if (!item || !item.id) {
				console.error('商品数据无效', item)
				return
			}
			let id = item.id
			uni.navigateTo({
				url: `/pages/product/product?id=${id}`
			})
		},
		//广告详情页
		navToAdvertisePage (item) {
			let id = item.id
			console.log("navToAdvertisePage", item)
		},
		//品牌详情页
		navToBrandDetailPage (item) {
			if (!item || !item.id) {
				console.error('品牌数据无效', item)
				return
			}
			let id = item.id
			uni.navigateTo({
				url: `/pages/brand/brandDetail?id=${id}`
			})
		},
		//推荐品牌列表页
		navToRecommendBrandPage () {
			uni.navigateTo({
				url: `/pages/brand/list`
			})
		},
		//新鲜好物列表页
		navToNewProudctListPage () {
			uni.navigateTo({
				url: `/pages/product/newProductList`
			})
		},
		//人气推荐列表页
		navToHotProudctListPage () {
			uni.navigateTo({
				url: `/pages/product/hotProductList`
			})
		},
		getCurrentLocation () {
			uni.getLocation({
				type: 'wgs84',
				success: async (res) => {
					this.currentLocation = res
					const lat = Number(res.latitude) || 0
					const lng = Number(res.longitude) || 0
					const displayName =
						(await this.fetchAddressByLngLat(lng, lat)) ||
						`${lat.toFixed(4)}, ${lng.toFixed(4)}`
					this.currentLocationText = displayName
					this.$api.msg(`当前位置：${displayName}`)
				},
				fail: (err) => {
					// 定位失败，静默处理
					this.$api.msg('定位失败，请检查浏览器权限或使用 HTTPS')
					this.currentLocationText = '定位失败，点击重试'
				}
			})
		},
		// 搜索框点击/聚焦
		onSearch () {
			// 跳转到搜索页面
			uni.navigateTo({
				url: `/pages/search/search${this.searchKeyword ? '?keyword=' + encodeURIComponent(this.searchKeyword.trim()) : ''}`
			})
		},
		// 搜索商品（回车或确认搜索）
		handleSearch () {
			const keyword = this.searchKeyword ? this.searchKeyword.trim() : '';
			// 跳转到搜索页面并传递搜索关键词
			uni.navigateTo({
				url: `/pages/search/search${keyword ? '?keyword=' + encodeURIComponent(keyword) : ''}`
			})
		},
		// 导航跳转
		navTo (url) {
			uni.navigateTo({
				url: url
			})
		},
		async fetchAddressByLngLat (lng, lat) {
			try {
				const response = await fetchLocationAddress({ lat, lng })
				const payload = response?.data ?? response ?? {}
				const province = payload.province || ''
				const city = payload.city || ''
				
				// 只显示省市信息
				if (province && city) {
					// 如果省和市相同（如直辖市），只显示市
					if (province === city || city.includes(province)) {
						return city
					}
					// 否则显示 "省 市"
					return `${province} ${city}`
				} else if (city) {
					return city
				} else if (province) {
					return province
				}
				return ''
			} catch (error) {
				// 地址解析失败，返回空字符串
				return ''
			}
		},
	},
	// 导航栏相关功能已移除
}
</script>

<style lang="scss">
// 定义主题色和通用变量
$primary-color: #fa436a;
$bg-color: #f5f5f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;
$border-color: #eeeeee;
$shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);

/* 顶部搜索和定位区域 */
.top-header {
	background: transparent;
	padding: 20upx 30upx 30upx;
	position: sticky;
	top: 0;
	z-index: 100;
}

.search-section {
	margin-bottom: 20upx;
}

.search-box {
	display: flex;
	align-items: center;
	height: 80upx;
	padding: 0 30upx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 40upx;
	box-shadow: 0 4upx 12upx rgba(0, 0, 0, 0.1);
}

.search-icon {
	font-size: 32upx;
	margin-right: 16upx;
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	font-size: 28upx;
	color: $text-primary;
	background: transparent;
	border: none;
	outline: none;
}

.search-placeholder {
	flex: 1;
	font-size: 28upx;
	color: $text-secondary;
}

.location-section {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 12upx 0;
}

.location-wrapper {
	display: inline-flex;
	align-items: center;
	padding: 8upx 20upx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 30upx;
	backdrop-filter: blur(10upx);
	box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.1);
}

.location-icon {
	font-size: 28upx;
	margin-right: 8upx;
	flex-shrink: 0;
}

.location-text {
	font-size: 26upx;
	color: #333;
	max-width: 500upx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 500;
}

page {
	background: $bg-color;
}

/* 轮播图区域 */
.carousel-section {
	position: relative;
	margin: 20upx 30upx;
	border-radius: 20upx;
	overflow: hidden;
	box-shadow: $shadow;
}

.carousel {
	width: 100%;
	height: 360upx;

	.carousel-item {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	image {
		width: 100%;
		height: 100%;
	}
}

.swiper-dots {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 30upx;
	bottom: 20upx;
	padding: 8upx 20upx;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 30upx;
	backdrop-filter: blur(10upx);

	.num {
		font-size: 24upx;
		color: #fff;
		font-weight: 500;
	}

	.sign {
		margin: 0 4upx;
		font-size: 20upx;
		color: rgba(255, 255, 255, 0.8);
	}
}

/* 快捷功能区 */
.quick-access-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 40upx 30upx;
	background: $card-bg;
	margin: 0 30upx 20upx;
	border-radius: 20upx;
	box-shadow: $shadow;
}

.quick-access-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.quick-icon-wrapper {
	width: 100upx;
	height: 100upx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20upx;
	margin-bottom: 16upx;
	box-shadow: 0 4upx 12upx rgba(102, 126, 234, 0.3);
}

.quick-icon {
	font-size: 48upx;
}

.quick-text {
	font-size: 24upx;
	color: $text-primary;
	font-weight: 500;
}

/* 通用区块卡片 */
.section-card {
	background: $card-bg;
	margin: 0 30upx 30upx;
	border-radius: 20upx;
	box-shadow: $shadow;
	overflow: hidden;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30upx;
	border-bottom: 1upx solid $border-color;
}

.section-title-wrapper {
	display: flex;
	align-items: center;
	flex: 1;
}

.section-icon {
	font-size: 40upx;
	margin-right: 20upx;
}

.section-title-box {
	display: flex;
	flex-direction: column;
}

.section-title {
	font-size: 32upx;
	font-weight: 600;
	color: $text-primary;
	line-height: 1.4;
	margin-bottom: 6upx;
}

.section-subtitle {
	font-size: 24upx;
	color: $text-light;
}

.section-more {
	font-size: 26upx;
	color: $text-secondary;
}

/* 秒杀专区特殊样式 */
.flash-section {
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.flash-header {
	border-bottom: 1upx solid rgba(255, 255, 255, 0.2);
}

.flash-icon {
	color: #fff;
}

.flash-title {
	color: #fff;
}

.countdown-box {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.countdown-label {
	font-size: 22upx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 8upx;
}

.countdown-timer {
	display: flex;
	align-items: center;
}

.timer-item {
	display: inline-block;
	min-width: 44upx;
	height: 44upx;
	line-height: 44upx;
	text-align: center;
	background: rgba(0, 0, 0, 0.3);
	color: #fff;
	font-size: 24upx;
	font-weight: 600;
	border-radius: 6upx;
	padding: 0 8upx;
}

.timer-separator {
	color: rgba(255, 255, 255, 0.9);
	font-size: 24upx;
	margin: 0 4upx;
}

/* 品牌横向滚动 */
.brand-scroll {
	white-space: nowrap;
	padding: 20upx 0;
}

.brand-list {
	display: inline-flex;
	padding: 0 30upx;
}

.brand-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 200upx;
	margin-right: 30upx;
	flex-shrink: 0;
}

.brand-image-wrapper {
	width: 200upx;
	height: 200upx;
	border-radius: 16upx;
	overflow: hidden;
	background: $bg-color;
	margin-bottom: 16upx;
	box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.1);

	image {
		width: 100%;
		height: 100%;
	}
}

.brand-name {
	font-size: 26upx;
	color: $text-primary;
	font-weight: 500;
	margin-bottom: 8upx;
	text-align: center;
}

.brand-count {
	font-size: 22upx;
	color: $text-light;
}

/* 商品横向滚动 */
.product-scroll {
	white-space: nowrap;
	padding: 20upx 0;
}

.product-list-horizontal {
	display: inline-flex;
	padding: 0 30upx;
}

.product-item-horizontal {
	display: flex;
	flex-direction: column;
	width: 280upx;
	margin-right: 24upx;
	flex-shrink: 0;
	background: $card-bg;
	border-radius: 16upx;
	overflow: hidden;
	box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.08);
}

.product-image-wrapper {
	position: relative;
	width: 100%;
	height: 280upx;
	background: $bg-color;

	image {
		width: 100%;
		height: 100%;
	}
}

.flash-badge,
.new-badge {
	position: absolute;
	top: 12upx;
	left: 12upx;
	padding: 6upx 16upx;
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
	color: #fff;
	font-size: 20upx;
	border-radius: 20upx;
	font-weight: 600;
}

.new-badge {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.product-info {
	padding: 20upx;
	display: flex;
	flex-direction: column;
}

.product-name {
	font-size: 26upx;
	color: $text-primary;
	font-weight: 500;
	margin-bottom: 8upx;
	line-height: 1.4;
}

.product-subtitle {
	font-size: 22upx;
	color: $text-light;
	margin-bottom: 12upx;
	line-height: 1.4;
}

.product-price {
	font-size: 32upx;
	color: $primary-color;
	font-weight: 600;
}

/* 人气推荐网格布局 */
.hot-product-grid {
	padding: 20upx 30upx 30upx;
}

.hot-product-item {
	display: flex;
	flex-direction: row;
	margin-bottom: 30upx;
	background: $card-bg;
	border-radius: 16upx;
	overflow: hidden;
	box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.06);

	&:last-child {
		margin-bottom: 0;
	}
}

.hot-product-image {
	position: relative;
	width: 240upx;
	height: 240upx;
	flex-shrink: 0;
	background: $bg-color;

	image {
		width: 100%;
		height: 100%;
	}
}

.hot-badge {
	position: absolute;
	top: 12upx;
	left: 12upx;
	padding: 6upx 16upx;
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
	color: #fff;
	font-size: 20upx;
	border-radius: 20upx;
	font-weight: 600;
}

.hot-product-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 24upx;
}

.hot-product-name {
	font-size: 28upx;
	color: $text-primary;
	font-weight: 500;
	margin-bottom: 12upx;
	line-height: 1.4;
}

.hot-product-subtitle {
	font-size: 24upx;
	color: $text-light;
	margin-bottom: 20upx;
	line-height: 1.4;
}

.hot-product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.hot-product-price {
	font-size: 36upx;
	color: $primary-color;
	font-weight: 600;
}

.hot-product-tag {
	padding: 6upx 16upx;
	background: rgba(250, 67, 106, 0.1);
	color: $primary-color;
	font-size: 20upx;
	border-radius: 20upx;
}

/* 猜你喜欢网格布局 */
.product-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 20upx 20upx 30upx;
	justify-content: space-between;
}

.product-card {
	display: flex;
	flex-direction: column;
	width: 48%;
	margin-bottom: 20upx;
	background: $card-bg;
	border-radius: 16upx;
	overflow: hidden;
	box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.06);
	transition: transform 0.2s;

	&:active {
		transform: scale(0.98);
	}
}

.product-image-container {
	width: 100%;
	height: 320upx;
	background: $bg-color;
	overflow: hidden;

	image {
		width: 100%;
		height: 100%;
	}
}

.product-card-content {
	padding: 20upx;
	display: flex;
	flex-direction: column;
}

.product-card-name {
	font-size: 28upx;
	color: $text-primary;
	font-weight: 500;
	margin-bottom: 8upx;
	line-height: 1.4;
}

.product-card-subtitle {
	font-size: 24upx;
	color: $text-light;
	margin-bottom: 16upx;
	line-height: 1.4;
}

.product-card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.product-card-price {
	font-size: 32upx;
	color: $primary-color;
	font-weight: 600;
}

.product-card-sale {
	font-size: 22upx;
	color: $text-light;
}

/* 文本截断 */
.clamp {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
}
</style>


