<template>
	<view class="content">
		<!-- 左侧一级分类列表 -->
		<scroll-view scroll-y class="left-aside" :scroll-top="leftScrollTop">
			<view v-for="item in flist" :key="item.id" class="f-item" :class="{ active: item.id === currentId }"
				@click="tabtap(item)" hover-class="f-item-hover">
				<text class="f-item-text">{{ item.name }}</text>
			</view>
		</scroll-view>

		<!-- 右侧内容区域 -->
		<scroll-view scroll-with-animation scroll-y class="right-aside" @scrolltolower="loadMoreProducts">
			<!-- 二级分类列表 -->
			<view class="sub-category-section" v-if="slist.length > 0">
				<view class="section-title">
					<text class="title-text">分类</text>
				</view>
				<view class="s-list">
					<view @click="selectSubCategory(item)" class="s-item" 
						v-for="item in slist" :key="item.id"
						:class="{ active: item.id === currentSubId }"
						hover-class="s-item-hover">
						<view class="s-item-img-wrap">
							<image
								:src="item.icon || 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/images/20190519/default.png'"
								mode="aspectFill" lazy-load></image>
						</view>
						<text class="s-item-text">{{ item.name }}</text>
					</view>
				</view>
			</view>

			<!-- 商品列表 -->
			<view class="product-section" v-if="currentSubId > 0">
				<view class="section-title">
					<text class="title-text">商品</text>
					<text class="product-count" v-if="productList.length > 0">共{{ totalCount }}件</text>
				</view>
				<view class="goods-list" v-if="productList.length > 0">
					<view v-for="(item, index) in productList" :key="index" class="goods-item" 
						@click="navToDetailPage(item)" v-if="item">
						<view class="image-wrapper">
							<image 
								v-if="item.pic"
								:src="item.pic" 
								mode="aspectFill"
								@error="handleImageError($event, item)"
								@load="handleImageLoad($event, item)"
							></image>
							<view v-else class="no-image-placeholder">
								<text>暂无图片</text>
							</view>
						</view>
						<text class="title clamp">{{ item.name }}</text>
						<text class="subtitle clamp">{{ item.subTitle || '' }}</text>
						<view class="price-box">
							<text class="price">{{ item.price }}</text>
							<text class="sale-count">已售 {{ item.sale || 0 }}</text>
						</view>
					</view>
				</view>
				<view class="empty-product" v-else-if="!loadingProducts">
					<text class="empty-text">该分类下暂无商品</text>
				</view>
				<!-- 加载更多 -->
				<view class="load-more" v-if="productList.length > 0">
					<text class="load-more-text" v-if="loadingType === 'loading'">加载中...</text>
					<text class="load-more-text" v-else-if="loadingType === 'nomore'">没有更多了</text>
					<text class="load-more-text" v-else>上拉加载更多</text>
				</view>
			</view>

			<!-- 空状态：未选择二级分类 -->
			<view class="empty-state" v-else-if="slist.length === 0 && !loading">
				<text class="empty-text">该分类下暂无子分类</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import {
	fetchProductCateList
} from '@/api/home.js'
import {
	searchProductList
} from '@/api/product.js'
import logger from '@/utils/logger.js'
import { showError } from '@/utils/errorHandler.js'

