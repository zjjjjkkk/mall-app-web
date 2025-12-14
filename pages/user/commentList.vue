<template>
	<view class="content">
		<!-- 空白页 -->
		<empty v-if="commentList==null||commentList.length === 0"></empty>
		
		<view class="comment-section">
			<view v-for="(item, index) in commentList" :key="index" class="comment-item">
				<view class="comment-header">
					<view class="product-info" @click="navToProduct(item.productId)">
						<image 
							class="product-img" 
							:src="getProductPic(item)" 
							mode="aspectFill" 
							@error="handleImageError"
							lazy-load
						></image>
						<view class="product-detail">
							<text class="product-name">{{ item.productName || '商品已下架' }}</text>
							<view class="star-rating">
								<text 
									v-for="(star, starIndex) in 5" 
									:key="starIndex"
									class="star"
									:class="starIndex < item.star ? 'active' : ''"
								>★</text>
							</view>
						</view>
					</view>
					<view class="comment-status">
						<text class="status-tag" :class="item.showStatus === 1 ? 'show' : 'hide'">
							{{ item.showStatus === 1 ? '已显示' : '待审核' }}
						</text>
					</view>
				</view>
				
				<view class="comment-content">
					<text class="content-text">{{ item.content }}</text>
					<view class="comment-pics" v-if="item.pics && getPicList(item.pics).length > 0">
						<image 
							v-for="(pic, picIndex) in getPicList(item.pics)" 
							:key="picIndex"
							:src="pic" 
							mode="aspectFill"
							class="comment-pic"
							@click="previewPic(pic, getPicList(item.pics))"
							@error="handleCommentImageError"
							lazy-load
						></image>
					</view>
				</view>
				
				<!-- 管理员回复 -->
				<view class="admin-reply" v-if="item.replayList && item.replayList.length > 0">
					<view v-for="(replay, replayIndex) in item.replayList" :key="replayIndex" class="reply-item">
						<view class="reply-header">
							<text class="reply-author">{{ replay.memberNickName }}</text>
							<text class="reply-badge" v-if="replay.type === 1">管理员</text>
						</view>
						<text class="reply-content">{{ replay.content }}</text>
						<text class="reply-time">{{ replay.createTime | formatDateTime }}</text>
					</view>
				</view>
				
				<view class="comment-footer">
					<text class="comment-time">{{ item.createTime | formatDateTime }}</text>
					<text class="comment-attr" v-if="item.productAttribute">{{ item.productAttribute }}</text>
				</view>
			</view>
		</view>
		
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
import empty from "@/components/empty";
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { formatDate } from '@/utils/date';
import { getMyCommentList, getCommentReplayList } from '@/api/comment.js';
import { fetchProductDetail } from '@/api/product.js';
import logger from '@/utils/logger.js';
import { getPicList } from '@/utils/imageUtil.js';
import { showError } from '@/utils/errorHandler.js';

