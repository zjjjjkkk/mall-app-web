<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item"
				:class="{ current: tabCurrentIndex === index }" @click="tabClick(index)">
				{{ item.text }}
			</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData('add')">
					<!-- 空白页 -->
					<empty v-if="orderList == null || orderList.length === 0"></empty>

					<!-- 订单列表 -->
					<view v-for="(item, index) in orderList" :key="index" class="order-item">
						<view class="i-top b-b">
							<view class="order-header">
								<text class="order-sn">订单号：{{ item.orderSn || item.id }}</text>
								<text class="state" :style="{ color: getStatusColor(item.status) }">{{ item.status | formatStatus }}</text>
							</view>
							<view class="order-time">
								<text class="time">{{ item.createTime | formatDateTime }}</text>
							<text v-if="item.status === 3 || item.status === 4" class="del-btn yticon icon-iconfontshanchu1"
								@click="deleteOrder(item.id)"></text>
						</view>
						</view>
						
						<!-- 商品列表 -->
						<view class="goods-container">
							<view 
								class="goods-box-single" 
								v-for="(orderItem, itemIndex) in item.orderItemList"
								:key="itemIndex"
								@click="showOrderDetail(item.id)"
							>
							<image class="goods-img" :src="orderItem.productPic" mode="aspectFill"></image>
							<view class="right">
								<text class="title clamp">{{ orderItem.productName }}</text>
								<text class="attr-box">{{ orderItem.productAttr | formatProductAttr }} x
									{{ orderItem.productQuantity }}</text>
									<view class="price-row">
										<text class="price">¥{{ orderItem.productPrice }}</text>
										<button 
											v-if="item.status == 3" 
											class="comment-btn-small" 
											:class="{ 'view-comment-btn-small': orderItem.commentStatus === 2 }"
											@click.stop="handleCommentAction(orderItem, item)"
										>
											{{ getCommentButtonText(orderItem) }}
										</button>
									</view>
								</view>
							</view>
						</view>

						<view class="price-box">
							<text class="total-label">共 <text class="num">{{ calcTotalQuantity(item) }}</text> 件商品</text>
							<text class="price">实付款：¥{{ item.payAmount }}</text>
						</view>
						
						<view class="action-box b-t" v-if="item.status == 0">
							<button class="action-btn" @click="cancelOrder(item.id)">取消订单</button>
							<button class="action-btn recom" @click="payOrder(item.id)">立即付款</button>
						</view>
						<view class="action-box b-t" v-if="item.status == 2">
							<button class="action-btn" v-if="!item.hasRefund" @click="applyRefund(item)">申请退款</button>
							<button class="action-btn" @click="showOrderDetail(item.id)">查看物流</button>
							<button class="action-btn recom" @click="receiveOrder(item.id)">确认收货</button>
						</view>
						<view class="action-box b-t" v-if="item.status == 3">
							<button class="action-btn" v-if="!item.hasRefund" @click="applyRefund(item)">申请退款</button>
							<button class="action-btn recom" @click="goToCommentAll(item)">评价商品</button>
							<button class="action-btn" @click="showOrderDetail(item.id)">再次购买</button>
						</view>
					</view>

					<uni-load-more :status="loadingType"></uni-load-more>

				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 退款申请弹窗 -->
		<view class="refund-modal" v-if="showRefundModal" @click="closeRefundModal">
			<view class="refund-modal-content" @click.stop>
				<view class="refund-modal-header">
					<text class="refund-modal-title">申请退款</text>
					<text class="refund-modal-close" @click="closeRefundModal">×</text>
				</view>
				<view class="refund-modal-body">
					<view class="refund-order-info">
						<text class="info-label">订单编号：</text>
						<text class="info-value">{{ currentOrder.orderSn || '' }}</text>
					</view>
					<view class="refund-order-info" v-if="currentOrder.payAmount">
						<text class="info-label">订单金额：</text>
						<text class="info-value">￥{{ currentOrder.payAmount }}</text>
					</view>
					<view class="refund-form-item">
						<text class="form-label">退款原因 <text class="required">*</text></text>
						<textarea
							class="refund-textarea"
							v-model="refundForm.reason"
							placeholder="请选择/填写退款原因"
							maxlength="200"
						></textarea>
						<view class="reason-tags" v-if="!refundForm.reason">
							<view 
								v-for="(reason, index) in refundReasons" 
								:key="index"
								class="reason-tag"
								@click="selectRefundReason(reason)"
							>
								{{ reason }}
							</view>
						</view>
					</view>
					<view class="refund-form-item">
						<text class="form-label">退款说明</text>
						<textarea
							class="refund-textarea"
							v-model="refundForm.desc"
							placeholder="可选，补充退款细节"
							maxlength="200"
						></textarea>
					</view>
				</view>
				<view class="refund-modal-footer">
					<button class="refund-btn-cancel" @click="closeRefundModal">取消</button>
					<button 
						class="refund-btn-submit" 
						:disabled="submittingRefund || !refundForm.reason"
						@click="submitRefund"
					>
						{{ submittingRefund ? '提交中...' : '提交申请' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
import empty from "@/components/empty"
import { getCommentStatus } from '@/api/comment.js'
import {
	formatDate
} from '@/utils/date'
import {
	fetchOrderList,
	cancelUserOrder,
	confirmReceiveOrder,
	deleteUserOrder,
	createOrderReturnApply
} from '@/api/order.js'
export default {
	components: {
		uniLoadMore,
		empty
	},
	data () {
		return {
			tabCurrentIndex: 0,
			orderParam: {
				status: -1,
				pageNum: 1,
				pageSize: 5
			},
			orderList: [],
			loadingType: 'more',
			navList: [{
				state: -1,
				text: '全部'
			},
			{
				state: 0,
				text: '待付款'
			},
			{
				state: 2,
				text: '待收货'
			},
			{
				state: 3,
				text: '已完成'
			},
			{
				state: 4,
				text: '已取消'
			}
			],
			// 退款弹窗相关
			showRefundModal: false,
			currentOrder: {},
			submittingRefund: false,
			refundForm: {
				reason: '',
				desc: ''
			},
			refundReasons: [
				'不想要了',
				'商品质量问题',
				'商品与描述不符',
				'收到商品损坏',
				'其他原因'
			]
		}
	},
	onLoad (options) {
		/**
		 * 修复app端点击除全部订单外的按钮进入时不加载数据的问题
		 * 替换onLoad下代码即可
		 */
		this.tabCurrentIndex = +options.state
		// #ifndef MP
		this.loadData()
		// #endif
		// #ifdef MP
		if (options.state == 0) {
			this.loadData()
		}
		// #endif

	},
	filters: {
		formatStatus (status) {
			let statusTip = ''
			switch (+status) {
				case 0:
					statusTip = '等待付款'
					break
				case 1:
					statusTip = '等待发货'
					break
				case 2:
					statusTip = '等待收货'
					break
				case 3:
					statusTip = '交易完成'
					break
				case 4:
					statusTip = '交易关闭'
					break
			}
			return statusTip
		},
		formatProductAttr (jsonAttr) {
			let attrArr = JSON.parse(jsonAttr)
			let attrStr = ''
			for (let attr of attrArr) {
				attrStr += attr.key
				attrStr += ":"
				attrStr += attr.value
				attrStr += ";"
			}
			return attrStr
		},
		formatDateTime (time) {
			if (time == null || time === '') {
				return 'N/A'
			}
			let date = new Date(time)
			return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
		},
	},
	methods: {
		//获取订单列表
		loadData (type = 'refresh') {
			if (type == 'refresh') {
				this.orderParam.pageNum = 1
			} else {
				this.orderParam.pageNum++
			}
			//这里是将订单挂载到tab列表下
			let index = this.tabCurrentIndex
			let navItem = this.navList[index]
			let state = navItem.state
			if (this.loadingType === 'loading') {
				//防止重复加载
				return
			}
			this.orderParam.status = navItem.state
			this.loadingType = 'loading'
			fetchOrderList(this.orderParam).then(response => {
				let list = response.data.list
				if (type == 'refresh') {
					this.orderList = list
					this.loadingType = 'more'
				} else {
					if (list != null && list.length > 0) {
						this.orderList = this.orderList.concat(list)
						this.loadingType = 'more'
					} else {
						this.orderParam.pageNum--
						this.loadingType = 'noMore'
					}
				}
				// 检查每个订单的退款状态
				this.checkRefundStatuses()
				// 加载评价状态（仅对已完成订单）
				if (state === 3 && this.orderList && this.orderList.length > 0) {
					this.loadCommentStatuses()
				}
			})
		},
		//swiper 切换
		changeTab (e) {
			this.tabCurrentIndex = e.target.current
			this.loadData()
		},
		//顶部tab点击
		tabClick (index) {
			this.tabCurrentIndex = index
		},
		//删除订单
		deleteOrder (orderId) {
			let superThis = this
			uni.showModal({
				title: '提示',
				content: '是否要删除该订单？',
				success: function (res) {
					if (res.confirm) {
						uni.showLoading({
							title: '请稍后'
						})
						deleteUserOrder({ orderId: orderId }).then(response => {
							uni.hideLoading()
							superThis.loadData()
						})
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		},
		//取消订单
		cancelOrder (orderId) {
			let superThis = this
			uni.showModal({
				title: '提示',
				content: '是否要取消该订单？',
				success: function (res) {
					if (res.confirm) {
						uni.showLoading({
							title: '请稍后'
						})
						cancelUserOrder({ orderId: orderId }).then(response => {
							uni.hideLoading()
							superThis.loadData()
						})
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		},
		//支付订单
		payOrder (orderId) {
			uni.redirectTo({
				url: `/pages/money/pay?orderId=${orderId}`
			})
		},
		//确认收货
		receiveOrder (orderId) {
			let superThis = this
			uni.showModal({
				title: '提示',
				content: '是否要确认收货？',
				success: function (res) {
					if (res.confirm) {
						uni.showLoading({
							title: '请稍后'
						})
						confirmReceiveOrder({ orderId: orderId }).then(response => {
							uni.hideLoading()
							superThis.loadData()
						})
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		},
		//查看订单详情
		showOrderDetail (orderId) {
			uni.navigateTo({
				url: `/pages/order/orderDetail?orderId=${orderId}`
			})
		},
		//申请退款 - 显示弹窗
		applyRefund (order) {
			console.log('订单信息：', order)
			this.currentOrder = order
			this.refundForm = {
				reason: '',
				desc: ''
			}
			this.showRefundModal = true
		},
		//关闭退款弹窗
		closeRefundModal () {
			this.showRefundModal = false
			this.currentOrder = {}
			this.refundForm = {
				reason: '',
				desc: ''
			}
		},
		//选择退款原因
		selectRefundReason (reason) {
			this.refundForm.reason = reason
		},
		//提交退款申请
		submitRefund () {
			if (!this.refundForm.reason || this.refundForm.reason.trim() === '') {
				uni.showToast({ title: '请填写退款原因', icon: 'none' })
				return
			}

			// 获取退款金额，优先使用 payAmount，如果没有则使用 totalAmount 或其他金额字段
			let refundAmount = this.currentOrder.payAmount || 
			                   this.currentOrder.totalAmount || 
			                   this.currentOrder.payPrice || 
			                   this.currentOrder.amount ||
			                   0
			
			// 确保 refundAmount 是数字类型
			refundAmount = parseFloat(refundAmount) || 0
			
			if (refundAmount <= 0) {
				console.error('订单金额异常，currentOrder:', this.currentOrder)
				uni.showToast({ title: '订单金额异常，无法申请退款', icon: 'none' })
				return
			}

			this.submittingRefund = true
			
			const params = {
				orderId: this.currentOrder.id,
				refundAmount: refundAmount,
				returnReason: this.refundForm.reason,
				description: this.refundForm.desc || ''
			}
			
			console.log('提交退款申请参数：', JSON.stringify(params))

			createOrderReturnApply(params).then(res => {
				if (res.code === 200) {
					uni.showToast({ 
						title: res.msg || '退款申请提交成功', 
						icon: 'success' 
					})
					this.closeRefundModal()
					// 刷新订单列表
					this.loadData()
				} else {
					uni.showToast({ 
						title: res.msg || '提交失败', 
						icon: 'none' 
					})
				}
			}).catch(err => {
				console.error('提交退款申请失败：', err)
				uni.showToast({ 
					title: err.message || '网络异常，请稍后重试', 
					icon: 'none' 
				})
			}).finally(() => {
				this.submittingRefund = false
			})
		},
		//计算商品总数量
		calcTotalQuantity (order) {
			let totalQuantity = 0
			if (order.orderItemList != null && order.orderItemList.length > 0) {
				for (let item of order.orderItemList) {
					totalQuantity += item.productQuantity
				}
			}
			return totalQuantity
		},
		// 获取状态颜色
		getStatusColor(status) {
			const colorMap = {
				0: '#fa436a', // 待付款 - 红色
				1: '#ff9500', // 待发货 - 橙色
				2: '#007aff', // 待收货 - 蓝色
				3: '#34c759', // 已完成 - 绿色
				4: '#8e8e93'  // 已取消 - 灰色
			}
			return colorMap[status] || '#fa436a'
		},
		// 加载所有商品的评价状态
		// 检查订单退款状态
		async checkRefundStatuses() {
			if (!this.orderList || this.orderList.length === 0) {
				return
			}
			try {
				// 查询所有退款记录
				const { getOrderReturnApplyList } = await import('@/api/order.js')
				const res = await getOrderReturnApplyList({})
				if (res.code === 200 && res.data && res.data.list) {
					const refundList = res.data.list
					// 为每个订单检查是否有退款记录
					for (let order of this.orderList) {
						const hasRefund = refundList.some(refund => {
							return refund.orderId === order.id && 
							       (refund.refundStatus === 0 || refund.refundStatus === 1 || refund.refundStatus === 3)
						})
						this.$set(order, 'hasRefund', hasRefund)
					}
				} else {
					// 如果查询失败，默认所有订单都未退款
					for (let order of this.orderList) {
						this.$set(order, 'hasRefund', false)
					}
				}
			} catch (err) {
				console.error('检查退款状态失败:', err)
				// 如果检查失败，默认所有订单都未退款
				for (let order of this.orderList) {
					this.$set(order, 'hasRefund', false)
				}
			}
		},
		
		async loadCommentStatuses() {
			if (!this.orderList || this.orderList.length === 0) {
				return
			}
			
			// 先初始化所有商品的评价状态为0（未评价），确保按钮能显示
			for (let order of this.orderList) {
				if (order.orderItemList && order.orderItemList.length > 0) {
					for (let item of order.orderItemList) {
						if (item.productId && item.commentStatus === undefined) {
							this.$set(item, 'commentStatus', 0)
						}
					}
				}
			}
			
			// 然后异步加载真实的评价状态
			for (let order of this.orderList) {
				if (order.orderItemList && order.orderItemList.length > 0) {
					for (let item of order.orderItemList) {
						if (item.productId) {
							try {
								const res = await getCommentStatus(item.productId)
								if (res.code === 200) {
									// 使用Vue.set确保响应式
									this.$set(item, 'commentStatus', res.data)
								} else {
									// 如果接口返回失败，保持默认值0
									this.$set(item, 'commentStatus', 0)
								}
							} catch (error) {
								console.error('获取评价状态失败:', error)
								// 默认设置为未评价
								this.$set(item, 'commentStatus', 0)
							}
						}
					}
				}
			}
		},
		
		// 获取评价按钮文本
		getCommentButtonText(orderItem) {
			const status = orderItem.commentStatus
			if (status === 2) {
				return '查看评价'
			} else if (status === 1) {
				return '追评'
			} else {
				return '评价'
			}
		},
		
		// 处理评价按钮点击
		handleCommentAction(orderItem, order) {
			const status = orderItem.commentStatus
			if (status === 2) {
				// 已评价和追评，跳转到商品评价列表
				uni.navigateTo({
					url: `/pages/product/commentList?productId=${orderItem.productId}`
				})
			} else {
				// 未评价或可追评，跳转到评价页面
				this.goToComment(orderItem, order)
			}
		},
		
		// 跳转到评价页面（单个商品）
		goToComment(orderItem, order) {
			const params = {
				productId: orderItem.productId,
				productName: orderItem.productName,
				productPic: orderItem.productPic,
				productAttribute: orderItem.productAttr || ''
			}
			const query = Object.keys(params).map(key => {
				return `${key}=${encodeURIComponent(params[key])}`
			}).join('&')
			uni.navigateTo({
				url: `/pages/order/comment?${query}`
			})
		},
		// 跳转到评价页面（所有商品，跳转到订单详情页）
		goToCommentAll(order) {
			uni.navigateTo({
				url: `/pages/order/orderDetail?orderId=${order.id}`
			})
		},
	},
}
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
	height: 100%;
}

.swiper-box {
	height: calc(100% - 40px);
}

.list-scroll-content {
	height: 100%;
}

.navbar {
	display: flex;
	height: 40px;
	padding: 0 5px;
	background: #fff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, .06);
	position: relative;
	z-index: 10;

	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 15px;
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
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}
}

.uni-swiper-item {
	height: auto;
}

.order-item {
	display: flex;
	flex-direction: column;
	background: #fff;
	margin: 20upx 30upx;
	border-radius: 16upx;
	overflow: hidden;
	box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);

	.i-top {
		padding: 20upx 30upx 20upx 0;
		font-size: $font-base;
		color: $font-color-dark;
		position: relative;

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10upx;
			
			.order-sn {
				font-size: 24upx;
				color: $font-color-light;
		}

		.state {
				font-size: 28upx;
				font-weight: 500;
			}
		}
		
		.order-time {
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.time {
				font-size: 24upx;
				color: $font-color-light;
			}
		}

		.del-btn {
			padding: 10upx;
			font-size: $font-lg;
			color: $font-color-light;
		}
	}
	
	.goods-container {
		background: #f8f8f8;
		padding: 20upx 0;
	}

	/* 多条商品 */
	.goods-box {
		height: 160upx;
		padding: 20upx 0;
		white-space: nowrap;

		.goods-item {
			width: 120upx;
			height: 120upx;
			display: inline-block;
			margin-right: 24upx;
		}

		.goods-img {
			display: block;
			width: 100%;
			height: 100%;
		}
	}

	/* 单条商品 */
	.goods-box-single {
		display: flex;
		padding: 20upx 30upx;
		background: #fff;
		margin-bottom: 2upx;
		position: relative;

		.goods-img {
			display: block;
			width: 140upx;
			height: 140upx;
			border-radius: 8upx;
			flex-shrink: 0;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 0 0 20upx;
			overflow: hidden;
			justify-content: space-between;

			.title {
				font-size: 28upx;
				color: $font-color-dark;
				line-height: 1.4;
				margin-bottom: 10upx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.attr-box {
				font-size: 24upx;
				color: $font-color-light;
				margin-bottom: 10upx;
			}
			
			.price-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.price {
				font-size: 30upx;
				color: $base-color;
				font-weight: bold;
			}
			
			.comment-btn-small {
				width: 100upx;
				height: 50upx;
				line-height: 50upx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				border-radius: 25upx;
				font-size: 24upx;
				padding: 0;
				margin: 0;
				border: none;
			}
			.view-comment-btn-small {
				background: #999 !important;
				border: none;
				
				&::after {
					border: none;
				}
			}
		}
	}

	.price-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20upx 30upx;
		font-size: 26upx;
		background: #fff;

		.total-label {
		color: $font-color-light;

		.num {
			color: $font-color-dark;
				font-weight: 500;
			}
		}

		.price {
			font-size: 32upx;
			color: $base-color;
			font-weight: bold;
		}
	}

	.action-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 100upx;
		position: relative;
		padding: 0 30upx;
		background: #fff;
		gap: 20upx;
	}

	.action-btn {
		min-width: 140upx;
		height: 64upx;
		margin: 0;
		padding: 0 30upx;
		text-align: center;
		line-height: 64upx;
		font-size: 26upx;
		color: $font-color-dark;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 32upx;
		box-sizing: border-box;

		&:after {
			border: none;
		}

		&.recom {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			border: none;
		}
	}
}


/* load-more */
.uni-load-more {
	display: flex;
	flex-direction: row;
	height: 80upx;
	align-items: center;
	justify-content: center
}

.uni-load-more__text {
	font-size: 28upx;
	color: #999
}

.uni-load-more__img {
	height: 24px;
	width: 24px;
	margin-right: 10px
}

.uni-load-more__img>view {
	position: absolute
}

.uni-load-more__img>view view {
	width: 6px;
	height: 2px;
	border-top-left-radius: 1px;
	border-bottom-left-radius: 1px;
	background: #999;
	position: absolute;
	opacity: .2;
	transform-origin: 50%;
	animation: load 1.56s ease infinite
}

.uni-load-more__img>view view:nth-child(1) {
	transform: rotate(90deg);
	top: 2px;
	left: 9px
}

.uni-load-more__img>view view:nth-child(2) {
	transform: rotate(180deg);
	top: 11px;
	right: 0
}

.uni-load-more__img>view view:nth-child(3) {
	transform: rotate(270deg);
	bottom: 2px;
	left: 9px
}

.uni-load-more__img>view view:nth-child(4) {
	top: 11px;
	left: 0
}

.load1,
.load2,
.load3 {
	height: 24px;
	width: 24px
}

.load2 {
	transform: rotate(30deg)
}

.load3 {
	transform: rotate(60deg)
}

.load1 view:nth-child(1) {
	animation-delay: 0s
}

.load2 view:nth-child(1) {
	animation-delay: .13s
}

.load3 view:nth-child(1) {
	animation-delay: .26s
}

.load1 view:nth-child(2) {
	animation-delay: .39s
}

.load2 view:nth-child(2) {
	animation-delay: .52s
}

.load3 view:nth-child(2) {
	animation-delay: .65s
}

.load1 view:nth-child(3) {
	animation-delay: .78s
}

.load2 view:nth-child(3) {
	animation-delay: .91s
}

.load3 view:nth-child(3) {
	animation-delay: 1.04s
}

.load1 view:nth-child(4) {
	animation-delay: 1.17s
}

.load2 view:nth-child(4) {
	animation-delay: 1.3s
}

.load3 view:nth-child(4) {
	animation-delay: 1.43s
}

@-webkit-keyframes load {
	0% {
		opacity: 1
	}

	100% {
		opacity: .2
	}
}

/* 退款申请弹窗 */
.refund-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.refund-modal-content {
	width: 90%;
	max-width: 600upx;
	background: #fff;
	border-radius: 16upx;
	overflow: hidden;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.refund-modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30upx;
	border-bottom: 1upx solid #e5e5e5;
}

.refund-modal-title {
	font-size: 32upx;
	font-weight: 500;
	color: #333;
}

.refund-modal-close {
	font-size: 48upx;
	color: #999;
	line-height: 1;
	width: 48upx;
	height: 48upx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.refund-modal-body {
	flex: 1;
	overflow-y: auto;
	padding: 30upx;
}

/* 订单商品区域 */
.refund-order-goods {
	padding: 30upx;
	border-bottom: 1upx solid #f0f0f0;
	max-height: 300upx;
	overflow-y: auto;
}

.goods-title {
	font-size: 28upx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20upx;
}

.goods-item {
	display: flex;
	margin-bottom: 20upx;
	padding-bottom: 20upx;
	border-bottom: 1upx solid #f5f5f5;
}

.goods-item:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none;
}

.goods-image {
	width: 120upx;
	height: 120upx;
	border-radius: 12upx;
	margin-right: 20upx;
	flex-shrink: 0;
}

.goods-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.goods-name {
	font-size: 28upx;
	color: #333;
	margin-bottom: 8upx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.goods-attr {
	font-size: 24upx;
	color: #999;
	margin-bottom: 12upx;
}

.goods-price-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.goods-price {
	font-size: 28upx;
	color: #fa436a;
	font-weight: 600;
}

.goods-quantity {
	font-size: 24upx;
	color: #999;
}

/* 订单信息 */
.refund-order-info {
	padding: 30upx;
	background: #f8f8f8;
	border-bottom: 1upx solid #f0f0f0;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16upx;
}

.info-row:last-child {
	margin-bottom: 0;
}

.info-label {
	color: #666;
	font-size: 28upx;
}

.info-value {
	color: #333;
	font-size: 28upx;
	font-weight: 500;
}

.info-value.price {
	color: #fa436a;
	font-weight: 600;
}

.refund-form-item {
	margin-bottom: 30upx;
}

.refund-form-item:last-child {
	margin-bottom: 0;
}

.form-label {
	display: block;
	font-size: 28upx;
	color: #333;
	margin-bottom: 16upx;
	font-weight: 500;
}

.required {
	color: #fa436a;
}

.refund-textarea {
	width: 100%;
	min-height: 160upx;
	padding: 20upx;
	background: #fff;
	border: 2upx solid #e5e5e5;
	border-radius: 12upx;
	font-size: 28upx;
	color: #333;
	box-sizing: border-box;
}

.refund-textarea:focus {
	border-color: #fa436a;
}

.reason-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16upx;
	margin-top: 16upx;
}

.reason-tag {
	padding: 12upx 24upx;
	background: #f5f5f5;
	border-radius: 8upx;
	font-size: 26upx;
	color: #666;
	transition: all 0.3s;
}

.reason-tag:active {
	background: #fa436a;
	color: #fff;
}

.refund-modal-footer {
	display: flex;
	padding: 20upx 30upx;
	border-top: 1upx solid #e5e5e5;
	gap: 20upx;
}

.refund-btn-cancel,
.refund-btn-submit {
	flex: 1;
	height: 80upx;
	line-height: 80upx;
	border-radius: 8upx;
	font-size: 28upx;
	border: none;
}

.refund-btn-cancel {
	background: #f5f5f5;
	color: #666;
}

.refund-btn-submit {
	background: linear-gradient(135deg, #fa436a 0%, #ff6b8a 100%);
	color: #fff;
	font-weight: 600;
	box-shadow: 0 4upx 12upx rgba(250, 67, 106, 0.3);
}

.refund-btn-submit[disabled] {
	background: #ccc;
	color: #999;
	box-shadow: none;
	opacity: 0.6;
}
</style>
