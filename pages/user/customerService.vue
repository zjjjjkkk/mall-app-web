<template>
	<view class="container">
		<!-- 选择服务类型 -->
		<view class="service-type-section" v-if="!showChat">
			<view class="type-card" @click="goToFeedback">
				<view class="type-icon">📝</view>
				<text class="type-title">提交反馈</text>
				<text class="type-desc">提交您的问题或建议</text>
			</view>
			<view class="type-card" @click="startChat">
				<view class="type-icon">💬</view>
				<text class="type-title">在线客服</text>
				<text class="type-desc">智能客服为您解答</text>
			</view>
		</view>
		
		<!-- 聊天界面 -->
		<view class="chat-container" v-else>
			<!-- 消息列表 -->
			<scroll-view class="message-list" scroll-y :scroll-top="scrollTop" scroll-with-animation>
				<view class="message-item" v-for="(msg, index) in messageList" :key="index" :class="msg.type">
					<view class="message-content">
						<text class="message-text">{{ msg.content }}</text>
						<text class="message-time">{{ formatTime(msg.time) }}</text>
					</view>
				</view>
				
				<!-- 预设问题 -->
				<view class="preset-questions" v-if="showPresetQuestions">
					<view class="preset-title">常见问题：</view>
					<view class="preset-list">
						<view 
							class="preset-item" 
							v-for="(question, index) in presetQuestions" 
							:key="index"
							@click="selectPresetQuestion(question)"
						>
							{{ question }}
						</view>
					</view>
				</view>
			</scroll-view>
			
			<!-- 输入框 -->
			<view class="input-container safe-area-bottom">
				<input 
					class="input-box" 
					v-model="inputText" 
					placeholder="请输入您的问题..."
					@confirm="sendMessage"
					:focus="inputFocus"
					@input="onInput"
					:disabled="loading"
				/>
				<button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || loading">
					{{ loading ? '思考中...' : '发送' }}
				</button>
			</view>
		</view>
		
		<!-- 订单选择弹窗 -->
		<uni-popup ref="orderPopup" type="bottom" mask-click="false">
			<view class="order-popup">
				<view class="popup-header">
					<text class="popup-title">请选择订单</text>
					<text class="popup-close" @click="closeOrderPopup">×</text>
				</view>
				<scroll-view class="order-list" scroll-y>
					<view v-if="orderList.length === 0" class="empty-orders">
						<text>暂无订单</text>
					</view>
					<view 
						v-for="(order, index) in orderList" 
						:key="index" 
						class="order-item"
						@click="selectOrder(order)"
					>
						<view class="order-header">
							<text class="order-sn">订单号：{{ order.orderSn || order.id }}</text>
							<text class="order-status" :class="getStatusClass(order.status)">
								{{ getStatusText(order.status) }}
							</text>
						</view>
						<view class="order-info">
							<text class="order-time">{{ formatDateTime(order.createTime) }}</text>
							<text class="order-amount">¥{{ order.totalAmount || order.payAmount || 0 }}</text>
						</view>
						<view class="order-goods" v-if="order.orderItemList && order.orderItemList.length > 0">
							<text class="goods-name">{{ order.orderItemList[0].productName }}</text>
							<text class="goods-count" v-if="order.orderItemList.length > 1">
								等{{ order.orderItemList.length }}件商品
							</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { getLatestOrder, fetchOrderList } from '@/api/order.js'
import { getAIResponse } from '@/api/customerService.js'
import logger from '@/utils/logger.js'
import { showError } from '@/utils/errorHandler.js'
import { formatDate } from '@/utils/date'

// 关键字回复配置
const keywordReplies = {
	'报修': {
		reply: '您好，我理解您需要申请报修服务。让我为您查询最近的订单...',
		action: 'repair'
	},
	'退款': {
		reply: '您好，关于退款问题，您可以在"我的退款"中申请退款，或提交反馈详细说明情况。',
		action: null
	},
	'退货': {
		reply: '您好，关于退货问题，您可以在订单详情页申请退货，或提交反馈详细说明情况。',
		action: null
	},
	'物流': {
		reply: '您好，您可以在"我的订单"中查看订单物流信息。如有疑问，请提供订单号，我会为您查询。',
		action: null
	},
	'优惠': {
		reply: '您好，您可以在"优惠券"中查看可用的优惠券。新用户注册可领取新人礼包，关注我们还能获得更多优惠哦！',
		action: null
	},
	'发票': {
		reply: '您好，您可以在订单详情页申请开具发票。如有其他问题，请提交反馈，我们会尽快处理。',
		action: null
	}
}

