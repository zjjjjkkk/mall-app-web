<template>
	<view class="content">
		<!-- 搜索关键词显示 -->
		<view v-if="searchParam.keyword" class="search-keyword-bar">
			<text class="keyword-label">搜索：</text>
			<text class="keyword-text">{{ searchParam.keyword }}</text>
			<text class="keyword-clear" @click="clearKeyword">✕</text>
		</view>
		<view class="navbar" :style="{position:headerPosition,top:headerTop}">
			<view class="nav-item" :class="{current: filterIndex === 0}" @click="tabClick(0)">
				综合排序
			</view>
			<view class="nav-item" :class="{current: filterIndex === 1}" @click="tabClick(1)">
				销量优先
			</view>
			<view class="nav-item" :class="{current: filterIndex === 2}" @click="tabClick(2)">
				<text>价格</text>
				<view class="p-box">
					<text :class="{active: priceOrder === 1 && filterIndex === 2}" class="yticon icon-shang"></text>
					<text :class="{active: priceOrder === 2 && filterIndex === 2}" class="yticon icon-shang xia"></text>
				</view>
			</view>
			<text class="cate-item yticon icon-fenlei1" @click="toggleCateMask('show')"></text>
		</view>
		<view class="goods-list">
			<view v-for="(item, index) in productList" :key="index" class="goods-item" @click="navToDetailPage(item)">
				<view class="image-wrapper">
					<image :src="item.pic" mode="aspectFill"></image>
				</view>
				<text class="title clamp">{{item.name}}</text>
				<text class="title2">{{item.subTitle}}</text>
				<view class="price-box">
					<view class="price-wrapper">
						<text class="price">{{item.standardPrice || item.price}}</text>
						<text v-if="item.topPrice && item.topPrice > (item.standardPrice || item.price)" class="price-range">起</text>
					</view>
					<text>已售 {{item.sale}}</text>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>

		<view class="cate-mask" :class="cateMaskState===0 ? 'none' : cateMaskState===1 ? 'show' : ''" @click="toggleCateMask">
			<view class="cate-content" @click.stop.prevent="stopPrevent" @touchmove.stop.prevent="stopPrevent">
				<scroll-view scroll-y class="cate-list">
					<view v-for="item in cateList" :key="item.id">
						<view class="cate-item b-b two">{{item.name}}</view>
						<view v-for="tItem in item.children" :key="tItem.id" class="cate-item b-b" :class="{active: tItem.id==searchParam.productCategoryId}"
						 @click="changeCate(tItem)">
							{{tItem.name}}
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		searchProductList,
		fetchCategoryTreeList
	} from '@/api/product.js';
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	export default {
		components: {
			uniLoadMore
		},
		data() {
			return {
				cateMaskState: 0, //分类面板展开状态
				headerPosition: "fixed",
				headerTop: "0px",
				loadingType: 'more', //加载更多状态
				filterIndex: 0,
				priceOrder: 0, //1 价格从低到高 2价格从高到低
				cateList: [],
				productList: [],
				searchParam: {
					productCategoryId: null,
					keyword: null,
					pageNum: 1,
					pageSize: 6,
					sort: 0
				}
			};
		},

		onLoad(options) {
			// #ifdef H5
			// 安全地获取页面头部高度
			this.$nextTick(() => {
				try {
					const pageHead = document.getElementsByTagName('uni-page-head')[0];
					if (pageHead) {
						this.headerTop = pageHead.offsetHeight + 'px';
					}
				} catch (e) {
					console.warn('获取页面头部高度失败:', e);
					this.headerTop = '0px';
				}
			});
			// #endif
			// 只有当 sid 存在时才设置 productCategoryId
			if (options.sid) {
			this.searchParam.productCategoryId = options.sid;
			}
			// 如果有 keyword 参数，设置搜索关键词
			if (options.keyword) {
				this.searchParam.keyword = options.keyword;
			}
			this.loadCateList(options.fid, options.sid);
			this.loadData();
		},
		onPageScroll(e) {
			//兼容iOS端下拉时顶部漂移
			if (e.scrollTop >= 0) {
				this.headerPosition = "fixed";
			} else {
				this.headerPosition = "absolute";
			}
		},
		//下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		//加载更多
		onReachBottom() {
			this.searchParam.pageNum++;
			this.loadData();
		},
		methods: {
			//加载分类
			async loadCateList(fid, sid) {
				fetchCategoryTreeList().then(response => {
					this.cateList = response.data;
				})
			},
			//加载商品 ，带下拉刷新和上滑加载
			async loadData(type = 'add', loading) {
				//没有更多直接返回
				if (type === 'add') {
					if (this.loadingType === 'nomore') {
						return;
					}
					this.loadingType = 'loading';
				} else {
					this.loadingType = 'more'
				}

				if (type === 'refresh') {
					this.searchParam.pageNum=1;
					this.productList = [];
				}
				if(this.filterIndex==0){
					this.searchParam.sort=0;
				}
				if (this.filterIndex === 1) {
					this.searchParam.sort = 2;
				}
				if (this.filterIndex === 2) {
					if (this.priceOrder == 1) {
						this.searchParam.sort = 3;
					} else {
						this.searchParam.sort = 4;
					}
				}
				// 过滤掉 null 和 undefined 的参数，避免发送无效参数
				const params = {};
				Object.keys(this.searchParam).forEach(key => {
					const value = this.searchParam[key];
					if (value !== null && value !== undefined && value !== '') {
						params[key] = value;
					}
				});
				searchProductList(params).then(response => {
					let productList = response.data.list;
					if (response.data.list.length === 0) {
						//没有更多了
						this.loadingType = 'nomore';
						this.searchParam.pageNum--;
					} else {
						if (response.data.list.length < this.searchParam.pageSize) {
							this.loadingType = 'nomore';
							this.searchParam.pageNum--;
						} else {
							this.loadingType = 'more';
						}
						this.productList = this.productList.concat(productList);
					}
					if (type === 'refresh') {
						if (loading == 1) {
							uni.hideLoading()
						} else {
							uni.stopPullDownRefresh();
						}
					}
				});
			},
			//筛选点击
			tabClick(index) {
				if (this.filterIndex === index && index !== 2) {
					return;
				}
				this.filterIndex = index;
				if (index === 2) {
					this.priceOrder = this.priceOrder === 1 ? 2 : 1;
				} else {
					this.priceOrder = 0;
				}
				uni.pageScrollTo({
					duration: 300,
					scrollTop: 0
				})
				this.loadData('refresh', 1);
				uni.showLoading({
					title: '正在加载'
				})
			},
			//显示分类面板
			toggleCateMask(type) {
				let timer = type === 'show' ? 10 : 300;
				let state = type === 'show' ? 1 : 0;
				this.cateMaskState = 2;
				setTimeout(() => {
					this.cateMaskState = state;
				}, timer)
			},
			//分类点击
			changeCate(item) {
				this.searchParam.productCategoryId = item.id;
				this.toggleCateMask();
				uni.pageScrollTo({
					duration: 300,
					scrollTop: 0
				})
				this.loadData('refresh', 1);
				uni.showLoading({
					title: '正在加载'
				})
			},
			//详情
			navToDetailPage(item) {
				let id = item.id;
				uni.navigateTo({
					url: `/pages/product/product?id=${id}`
				})
			},
			// 清除搜索关键词
			clearKeyword() {
				this.searchParam.keyword = null;
				this.searchParam.pageNum = 1;
				this.productList = [];
				this.loadData('refresh');
			},
			stopPrevent() {}
		},
	}
