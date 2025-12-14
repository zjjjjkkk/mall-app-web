<template>
	<view class="order-detail-page">
		<!-- 订单状态头部 -->
		<view class="status-section">
			<image :src="orderStatus.image" class="icon" />
			<text class="label-text">{{ orderStatus.text }}</text>
		</view>

		<!-- 收货地址 -->
		<view class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen">
					<view class="top">
						<text class="name">{{ order.receiverName || '未知收件人' }}</text>
						<text class="mobile">{{ order.receiverPhone || '未知手机号' }}</text>
					</view>
					<text class="address">
						{{ order.receiverProvince || '' }} {{ order.receiverCity || '' }} {{ order.receiverRegion || '' }}
						{{ order.receiverDetailAddress || '未知详细地址' }}
					</text>
				</view>
			</view>
			<!-- 本地图片路径 -->
			<image class="a-bg" src="/static/tab-cart.png" />
		</view>

		<!-- 订单商品列表 -->
		<view class="order-items" v-if="(order.orderItems && order.orderItems.length > 0) || (order.orderItemList && order.orderItemList.length > 0)">
			<view class="items-title">订单商品</view>
			<view class="item-card" v-for="(item, index) in (order.orderItems || order.orderItemList || [])" :key="index">
				<image :src="item.productPic" mode="aspectFill" class="item-image"></image>
				<view class="item-info">
					<text class="item-name">{{ item.productName }}</text>
					<text class="item-attr" v-if="item.productAttr">{{ formatProductAttr(item.productAttr) }}</text>
					<view class="item-bottom">
						<text class="item-price">¥{{ item.productPrice }}</text>
						<text class="item-quantity">x{{ item.productQuantity }}</text>
					</view>
				</view>
				<button 
					class="comment-btn" 
					v-if="order.status === 3" 
					@click="handleCommentAction(item)"
					:class="{ 'view-comment-btn': item.commentStatus === 2 }"
				>
					{{ getCommentButtonText(item) }}
				</button>
			</view>
		</view>

		<!-- 订单核心信息 -->
		<view class="order-info">
			<view class="order-sn">订单编号：{{ order.orderSn || '未知' }}</view>
			<view class="order-amount">订单金额：¥{{ order.totalAmount || 0 }}</view>
			<!-- 修复按钮显示逻辑：已退款的订单不显示申请退款按钮 -->
			<button 
				class="refund-btn" 
				v-if="order.status !== 4 && !order.hasRefund && (order.status === 1 || order.status === 2 || order.status === 3)" 
				@click="openRefundApply"
			>
				申请退款
			</button>
		</view>

		<!-- 退款申请弹窗 -->
		<uni-popup ref="refundPopup" type="center" mask-click="false">
			<view class="refund-popup">
				<view class="popup-header">
					<text class="popup-title">申请退款</text>
					<text class="popup-close" @click="closeRefundApply">×</text>
				</view>
				
				<!-- 订单商品信息 -->
				<view class="refund-order-goods" v-if="order.orderItems && order.orderItems.length > 0">
					<view class="goods-title">订单商品</view>
					<view class="goods-item" v-for="(item, index) in order.orderItems" :key="index">
						<image :src="item.productPic" mode="aspectFill" class="goods-image"></image>
						<view class="goods-info">
							<text class="goods-name">{{ item.productName }}</text>
							<text class="goods-attr" v-if="item.productAttr">{{ formatProductAttr(item.productAttr) }}</text>
							<view class="goods-price-row">
								<text class="goods-price">¥{{ item.productPrice }}</text>
								<text class="goods-quantity">x{{ item.productQuantity }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 订单信息 -->
				<view class="refund-order-info">
					<view class="info-row">
						<text class="info-label">订单编号：</text>
						<text class="info-value">{{ order.orderSn || '未知' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">订单金额：</text>
						<text class="info-value price">¥{{ order.totalAmount || 0 }}</text>
					</view>
				</view>
				
				<!-- 退款表单 -->
				<view class="popup-form">
					<view class="form-item">
						<text class="label">退款金额 <text class="required">*</text></text>
						<view class="input-wrapper">
							<text class="input-prefix">¥</text>
							<input 
								type="digit" 
								v-model="refundAmount" 
								:placeholder="`最多¥${order.totalAmount || 0}`"
								maxlength="10"
								class="refund-input"
							/>
						</view>
					</view>
					<view class="form-item">
						<text class="label">退款原因 <text class="required">*</text></text>
						<picker @change="selectReason" :value="reasonIndex" :range="refundReasons">
							<view class="picker-wrapper">
								<text class="picker-text">{{ refundReasons[reasonIndex] }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="label">备注说明</text>
						<textarea 
							v-model="refundRemark" 
							placeholder="选填，补充退款原因"
							class="refund-textarea"
							maxlength="200"
						></textarea>
					</view>
				</view>
				
				<view class="popup-btn-group">
					<button class="cancel-btn" @click="closeRefundApply">取消</button>
					<button class="confirm-btn" @click="submitRefundApply" :disabled="submitting || !refundAmount">
						{{ submitting ? '提交中...' : '确认提交' }}
					</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { fetchOrderDetail, createOrderReturnApply } from '@/api/order.js'
import { getCommentStatus } from '@/api/comment.js'

export default {
	data() {
		return {
			order: {}, // 订单详情
			refundAmount: '', // 退款金额
			reasonIndex: 0, // 退款原因索引
			refundReasons: ['商品质量问题', '不想要了', '发货太慢', '商品错发/漏发', '其他'],
			refundRemark: '', // 退款备注
			submitting: false, // 提交状态
			orderStatus: { // 默认订单状态
				image: '/static/tab-cart.png',
				text: '待付款'
			}
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.getOrderDetail(options.orderId)
		}
	},
	methods: {
		// 获取订单详情
		async getOrderDetail(orderId) {
			try {
				const res = await fetchOrderDetail(orderId)
				if (res.code === 200) {
					this.order = res.data
					// 统一订单商品列表字段名
					if (this.order.orderItemList && !this.order.orderItems) {
						this.order.orderItems = this.order.orderItemList
					}
					// 检查订单是否已退款
					await this.checkRefundStatus()
					// 设置订单状态
					this.setOrderStatus(this.order.status)
					// 加载每个商品的评价状态
					if (this.order.status === 3 && this.order.orderItems) {
						this.loadCommentStatuses()
					}
				} else {
					uni.showToast({ title: res.msg || '获取订单失败', icon: 'none' })
				}
			} catch (err) {
				uni.showToast({ title: '网络异常，显示模拟订单数据', icon: 'none' })
				// 模拟订单数据（兜底）
				this.order = {
					id: orderId,
					orderSn: '20251205001',
					totalAmount: 99.99,
					status: 2, // 2-待收货（可退款状态）
					hasRefund: false,
					receiverName: '张三',
					receiverPhone: '13800138000',
					receiverProvince: '广东省',
					receiverCity: '深圳市',
					receiverRegion: '南山区',
					receiverDetailAddress: '科技园路1号'
				}
				this.setOrderStatus(2)
			}
		},
		
		// 检查订单退款状态
		async checkRefundStatus() {
			if (!this.order || !this.order.id) {
				return
			}
			try {
				// 查询该订单的退款记录
				const { getOrderReturnApplyList } = await import('@/api/order.js')
				const res = await getOrderReturnApplyList({})
				if (res.code === 200 && res.data && res.data.list) {
					// 查找是否有该订单的退款记录（状态为待处理、处理中或已完成）
					const refundList = res.data.list
					const hasRefund = refundList.some(refund => {
						return refund.orderId === this.order.id && 
						       (refund.refundStatus === 0 || refund.refundStatus === 1 || refund.refundStatus === 3)
					})
					this.$set(this.order, 'hasRefund', hasRefund)
				} else {
					this.$set(this.order, 'hasRefund', false)
				}
			} catch (err) {
				console.error('检查退款状态失败:', err)
				// 如果检查失败，默认设置为未退款
				this.$set(this.order, 'hasRefund', false)
			}
		},

		// 设置订单状态文本和图标
		setOrderStatus(status) {
			const statusMap = {
				0: { text: '待付款', image: '/static/tab-cart.png' },
				1: { text: '待发货', image: '/static/tab-cart.png' },
				2: { text: '待收货', image: '/static/tab-cart.png' },
				3: { text: '已完成', image: '/static/tab-cart.png' },
				4: { text: '已取消', image: '/static/tab-cart.png' }
			}
			this.orderStatus = statusMap[status] || statusMap[0]
			// 确保订单商品列表字段统一
			if (this.order.orderItemList && !this.order.orderItems) {
				this.order.orderItems = this.order.orderItemList
			}
		},

		// 打开退款申请弹窗
		openRefundApply() {
			// 默认退款金额为订单总金额
			this.refundAmount = this.order.totalAmount || ''
			this.reasonIndex = 0
			this.refundRemark = ''
			this.$refs.refundPopup.open()
		},

		// 关闭退款申请弹窗
		closeRefundApply() {
			this.$refs.refundPopup.close()
		},

		// 选择退款原因
		selectReason(e) {
			this.reasonIndex = e.detail.value
		},

		// 提交退款申请
		async submitRefundApply() {
			const totalAmount = Number(this.order.totalAmount || 0)
			const refundAmount = Number(this.refundAmount)

			// 校验
			if (!this.refundAmount || refundAmount <= 0) {
				uni.showToast({ title: '请输入有效退款金额', icon: 'none' })
				return
			}
			if (refundAmount > totalAmount) {
				uni.showToast({ title: '退款金额不能超过订单金额', icon: 'none' })
				return
			}

			this.submitting = true
			try {
				// 调用退款申请接口（模拟）
				const res = await createOrderReturnApply({
					orderId: this.order.id,
					returnAmount: this.refundAmount,
					returnReason: this.refundReasons[this.reasonIndex],
					remark: this.refundRemark
				})
				if (res.code === 200) {
					uni.showToast({ title: res.msg })
					this.closeRefundApply()
					// 标记订单为已申请退款
					this.order.hasRefund = true
					// 跳转退款列表页
					setTimeout(() => {
						uni.navigateTo({ url: '/pages/user/refundList' })
					}, 1500)
				} else {
					uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
				}
			} catch (err) {
				uni.showToast({ title: '网络异常，提交失败', icon: 'none' })
				console.error('退款申请失败：', err)
			} finally {
				this.submitting = false
			}
		},
		// 加载所有商品的评价状态
		async loadCommentStatuses() {
			if (!this.order.orderItems || this.order.orderItems.length === 0) {
				return
			}
			
			// 先初始化所有商品的评价状态为0（未评价），确保按钮能显示
			for (let item of this.order.orderItems) {
				if (item.productId && item.commentStatus === undefined) {
					this.$set(item, 'commentStatus', 0)
				}
			}
			
			// 然后异步加载真实的评价状态
			for (let item of this.order.orderItems) {
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
		},
		
		// 获取评价按钮文本
		getCommentButtonText(item) {
			const status = item.commentStatus
			if (status === 2) {
				return '查看评价'
			} else if (status === 1) {
				return '追评'
			} else {
				// status === 0 或 undefined，显示"评价"
				return '评价'
			}
		},
		
		// 处理评价按钮点击
		handleCommentAction(item) {
			const status = item.commentStatus
			if (status === 2) {
				// 已评价和追评，跳转到商品评价列表
				uni.navigateTo({
					url: `/pages/product/commentList?productId=${item.productId}`
				})
			} else {
				// 未评价或可追评，跳转到评价页面
				this.goToComment(item)
			}
		},
		
		// 跳转到评价页面
		goToComment(item) {
			const params = {
				productId: item.productId,
				productName: item.productName,
				productPic: item.productPic,
				productAttribute: item.productAttr || ''
			}
			const query = Object.keys(params).map(key => {
				return `${key}=${encodeURIComponent(params[key])}`
			}).join('&')
			uni.navigateTo({
				url: `/pages/order/comment?${query}`
			})
		},
		
		// 格式化商品属性，只显示属性值
		formatProductAttr(jsonAttr) {
			if (!jsonAttr) {
				return ''
			}
			try {
				// 尝试解析JSON字符串
				let attrArr = JSON.parse(jsonAttr)
				if (Array.isArray(attrArr)) {
					// 只提取value值，用空格连接
					return attrArr.map(attr => attr.value || '').filter(val => val).join(' ')
				}
				return jsonAttr
			} catch (e) {
				// 如果不是JSON格式，直接返回原值
				return jsonAttr
			}
		}
	}
}
</script>

<style scoped>
.order-detail-page {
	padding: 10upx 20upx;
	background-color: #f5f5f5;
	min-height: 100vh;
}
.status-section {
	text-align: center;
	padding: 20upx 0;
	background: #fff;
	margin-bottom: 10upx;
	border-radius: 8upx;
}
.status-section .icon {
	width: 80upx;
	height: 80upx;
	margin-bottom: 10upx;
}
.status-section .label-text {
	font-size: 28upx;
	color: #333;
}
.address-section {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
	position: relative;
}
.a-bg {
	position: absolute;
	right: 20upx;
	top: 50%;
	transform: translateY(-50%);
	width: 60upx;
	height: 60upx;
	opacity: 0.1;
}
.order-content {
	position: relative;
	z-index: 1;
}
.order-content .yticon {
	font-size: 36upx;
	color: #fa436a;
	margin-right: 10upx;
}
.cen .top {
	display: flex;
	align-items: center;
	margin-bottom: 10upx;
}
.cen .name {
	font-size: 28upx;
	color: #333;
	margin-right: 20upx;
}
.cen .mobile {
	font-size: 26upx;
	color: #666;
}
.cen .address {
	font-size: 26upx;
	color: #666;
	line-height: 1.4;
}
.order-info {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
}
.order-sn, .order-amount {
	font-size: 28upx;
	color: #333;
	margin-bottom: 10upx;
}
.refund-btn {
	background: #f5222d;
	color: #fff;
	border-radius: 8upx;
	padding: 12upx 24upx;
	font-size: 28upx;
	margin-top: 20upx;
	width: 100%;
}
.order-items {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
}
.items-title {
	font-size: 30upx;
	color: #333;
	font-weight: bold;
	margin-bottom: 20upx;
}
.item-card {
	display: flex;
	align-items: center;
	padding: 20upx 0;
	border-bottom: 1px solid #f5f5f5;
	position: relative;
}
.item-card:last-child {
	border-bottom: none;
}
.item-image {
	width: 120upx;
	height: 120upx;
	border-radius: 8upx;
	margin-right: 20upx;
}
.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}
.item-name {
	font-size: 28upx;
	color: #333;
	margin-bottom: 10upx;
}
.item-attr {
	font-size: 24upx;
	color: #999;
	margin-bottom: 10upx;
}
.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.item-price {
	font-size: 28upx;
	color: #fa436a;
	font-weight: bold;
}
.item-quantity {
	font-size: 24upx;
	color: #999;
}
.item-actions {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	gap: 10upx;
}

.action-btn {
	padding: 10upx 20upx;
	border-radius: 6upx;
	font-size: 24upx;
	border: none;
}

.comment-btn {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 8upx;
	padding: 12upx 24upx;
	font-size: 26upx;
	border: none;
}
.view-comment-btn {
	background: #999 !important;
}
.refund-popup {
	width: 90%;
	max-width: 680upx;
	background: #fff;
	border-radius: 24upx;
	overflow: hidden;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40upx 30upx 30upx;
	border-bottom: 1upx solid #f0f0f0;
}

.popup-title {
	font-size: 36upx;
	font-weight: 600;
	color: #333;
}

.popup-close {
	font-size: 48upx;
	color: #999;
	line-height: 1;
	width: 48upx;
	height: 48upx;
	display: flex;
	align-items: center;
	justify-content: center;
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
	font-size: 28upx;
	color: #666;
}

.info-value {
	font-size: 28upx;
	color: #333;
	font-weight: 500;
}

.info-value.price {
	color: #fa436a;
	font-weight: 600;
}

/* 表单区域 */
.popup-form {
	padding: 30upx;
	flex: 1;
	overflow-y: auto;
}

.form-item {
	margin-bottom: 30upx;
}

.form-item:last-child {
	margin-bottom: 0;
}

.label {
	font-size: 28upx;
	color: #333;
	margin-bottom: 16upx;
	display: block;
	font-weight: 500;
}

.required {
	color: #fa436a;
	margin-left: 4upx;
}

.input-wrapper {
	display: flex;
	align-items: center;
	border: 2upx solid #e5e5e5;
	border-radius: 12upx;
	padding: 0 20upx;
	background: #fff;
	transition: border-color 0.3s;
}

.input-wrapper:focus-within {
	border-color: #fa436a;
}

.input-prefix {
	font-size: 28upx;
	color: #333;
	margin-right: 8upx;
}

.refund-input {
	flex: 1;
	padding: 20upx 0;
	font-size: 28upx;
	color: #333;
	border: none;
	background: transparent;
}

.picker-wrapper {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 2upx solid #e5e5e5;
	border-radius: 12upx;
	padding: 20upx;
	background: #fff;
}

.picker-text {
	font-size: 28upx;
	color: #333;
}

.picker-arrow {
	font-size: 32upx;
	color: #999;
}

.refund-textarea {
	border: 2upx solid #e5e5e5;
	border-radius: 12upx;
	padding: 20upx;
	font-size: 28upx;
	width: 100%;
	min-height: 120upx;
	background: #fff;
	color: #333;
	box-sizing: border-box;
}

.refund-textarea:focus {
	border-color: #fa436a;
}

.popup-btn-group {
	display: flex;
	justify-content: space-between;
	padding: 30upx;
	border-top: 1upx solid #f0f0f0;
	gap: 20upx;
}

.cancel-btn {
	flex: 1;
	height: 88upx;
	line-height: 88upx;
	text-align: center;
	background: #f5f5f5;
	color: #666;
	border-radius: 12upx;
	font-size: 30upx;
	border: none;
}

.confirm-btn {
	flex: 1;
	height: 88upx;
	line-height: 88upx;
	text-align: center;
	background: linear-gradient(135deg, #fa436a 0%, #ff6b8a 100%);
	color: #fff;
	border-radius: 12upx;
	font-size: 30upx;
	font-weight: 600;
	border: none;
	box-shadow: 0 4upx 12upx rgba(250, 67, 106, 0.3);
}

.confirm-btn[disabled] {
	background: #ccc;
	box-shadow: none;
	opacity: 0.6;
}
</style>