export default {
	components: {
		uniLoadMore,
		empty
	},
	data() {
		return {
			loadingType: 'more',
			commentList: []
		};
	},
	onLoad(options) {
		this.loadData();
	},
	//下拉刷新
	onPullDownRefresh() {
		this.loadData('refresh');
	},
	//加载更多
	onReachBottom() {
		this.loadData();
	},
	filters: {
		formatDateTime(time) {
			if (time == null || time === '') {
				return 'N/A';
			}
			let date = new Date(time);
			return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
		},
	},
	methods: {
		//加载评价列表
		async loadData(type = 'add') {
			if (type === 'refresh') {
				this.commentList = [];
			}
			
			if (this.loadingType === 'loading' || this.loadingType === 'nomore') {
				return;
			}
			
			this.loadingType = 'loading';
			
			try {
				const response = await getMyCommentList();
				if (response.code === 200) {
					if (type === 'refresh') {
						this.commentList = response.data || [];
					} else {
						this.commentList = response.data || [];
					}
					
					logger.debug('评价列表加载成功，数量:', this.commentList.length);
					
					// 加载每个评价的回复
					for (let comment of this.commentList) {
						await this.loadCommentReplay(comment);
					}
					
					if (this.commentList.length === 0) {
						this.loadingType = 'nomore';
					} else {
						this.loadingType = 'more';
					}
				} else {
					this.commentList = [];
					this.loadingType = 'nomore';
				}
			} catch (error) {
				logger.error('加载评价列表失败:', error);
				this.commentList = [];
				this.loadingType = 'nomore';
				showError(error, '加载评价列表失败，请稍后重试');
			} finally {
				if (type === 'refresh') {
					uni.stopPullDownRefresh();
				}
			}
		},
		// 批量加载商品图片信息
		async loadProductPics(comments) {
			if (!comments || comments.length === 0) return;
			
			// 收集所有需要加载的商品ID
			const productIds = comments
				.map(c => c.productId)
				.filter(id => id && !c.productPic); // 只加载没有图片的
			
			if (productIds.length === 0) return;
			
			// 批量加载商品信息（这里可以优化为批量接口，暂时逐个加载）
			for (let comment of comments) {
				if (comment.productId && !comment.productPic) {
					try {
						const productRes = await fetchProductDetail(comment.productId);
						if (productRes && productRes.code === 200 && productRes.data && productRes.data.pic) {
							this.$set(comment, 'productPic', productRes.data.pic);
						}
					} catch (error) {
						logger.error('加载商品图片失败:', error);
						// 静默失败，使用默认图片
					}
				}
			}
		},
		// 加载评价回复
		async loadCommentReplay(comment) {
			try {
				const response = await getCommentReplayList(comment.id);
				if (response.code === 200) {
					this.$set(comment, 'replayList', response.data || []);
				}
			} catch (error) {
				logger.error('加载评价回复失败:', error);
				// 静默失败，不影响主流程
			}
		},
		// 获取图片列表（使用公共工具）
		getPicList(pics) {
			return getPicList(pics);
		},
		// 预览图片
		previewPic(current, urls) {
			// 过滤掉blob URL
			const validUrls = urls.filter(url => {
				if (!url) return false;
				const trimmed = url.trim();
				return trimmed && trimmed.length > 0 && !trimmed.startsWith('blob:');
			});
			if (validUrls.length === 0) {
				uni.showToast({
					title: '没有可预览的图片',
					icon: 'none'
				});
				return;
			}
			uni.previewImage({
				current: current,
				urls: validUrls
			});
		},
		// 评价图片加载错误处理
		handleCommentImageError(e) {
			// 图片加载失败时，隐藏该图片
			try {
				if (e && e.target) {
					// 尝试设置为默认图片
					if (e.target.src && !e.target.src.includes('default')) {
						e.target.src = '/static/default-product.png';
					} else {
						// 如果默认图片也加载失败，隐藏该图片
						e.target.style.display = 'none';
					}
				}
			} catch (err) {
				logger.error('处理图片错误失败:', err);
			}
		},
		// 获取商品图片
		getProductPic(comment) {
			// 优先使用评价中的商品图片（如果后端返回了）
			if (comment.productPic) {
				return this.formatImageUrl(comment.productPic);
			}
			// 如果没有商品图片，返回默认图片
			return '/static/default-product.png';
		},
		// 格式化图片URL
		formatImageUrl(url) {
			if (!url) return '/static/default-product.png';
			// 如果已经是完整URL，直接返回
			if (url.startsWith('http://') || url.startsWith('https://')) {
				return url;
			}
			// 如果是相对路径，可能需要添加基础URL
			return url;
		},
		// 图片加载错误处理
		handleImageError(e) {
			// 图片加载失败时，设置为默认图片
			try {
				if (e && e.target) {
					e.target.src = '/static/default-product.png';
				}
			} catch (err) {
				logger.error('处理图片错误失败:', err);
			}
		},
		// 跳转到商品详情
		navToProduct(productId) {
			if (productId) {
				uni.navigateTo({
					url: `/pages/product/product?id=${productId}`
				});
			}
		}
	}
}
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
	min-height: 100%;
}

.comment-section {
	padding: 20upx 30upx;
}

.comment-item {
	background: #fff;
	border-radius: 16upx;
	padding: 30upx;
	margin-bottom: 20upx;
	box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);
}

.comment-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20upx;
	
	.product-info {
		display: flex;
		flex: 1;
		
		.product-img {
			width: 120upx;
			height: 120upx;
			border-radius: 8upx;
			margin-right: 20upx;
		}
		
		.product-detail {
			flex: 1;
			display: flex;
			flex-direction: column;
			
			.product-name {
				font-size: 28upx;
				color: $font-color-dark;
				margin-bottom: 10upx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
			
			.star-rating {
				display: flex;
				
				.star {
					font-size: 24upx;
					color: #ddd;
					margin-right: 4upx;
					
					&.active {
						color: #ff9500;
					}
				}
			}
		}
	}
	
	.comment-status {
		.status-tag {
			padding: 6upx 16upx;
			border-radius: 20upx;
			font-size: 22upx;
			
			&.show {
				background: #e8f5e9;
				color: #4caf50;
			}
			
			&.hide {
				background: #fff3e0;
				color: #ff9800;
			}
		}
	}
}

.comment-content {
	margin-bottom: 20upx;
	
	.content-text {
		font-size: 28upx;
		color: $font-color-dark;
		line-height: 1.6;
		margin-bottom: 10upx;
		display: block;
	}
	
	.comment-pics {
		display: flex;
		flex-wrap: wrap;
		gap: 10upx;
		margin-top: 10upx;
		
		.comment-pic {
			width: 150upx;
			height: 150upx;
			border-radius: 8upx;
		}
	}
}

.admin-reply {
	background: #f5f7fa;
	border-radius: 8upx;
	padding: 20upx;
	margin-bottom: 20upx;
	
	.reply-item {
		margin-bottom: 15upx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.reply-header {
			display: flex;
			align-items: center;
			margin-bottom: 8upx;
			
			.reply-author {
				font-size: 24upx;
				color: $font-color-dark;
				font-weight: 500;
				margin-right: 10upx;
			}
			
			.reply-badge {
				background: #67c23a;
				color: #fff;
				font-size: 20upx;
				padding: 2upx 8upx;
				border-radius: 4upx;
			}
		}
		
		.reply-content {
			font-size: 26upx;
			color: $font-color-base;
			line-height: 1.5;
			margin-bottom: 6upx;
			display: block;
		}
		
		.reply-time {
			font-size: 22upx;
			color: $font-color-light;
		}
	}
}

.comment-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20upx;
	border-top: 1px solid #f5f5f5;
	
	.comment-time {
		font-size: 24upx;
		color: $font-color-light;
	}
	
	.comment-attr {
		font-size: 24upx;
		color: $font-color-light;
	}
}
</style>