export default {
	data () {
		return {
			currentId: 0,
			currentSubId: 0, // 当前选中的二级分类ID
			flist: [],
			slist: [],
			productList: [],
			loading: false,
			loadingProducts: false,
			loadingType: 'more', // more, loading, nomore
			searchParam: {
				productCategoryId: null,
				pageNum: 1,
				pageSize: 10,
				sort: 0
			},
			totalCount: 0,
			leftScrollTop: 0
		}
	},
	onLoad () {
		this.loadData()
	},
	methods: {
		// 加载一级分类数据
		async loadData () {
			this.loading = true
			try {
				const response = await fetchProductCateList(0)
				this.flist = response.data || []
				if (this.flist.length > 0) {
					this.currentId = this.flist[0].id
					await this.loadSubCategories(this.currentId)
				}
			} catch (error) {
				console.error('加载分类失败:', error)
				uni.showToast({
					title: '加载分类失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
		// 加载二级分类
		async loadSubCategories (parentId) {
			try {
				const response = await fetchProductCateList(parentId)
				this.slist = response.data || []
				// 重置商品列表
				this.currentSubId = 0
				this.productList = []
				// 如果有二级分类，默认选中第一个
				if (this.slist.length > 0) {
					this.selectSubCategory(this.slist[0])
				}
			} catch (error) {
				console.error('加载子分类失败:', error)
			}
		},
		// 一级分类点击
		async tabtap (item) {
			if (this.currentId === item.id) {
				return
			}
			this.currentId = item.id
			this.currentSubId = 0
			this.productList = []
			await this.loadSubCategories(this.currentId)
		},
		// 选择二级分类
		selectSubCategory (item) {
			if (this.currentSubId === item.id) {
				return
			}
			this.currentSubId = item.id
			this.searchParam.productCategoryId = item.id
			this.searchParam.pageNum = 1
			this.productList = []
			this.loadProducts()
		},
		// 加载商品列表
		async loadProducts (type = 'refresh') {
			if (this.loadingProducts) {
				return
			}
			
			if (type === 'add') {
				if (this.loadingType === 'nomore') {
					return
				}
				this.loadingType = 'loading'
			}

			if (type === 'refresh') {
				this.searchParam.pageNum = 1
				this.productList = []
			}

			this.loadingProducts = true
			try {
				const response = await searchProductList(this.searchParam)
				const list = response.data.list || []
				this.totalCount = response.data.total || 0
				
				logger.debug('商品列表加载成功，数量:', list.length)
				// 调试：检查商品数据中的pic字段
				if (list.length > 0) {
					console.log('=== 商品图片调试信息 ===')
					list.forEach((item, idx) => {
						console.log(`商品 ${idx + 1}:`, {
							id: item.id,
							name: item.name,
							pic: item.pic,
							picType: typeof item.pic,
							hasPic: !!item.pic,
							picLength: item.pic ? item.pic.length : 0
						})
					})
					console.log('=== 调试信息结束 ===')
				}

				if (list.length === 0) {
					this.loadingType = 'nomore'
					if (type === 'add') {
						this.searchParam.pageNum--
					}
				} else {
					if (list.length < this.searchParam.pageSize) {
						this.loadingType = 'nomore'
						if (type === 'add') {
							this.searchParam.pageNum--
						}
					} else {
						this.loadingType = 'more'
					}
					this.productList = this.productList.concat(list)
				}
			} catch (error) {
				logger.error('加载商品失败:', error)
				showError(error, '加载商品失败，请稍后重试')
				if (type === 'add') {
					this.searchParam.pageNum--
					this.loadingType = 'more'
				}
			} finally {
				this.loadingProducts = false
			}
		},
		// 加载更多商品
		loadMoreProducts () {
			if (this.currentSubId > 0 && this.loadingType === 'more') {
				this.searchParam.pageNum++
				this.loadProducts('add')
			}
		},
		// 跳转到商品详情
		navToDetailPage (item) {
			uni.navigateTo({
				url: `/pages/product/product?id=${item.id}`
			})
		},
		// 处理图片URL，确保是完整路径
		getImageUrl (pic) {
			if (!pic) {
				return '/static/errorImage.jpg'
			}
			// 如果已经是完整URL（包含http://或https://），直接返回
			if (pic.startsWith('http://') || pic.startsWith('https://')) {
				return pic
			}
			// 如果是相对路径，尝试拼接完整URL
			// 注意：这里需要根据实际后端配置调整
			// 如果后端返回的是完整URL，则不需要处理
			return pic
		},
		// 处理图片加载错误
		handleImageError (e, item) {
			console.error('图片加载失败:', {
				itemId: item.id,
				itemName: item.name,
				originalPic: item.pic,
				error: e,
				imageElement: e.target
			})
			// 标记图片加载错误
			this.$set(item, 'imageError', true)
			// 尝试使用默认图片
			if (item.pic && !item.pic.includes('errorImage') && !item.pic.includes('default-product')) {
				this.$set(item, 'pic', '/static/images/default-product.png')
			}
		},
		// 处理图片加载成功
		handleImageLoad (e, item) {
			console.log('图片加载成功:', {
				itemId: item.id,
				itemName: item.name,
				pic: item.pic
			})
			// 清除错误标记
			if (item.imageError) {
				this.$set(item, 'imageError', false)
			}
		}
	}
}
</script>

<style lang='scss'>
// 主题与基础色彩
$font-color-base: #222222;
$font-color-secondary: #4a4a4a;
$font-color-light: #8c8c8c;
$base-color: #ff6b3d; // 温暖活力橙
$light-gray: #f6f7fb;
$border-color: #ebedf0;
$hover-color: #f0f2f5;
$shadow-color: rgba(17, 24, 39, 0.06);
$white: #ffffff;
$card-radius: 20upx;

page,
.content {
	height: 100%;
	background: linear-gradient(180deg, #fdfdfd 0%, #f6f7fb 30%, #f2f3f7 100%);
}

.content {
	display: flex;
}

// 左侧一级分类
.left-aside {
	flex-shrink: 0;
	width: 200upx;
	height: 100%;
	background-color: $white;
	box-shadow: 4upx 0 18upx $shadow-color;
	z-index: 10;
	border-right: 1upx solid $border-color;
}

.f-item {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100upx;
	font-size: 28upx;
	color: $font-color-secondary;
	position: relative;
	transition: all 0.25s ease;
	box-sizing: border-box;

	&.f-item-hover {
		background-color: $hover-color;
	}

	&.active {
		color: $base-color;
		font-weight: 700;
		background: linear-gradient(90deg, rgba(255, 107, 61, 0.12), #fff);

		&:after {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 6upx;
			height: 60%;
			background-color: $base-color;
			border-radius: 0 6upx 6upx 0;
			box-shadow: 0 6upx 12upx rgba(255, 107, 61, 0.35);
		}
	}

	.f-item-text {
		padding: 0 12upx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

// 右侧内容
.right-aside {
	flex: 1;
	overflow: hidden;
	padding: 22upx 22upx 40upx;
}

// 区块标题
.section-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20upx;
	padding: 0 6upx;

	.title-text {
		font-size: 32upx;
		font-weight: 800;
		color: $font-color-base;
		position: relative;
		padding-left: 22upx;

		&:before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 9upx;
			height: 32upx;
			border-radius: 10upx;
			background: linear-gradient(180deg, #ffc6a6 0%, $base-color 100%);
			box-shadow: 0 8upx 16upx rgba(255, 107, 61, 0.28);
		}
	}

	.product-count {
		font-size: 24upx;
		color: $font-color-light;
	}
}

// 二级分类
.sub-category-section {
	margin-bottom: 30upx;
}

.s-list {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-row-gap: 20upx;
	grid-column-gap: 20upx;
}

.s-item {
	background-color: $white;
	border-radius: $card-radius;
	padding: 16upx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 12upx 28upx $shadow-color;
	transition: all 0.2s ease;
	position: relative;
	border: 1upx solid transparent;

	&.s-item-hover {
		transform: translateY(-2upx);
	}

	&.active {
		border-color: rgba(255, 107, 61, 0.35);
		box-shadow: 0 16upx 36upx rgba(255, 107, 61, 0.16);

		&:after {
			content: '推荐';
			position: absolute;
			top: 10upx;
			right: 10upx;
			font-size: 20upx;
			color: $base-color;
			padding: 6upx 12upx;
			background: rgba(255, 107, 61, 0.12);
			border-radius: 999upx;
		}
	}
}

.s-item-img-wrap {
	width: 120upx;
	height: 120upx;
	border-radius: 16upx;
	overflow: hidden;
	background-color: #fafafa;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12upx;

	image {
		width: 100%;
		height: 100%;
	}
}

.s-item-text {
	font-size: 26upx;
	color: $font-color-base;
	text-align: center;
}

// 商品列表
.product-section {
	width: 100%;
}

.goods-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-row-gap: 24upx;
	grid-column-gap: 18upx;
}

.goods-item {
	background-color: #ffffff;
	border-radius: 16upx;
	overflow: hidden;
	box-shadow: 0 12upx 28upx $shadow-color;
	transition: all 0.2s ease;
	padding: 14upx;
	border: 1upx solid rgba(0, 0, 0, 0.02);

	&:active {
		transform: translateY(-3upx);
		box-shadow: 0 14upx 32upx rgba(0, 0, 0, 0.08);
	}
}

.image-wrapper {
	width: 100%;
	height: 320upx;
	border-radius: 14upx;
	overflow: hidden;
	background-color: #fafafa;
	margin-bottom: 12upx;
	position: relative;
	display: block;

	image {
		width: 100% !important;
		height: 100% !important;
		display: block !important;
		visibility: visible !important;
		opacity: 1 !important;
	}
	
	.no-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		color: #999;
		font-size: 24upx;
		position: absolute;
		top: 0;
		left: 0;
	}
}

.title {
	font-size: 26upx;
	color: $font-color-base;
	line-height: 1.4;
	margin-top: 2upx;
	font-weight: 600;
}

.subtitle {
	font-size: 22upx;
	color: $font-color-light;
	margin-top: 6upx;
	min-height: 48upx;
}

.price-box {
	margin-top: 12upx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 6upx;

	.price {
		font-size: 30upx;
		font-weight: 800;
		color: $base-color;

		&:before {
			content: '￥';
			margin-right: 2upx;
			font-size: 22upx;
		}
	}

	.sale-count {
		font-size: 22upx;
		color: $font-color-light;
	}
}

.empty-product,
.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200upx;
	color: $font-color-light;
	font-size: 26upx;
	background: $white;
	border-radius: $card-radius;
	box-shadow: 0 6upx 18upx $shadow-color;
}

.load-more {
	margin-top: 22upx;
	text-align: center;

	.load-more-text {
		font-size: 24upx;
		color: $font-color-secondary;
	}
}

.clamp {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

@media (max-width: 750upx) {
	.s-list {
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>
