<template>
	<view class="content">
		<!-- 左侧分类列表 -->
		<scroll-view scroll-y class="left-aside">
			<view 
				v-for="item in flist" 
				:key="item.id" 
				class="f-item" 
				:class="{active: item.id === currentId}" 
				@click="tabtap(item)"
				hover-class="f-item-hover"
			>
				<text class="f-item-text">{{item.name}}</text>
			</view>
		</scroll-view>
		
		<!-- 右侧子分类列表 -->
		<scroll-view scroll-with-animation scroll-y class="right-aside">
			<view class="s-list">
				<view 
					@click="navToList(item.id)" 
					class="s-item" 
					v-for="item in slist" 
					:key="item.id"
					hover-class="s-item-hover"
				>
					<view class="s-item-img-wrap">
						<image 
							:src="item.icon||'http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/images/20190519/default.png'"
							mode="aspectFill"
							lazy-load
						></image>
					</view>
					<text class="s-item-text">{{item.name}}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		fetchProductCateList
	} from '@/api/home.js';
	export default {
		data() {
			return {
				currentId: 0,
				flist: [],
				slist: []
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				fetchProductCateList(0).then(response => {
					this.flist = response.data;
					if (this.flist.length > 0) {
						this.currentId = this.flist[0].id;
						fetchProductCateList(this.currentId).then(response => {
							this.slist = response.data;
						});
					}
				})
			},
			//一级分类点击
			tabtap(item) {
				this.currentId = item.id;
				fetchProductCateList(this.currentId).then(response => {
					this.slist = response.data;
				});
			},
			navToList(sid) {
				uni.navigateTo({
					url: `/pages/product/list?fid=${this.currentId}&sid=${sid}`
				})
			}
		}
	}
</script>

<style lang='scss'>
	// 定义主题色和通用样式变量
	$font-color-base: #333333;
	$font-color-secondary: #666666;
	$base-color: #FF6700; // 橙色主题
	$light-gray: #f5f5f5;
	$border-color: #eeeeee;
	$hover-color: #f8f8f8;
	$shadow-color: rgba(0, 0, 0, 0.05);

	page,
	.content {
		height: 100%;
		background-color: $light-gray;
	}

	.content {
		display: flex;
	}

	// 左侧分类样式美化
	.left-aside {
		flex-shrink: 0;
		width: 200upx;
		height: 100%;
		background-color: #ffffff;
		box-shadow: 2upx 0 10upx $shadow-color; // 添加右侧阴影
		z-index: 10;
	}

	.f-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100upx;
		font-size: 28upx;
		color: $font-color-base;
		position: relative;
		transition: all 0.3s ease; // 过渡动画
		box-sizing: border-box;
		border-bottom: 1upx solid $border-color;

		&.f-item-hover {
			background-color: $hover-color;
		}

		&.active {
			color: $base-color;
			background: $light-gray;

			&:before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				height: 40upx;
				width: 8upx;
				background-color: $base-color;
				border-radius: 0 6upx 6upx 0;
				opacity: 1;
			}

			.f-item-text {
				font-weight: 600;
			}
		}

		.f-item-text {
			transition: all 0.3s ease;
			padding: 0 10upx;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	// 右侧子分类样式美化
	.right-aside {
		flex: 1;
		overflow: hidden;
		padding: 10upx 10upx 10upx 20upx;
	}

	.s-list {
		margin-top: 10upx;
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		background: #ffffff;
		padding: 20upx 10upx;
		border-radius: 12upx; // 圆角
		box-shadow: 0 2upx 12upx $shadow-color; // 卡片阴影
		box-sizing: border-box;

		&:after {
			content: '';
			flex: 99;
			height: 0;
		}
	}

	.s-item {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 176upx;
		font-size: 26upx;
		color: $font-color-secondary;
		padding: 15upx 10upx;
		box-sizing: border-box;
		border-radius: 8upx;
		transition: all 0.2s ease;

		&.s-item-hover {
			background-color: $light-gray;
			transform: scale(0.98); // 点击缩小效果
		}

		.s-item-img-wrap {
			width: 140upx;
			height: 140upx;
			border-radius: 10upx; // 图片圆角
			overflow: hidden;
			margin-bottom: 12upx;
			background-color: $light-gray;
			box-shadow: 0 2upx 8upx $shadow-color;

			image {
				width: 100%;
				height: 100%;
				transition: transform 0.3s ease;
			}
		}

		&:hover .s-item-img-wrap image {
			transform: scale(1.05); // 图片hover放大
		}

		.s-item-text {
			text-align: center;
			line-height: 1.4;
			padding: 0 5upx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	// 兼容不同设备的适配
	@media (max-width: 750upx) {
		.s-item {
			width: 33.33%;
		}
	}
</style>