// 默认回复
const defaultReplies = [
	'您好，我是智能客服，有什么可以帮助您的吗？',
	'您可以输入"报修"、"退款"、"退货"、"物流"、"优惠"、"发票"等关键词，我会为您提供帮助。',
	'如果问题比较复杂，建议您选择"提交反馈"，我们会安排专人处理。'
]

export default {
		data() {
		return {
			showChat: false,
			messageList: [],
			inputText: '',
			inputFocus: false,
			scrollTop: 0,
			latestOrder: null,
			repairOrderItem: null,
			showPresetQuestions: false,
			presetQuestions: [
				'报修',
				'退款',
				'退货',
				'物流',
				'优惠',
				'发票'
			],
			useAI: true, // 是否使用AI智能回复
			loading: false, // 是否正在获取AI回复
			orderList: [], // 订单列表
			currentOrderAction: null // 当前订单操作类型（refund/return/logistics/comment）
		}
	},
	onLoad() {
		// 不显示初始化消息，直接显示两个选项
	},
	methods: {
		goToFeedback() {
			uni.navigateTo({
				url: '/pages/user/feedback'
			})
		},
		startChat() {
			this.showChat = true
			this.messageList = []
			this.showPresetQuestions = true
			
			// 自动发送欢迎语
			this.$nextTick(() => {
				setTimeout(() => {
					this.addSystemMessage('您好，欢迎使用在线客服！我是智能客服，有什么可以帮助您的吗？')
					
					// 延迟显示预设问题
					setTimeout(() => {
						this.scrollToBottom()
					}, 300)
				}, 300)
			})
		},
		async sendMessage() {
			if (!this.inputText.trim()) {
				return
			}
			
			// 隐藏预设问题
			this.showPresetQuestions = false
			
			// 添加用户消息
			this.addUserMessage(this.inputText.trim())
			const userInput = this.inputText.trim()
			this.inputText = ''
			
			// 延迟回复，模拟思考
			setTimeout(() => {
				this.processMessage(userInput)
			}, 500)
		},
		selectPresetQuestion(question) {
			// 隐藏预设问题
			this.showPresetQuestions = false
			
			// 设置输入框内容并发送
			this.inputText = question
			this.sendMessage()
		},
		onInput() {
			// 输入时隐藏预设问题
			if (this.showPresetQuestions && this.inputText.trim()) {
				this.showPresetQuestions = false
			}
		},
		async processMessage(userInput) {
			// 检查是否是订单相关问题，如果是则先弹出订单选择
			const orderAction = this.checkOrderRelatedQuestion(userInput)
			if (orderAction) {
				this.currentOrderAction = orderAction
				await this.loadOrderList()
				if (this.orderList.length > 0) {
					this.$refs.orderPopup.open()
					return
				}
			}
			
			// 如果启用AI，优先使用AI回复
			if (this.useAI) {
				this.loading = true
				try {
					// 构建对话历史
					const history = this.buildConversationHistory()
					
					// 调用AI接口
					const response = await getAIResponse(userInput, history)
					
					if (response.code === 200 && response.data) {
						this.addSystemMessage(response.data)
						
						// 如果AI回复中包含报修相关，检查是否需要执行报修流程
						if (userInput.includes('报修') || response.data.includes('报修')) {
							setTimeout(() => {
								this.handleRepairRequest()
							}, 1000)
						}
						
						// 检查AI回复后是否需要弹出订单选择
						const aiOrderAction = this.checkOrderRelatedQuestion(response.data)
						if (aiOrderAction && !orderAction) {
							this.currentOrderAction = aiOrderAction
							await this.loadOrderList()
							if (this.orderList.length > 0) {
								setTimeout(() => {
									this.$refs.orderPopup.open()
								}, 1000)
							}
						}
					} else {
						// AI失败，使用关键字匹配
						this.processMessageWithKeywords(userInput)
					}
				} catch (error) {
					console.error('AI客服回复失败:', error)
					// AI失败，使用关键字匹配
					this.processMessageWithKeywords(userInput)
				} finally {
					this.loading = false
				}
			} else {
				// 不使用AI，直接使用关键字匹配
				this.processMessageWithKeywords(userInput)
			}
		},
		
		// 检查是否是订单相关问题
		checkOrderRelatedQuestion(text) {
			if (!text) return null
			const lowerText = text.toLowerCase()
			
			// 退款相关
			if (lowerText.includes('退款') || lowerText.includes('退钱')) {
				return 'refund'
			}
			// 退货相关
			if (lowerText.includes('退货') || lowerText.includes('退回')) {
				return 'return'
			}
			// 物流相关
			if (lowerText.includes('物流') || lowerText.includes('快递') || lowerText.includes('发货') || 
			    lowerText.includes('配送') || lowerText.includes('运输')) {
				return 'logistics'
			}
			// 评价相关
			if (lowerText.includes('评价') || lowerText.includes('评论') || lowerText.includes('评分')) {
				return 'comment'
			}
			// 订单相关（通用）
			if (lowerText.includes('订单') && (lowerText.includes('查看') || lowerText.includes('详情') || 
			    lowerText.includes('状态') || lowerText.includes('进度'))) {
				return 'detail'
			}
			
			return null
		},
		
		// 加载订单列表
		async loadOrderList() {
			try {
				const response = await fetchOrderList({
					pageNum: 1,
					pageSize: 20,
					status: -1 // 获取所有状态的订单
				})
				
				if (response.code === 200 && response.data && response.data.list) {
					this.orderList = response.data.list
				} else {
					this.orderList = []
				}
			} catch (error) {
				console.error('加载订单列表失败:', error)
				this.orderList = []
			}
		},
		
		// 选择订单
		selectOrder(order) {
			this.closeOrderPopup()
			
			// 根据操作类型跳转到相应页面
			switch (this.currentOrderAction) {
				case 'refund':
					// 跳转到退款申请页面
					uni.navigateTo({
						url: `/pages/order/orderDetail?orderId=${order.id}`
					})
					this.addSystemMessage(`已为您打开订单详情，您可以在订单详情页申请退款。`)
					break
				case 'return':
					// 跳转到退货申请页面
					uni.navigateTo({
						url: `/pages/order/orderDetail?orderId=${order.id}`
					})
					this.addSystemMessage(`已为您打开订单详情，您可以在订单详情页申请退货。`)
					break
				case 'logistics':
					// 跳转到订单详情查看物流
					uni.navigateTo({
						url: `/pages/order/orderDetail?orderId=${order.id}`
					})
					this.addSystemMessage(`已为您打开订单详情，您可以在订单详情页查看物流信息。`)
					break
				case 'comment':
					// 跳转到订单详情，然后可以评价
					uni.navigateTo({
						url: `/pages/order/orderDetail?orderId=${order.id}`
					})
					this.addSystemMessage(`已为您打开订单详情，您可以在订单详情页对商品进行评价。`)
					break
				case 'detail':
				default:
					// 跳转到订单详情
					uni.navigateTo({
						url: `/pages/order/orderDetail?orderId=${order.id}`
					})
					this.addSystemMessage(`已为您打开订单详情。`)
					break
			}
			
			this.currentOrderAction = null
		},
		
		// 关闭订单弹窗
		closeOrderPopup() {
			this.$refs.orderPopup.close()
		},
		
		// 获取订单状态文本
		getStatusText(status) {
			const statusMap = {
				0: '待付款',
				1: '待发货',
				2: '待收货',
				3: '已完成',
				4: '已取消'
			}
			return statusMap[status] || '未知'
		},
		
		// 获取订单状态样式类
		getStatusClass(status) {
			const classMap = {
				0: 'status-wait-pay',
				1: 'status-wait-ship',
				2: 'status-wait-receive',
				3: 'status-completed',
				4: 'status-cancelled'
			}
			return classMap[status] || ''
		},
		
		// 格式化日期时间
		formatDateTime(time) {
			if (!time) return ''
			return formatDate(new Date(time), 'yyyy-MM-dd hh:mm')
		},
		
		async processMessageWithKeywords(userInput) {
			// 检查是否是订单相关问题
			const orderAction = this.checkOrderRelatedQuestion(userInput)
			if (orderAction) {
				this.currentOrderAction = orderAction
				await this.loadOrderList()
				if (this.orderList.length > 0) {
					this.$refs.orderPopup.open()
					return
				}
			}
			
			// 转换为小写进行匹配
			const lowerInput = userInput.toLowerCase()
			
			// 检查关键字
			let matched = false
			for (const keyword in keywordReplies) {
				if (lowerInput.includes(keyword.toLowerCase())) {
					matched = true
					const config = keywordReplies[keyword]
					this.addSystemMessage(config.reply)
					
					// 如果是报修，执行特殊处理
					if (config.action === 'repair') {
						setTimeout(() => {
							this.handleRepairRequest()
						}, 1000)
					}
					break
				}
			}
			
			// 如果没有匹配到关键字，使用默认回复
			if (!matched) {
				const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
				this.addSystemMessage(randomReply)
			}
		},
		
		buildConversationHistory() {
			// 构建对话历史，只保留最近5轮对话
			const recentMessages = this.messageList.slice(-10) // 最近10条消息（5轮对话）
			const historyLines = []
			
			for (const msg of recentMessages) {
				if (msg.type === 'user') {
					historyLines.push(`user:${msg.content}`)
				} else if (msg.type === 'system') {
					historyLines.push(`assistant:${msg.content}`)
				}
			}
			
			return historyLines.join('\n')
		},
		async handleRepairRequest() {
			try {
				// 获取最近一次订单
				const res = await getLatestOrder()
				if (res.code === 200 && res.data) {
					this.latestOrder = res.data
					// 使用 uni.showModal 显示订单确认弹窗
					const orderInfo = `订单编号：${this.latestOrder.orderSn}\n订单金额：¥${this.latestOrder.totalAmount || 0}`
					uni.showModal({
						title: '确认报修订单',
						content: `${orderInfo}\n\n是否要为该订单申请报修？`,
						confirmText: '确认报修',
						cancelText: '取消',
						success: (modalRes) => {
							if (modalRes.confirm) {
								this.confirmRepair()
							} else {
								this.addSystemMessage('已取消报修申请。如需其他帮助，请继续输入。')
							}
						}
					})
				} else {
					this.addSystemMessage('抱歉，未找到您的订单信息。请先下单后再申请报修。')
				}
			} catch (e) {
				console.error('获取订单失败:', e)
				this.addSystemMessage('抱歉，获取订单信息失败，请稍后重试。')
			}
		},
		confirmRepair() {
			// 获取第一个订单商品（使用正确的字段名 orderItemList）
			const orderItems = this.latestOrder.orderItemList || this.latestOrder.orderItems || []
			if (orderItems.length === 0) {
				this.addSystemMessage('抱歉，该订单没有商品信息。')
				return
			}
			
			const firstItem = orderItems[0]
			
			// 构建跳转参数
			const params = {
				orderId: this.latestOrder.id,
				orderItemId: firstItem.id,
				productId: firstItem.productId,
				productName: firstItem.productName || '',
				productPic: firstItem.productPic || '',
				productAttribute: firstItem.productAttr || ''
			}
			
			// brandId 不是订单项字段，如果需要可以从商品信息中获取，这里先不传
			// 报修申请页面会根据 productId 加载品牌信息
			
			const query = Object.keys(params).map(key => {
				const value = params[key]
				if (value !== null && value !== undefined && value !== '') {
					return `${key}=${encodeURIComponent(value)}`
				}
				return ''
			}).filter(item => item).join('&')
			
			// 跳转到报修申请页面
			uni.navigateTo({
				url: `/pages/repair/apply?${query}`
			})
		},
		addUserMessage(content) {
			this.messageList.push({
				type: 'user',
				content: content,
				time: new Date()
			})
			this.scrollToBottom()
		},
		addSystemMessage(content) {
			this.messageList.push({
				type: 'system',
				content: content,
				time: new Date()
			})
			this.scrollToBottom()
		},
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 99999
			})
		},
		formatTime(time) {
			if (!time) return ''
			const date = new Date(time)
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${hour}:${minute}`
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	background: #f5f5f5;
	min-height: 100vh;
}

.service-type-section {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
	padding: 30rpx;
	
	.type-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 60rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		
		.type-icon {
			font-size: 80rpx;
			margin-bottom: 20rpx;
		}
		
		.type-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.type-desc {
			font-size: 26rpx;
			color: #999;
		}
	}
}

.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f5f5f5;
}

.message-list {
	flex: 1;
	padding: 20rpx;
	
	.message-item {
		margin-bottom: 30rpx;
		
		&.user {
			display: flex;
			justify-content: flex-end;
			
			.message-content {
				background: #007aff;
				color: #fff;
				border-radius: 20rpx 20rpx 4rpx 20rpx;
			}
		}
		
		&.system {
			display: flex;
			justify-content: flex-start;
			
			.message-content {
				background: #fff;
				color: #333;
				border-radius: 20rpx 20rpx 20rpx 4rpx;
			}
		}
		
		.message-content {
			max-width: 70%;
			padding: 20rpx 24rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
			
			.message-text {
				font-size: 28rpx;
				line-height: 1.6;
				display: block;
				margin-bottom: 8rpx;
			}
			
			.message-time {
				font-size: 22rpx;
				opacity: 0.7;
				display: block;
			}
		}
	}
}

.input-container {
	display: flex;
	align-items: center;
	padding: 20rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #e5e5e5;
	box-sizing: border-box;
	
	&.safe-area-bottom {
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}
	
	.input-box {
		flex: 1;
		min-width: 0;
		height: 70rpx;
		padding: 0 20rpx;
		background: #f5f5f5;
		border-radius: 35rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
		box-sizing: border-box;
	}
	
	.send-btn {
		flex-shrink: 0;
		width: 120rpx;
		height: 70rpx;
		line-height: 70rpx;
		background: #007aff;
		color: #fff;
		border-radius: 35rpx;
		font-size: 28rpx;
		border: none;
		
		&:disabled {
			background: #ccc;
			opacity: 0.6;
		}
	}
}

.preset-questions {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #fff;
	border-radius: 20rpx;
	
	.preset-title {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	
	.preset-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		
		.preset-item {
			padding: 16rpx 32rpx;
			background: #f5f5f5;
			border-radius: 40rpx;
			font-size: 26rpx;
			color: #333;
			transition: all 0.3s;
			
			&:active {
				background: #007aff;
				color: #fff;
			}
		}
	}
}

/* 订单选择弹窗 */
.order-popup {
	background: #fff;
	border-radius: 30rpx 30rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f5f5f5;
	
	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	
	.popup-close {
		font-size: 50rpx;
		color: #999;
		line-height: 1;
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.order-list {
	flex: 1;
	max-height: calc(80vh - 120rpx);
	padding: 20rpx;
}

.empty-orders {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}

.order-item {
	background: #f9f9f9;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
		
		.order-sn {
			font-size: 26rpx;
			color: #666;
		}
		
		.order-status {
			font-size: 24rpx;
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			
			&.status-wait-pay {
				background: #fff3e0;
				color: #ff9800;
			}
			
			&.status-wait-ship {
				background: #e3f2fd;
				color: #2196f3;
			}
			
			&.status-wait-receive {
				background: #e8f5e9;
				color: #4caf50;
			}
			
			&.status-completed {
				background: #f3e5f5;
				color: #9c27b0;
			}
			
			&.status-cancelled {
				background: #fafafa;
				color: #999;
			}
		}
	}
	
	.order-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
		
		.order-time {
			font-size: 24rpx;
			color: #999;
		}
		
		.order-amount {
			font-size: 28rpx;
			font-weight: bold;
			color: #ff6b35;
		}
	}
	
	.order-goods {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.goods-name {
			font-size: 26rpx;
			color: #333;
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		
		.goods-count {
			font-size: 24rpx;
			color: #999;
		}
	}
}

</style>