</script>

<style lang="scss">
	page,
	.content {
		background: $page-color-base;
	}

	.content {
		padding-top: 96upx;
	}

	/* 搜索关键词栏 */
	.search-keyword-bar {
		display: flex;
		align-items: center;
		padding: 20upx 30upx;
		background: #fff;
		border-bottom: 1upx solid #f0f0f0;
		margin-top: 96upx;

		.keyword-label {
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}

		.keyword-text {
			flex: 1;
			font-size: 28upx;
			color: $font-color-dark;
			font-weight: 500;
		}

		.keyword-clear {
			font-size: 32upx;
			color: $font-color-light;
			padding: 10upx;
			margin-left: 20upx;
		}
	}

	.navbar {
		position: fixed;
		left: 0;
		top: var(--window-top);
		display: flex;
		width: 100%;
		height: 80upx;
		background: #fff;
		box-shadow: 0 2upx 10upx rgba(0, 0, 0, .06);
		z-index: 10;

		.nav-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 30upx;
			color: $font-color-dark;
			position: relative;

			&.current {
				color: $base-color;

				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 120upx;
					height: 0;
					border-bottom: 4upx solid $base-color;
				}
			}
		}

		.p-box {
			display: flex;
			flex-direction: column;

			.yticon {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 30upx;
				height: 14upx;
				line-height: 1;
				margin-left: 4upx;
				font-size: 26upx;
				color: #888;

				&.active {
					color: $base-color;
				}
			}

			.xia {
				transform: scaleY(-1);
			}
		}

		.cate-item {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			width: 80upx;
			position: relative;
			font-size: 44upx;

			&:after {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				border-left: 1px solid #ddd;
				width: 0;
				height: 36upx;
			}
		}
	}

	/* 分类 */
	.cate-mask {
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0);
		z-index: 95;
		transition: .3s;

		.cate-content {
			width: 630upx;
			height: 100%;
			background: #fff;
			float: right;
			transform: translateX(100%);
			transition: .3s;
		}

		&.none {
			display: none;
		}

		&.show {
			background: rgba(0, 0, 0, .4);

			.cate-content {
				transform: translateX(0);
			}
		}
	}

	.cate-list {
		display: flex;
		flex-direction: column;
		height: 100%;

		.cate-item {
			display: flex;
			align-items: center;
			height: 90upx;
			padding-left: 30upx;
			font-size: 28upx;
			color: #555;
			position: relative;
		}

		.two {
			height: 64upx;
			color: #303133;
			font-size: 30upx;
			background: #f8f8f8;
		}

		.active {
			color: $base-color;
		}
	}

	/* 商品列表 */
	.goods-list {
		display: flex;
		flex-wrap: wrap;
		padding: 0 30upx;
		background: #fff;

		.goods-item {
			display: flex;
			flex-direction: column;
			width: 48%;
			padding-bottom: 40upx;

			&:nth-child(2n+1) {
				margin-right: 4%;
			}
		}

		.image-wrapper {
			width: 100%;
			height: 330upx;
			border-radius: 3px;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}

		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 80upx;
		}

		.title2 {
			font-size: $font-sm;
			color: $font-color-light;
			line-height: 40upx;
			height: 80upx;
			overflow: hidden;
			text-overflow: ellipsis;
			display: block;
		}

	.price-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 10upx;
		font-size: 24upx;
		color: $font-color-light;
	}

	.price-wrapper {
		display: flex;
		align-items: baseline;
	}

	.price {
		font-size: $font-lg;
		color: $uni-color-primary;
		line-height: 1;

		&:before {
			content: '￥';
			font-size: 26upx;
		}
	}

	.price-range {
		font-size: 22upx;
		color: $font-color-light;
		margin-left: 4upx;
	}
	}
</style>
