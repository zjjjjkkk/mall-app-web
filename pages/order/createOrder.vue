<template>
	<view>
		<!-- 地址 -->
		<navigator url="/pages/address/address?source=1" class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen">
					<view class="top">
						<text class="name">{{ currentAddress.name }}</text>
						<text class="mobile">{{ currentAddress.phoneNumber }}</text>
					</view>
					<text class="address">{{ currentAddress.province }} {{ currentAddress.city }} {{ currentAddress.region }}
						{{ currentAddress.detailAddress }}</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>

			<image class="a-bg"
				src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAAFCAYAAAAaAWmiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjkzMjM2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Rjk3RjkzMjQ2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTdGOTMyMTY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTdGOTMyMjY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrEOZlQAAAiuSURBVHjazJp7bFvV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">
			</image>
		</navigator>

		<view class="goods-section">
			<view class="g-header b-b">
				<text class="name">商品信息</text>
			</view>
			<!-- 商品列表 -->
			<view class="g-item" v-for="item in cartPromotionItemList" :key="item.id">
				<image :src="item.productPic"></image>
				<view class="right">
					<text class="title clamp">{{ item.productName }}</text>
					<text class="spec">{{ item.productAttr | formatProductAttr }}</text>
					<text class="promotion clamp">{{ item.promotionMessage }}</text>
					<view class="price-box">
						<text class="price">￥{{ item.price }}</text>
						<text class="number">x {{ item.quantity }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 优惠明细 -->
		<view class="yt-list">
			<view class="yt-list-cell b-b" @click="toggleMask('show')">
				<view class="cell-icon">
					券
				</view>
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip active">
					选择优惠券
				</text>
				<text class="cell-more wanjia wanjia-gengduo-d"></text>
			</view>
		</view>
		<!-- 金额明细 -->
		<view class="yt-list">
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">商品合计</text>
				<text class="cell-tip">￥{{ calcAmount.totalAmount }}</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">运费</text>
				<text class="cell-tip">￥{{ calcAmount.freightAmount }}</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">活动优惠</text>
				<text class="cell-tip red">-￥{{ calcAmount.promotionAmount }}</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip red" v-if="currCoupon != null">-￥{{ currCoupon.amount }}</text>
				<text class="cell-tip red" v-else>-￥0</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">积分抵扣</text>
				<switch :checked="useIntegration" @change="onIntegrationChange" color="#fa436a" />
			</view>
			<view class="yt-list-cell b-b" v-if="useIntegration">
				<text class="cell-tit clamp">可用积分</text>
				<text class="cell-tip">{{ memberIntegration || 0 }} 积分</text>
			</view>
			<view class="yt-list-cell b-b" v-if="useIntegration">
				<text class="cell-tit clamp">积分抵扣</text>
				<text class="cell-tip red">-￥{{ integrationAmount }}</text>
			</view>
			<view class="yt-list-cell">
				<text class="cell-tit clamp">支付后积分奖励</text>
				<text class="cell-tip green">
					约 {{ rewardPreview }} 分（含会员倍率{{ membershipMultiplier }}x）
				</text>
			</view>
			<view class="yt-list-cell desc-cell">
				<text class="cell-tit clamp">备注</text>
				<input class="desc" type="text" v-model="desc" placeholder="请填写备注信息" placeholder-class="placeholder" />
			</view>
		</view>

		<!-- 底部 -->
		<view class="footer">
			<view class="price-content">
				<text>实付款</text>
				<text class="price-tip">￥</text>
				<text class="price">{{ calcAmount.payAmount }}</text>
			</view>
			<text class="submit" @click="submit">提交订单</text>
		</view>

		<!-- 优惠券面板 -->
		<view class="mask" :class="maskState === 0 ? 'none' : maskState === 1 ? 'show' : ''" @click="toggleMask">
			<view class="mask-content" @click.stop.prevent="stopPrevent">
				<view class="coupon-header">
					<text class="coupon-title">选择优惠券</text>
					<text class="coupon-close" @click="toggleMask">×</text>
				</view>
				<!-- 优惠券页面，仿mt -->
				<view v-if="couponList.length === 0" class="empty-coupon">
					<text>暂无可用优惠券</text>
					<text class="empty-tip">您可以在"优惠券"页面领取优惠券</text>
				</view>
				<view class="coupon-item" v-for="(item, index) in couponList" :key="index" @click="selectCoupon(item)">
					<view class="con">
						<view class="left">
							<text class="title">{{ item.name }}</text>
							<text class="time">有效期至{{ item.endTime | formatDateTime }}</text>
						</view>
						<view class="right">
							<text class="price">￥{{ item.amount }}</text>
							<text>满{{ item.minPoint }}可用</text>
						</view>

						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<text class="tips">{{ item.useType | formatCouponUseType }}</text>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
import {
	generateConfirmOrder,
	generateOrder
} from '@/api/order.js'
import {
	formatDate
} from '@/utils/date'
import { fetchActiveMembership } from '@/api/member.js'
export default {
	data () {
		return {
			maskState: 0, //优惠券面板显示状态
			desc: '', //备注
			payType: 1, //1微信 2支付宝
			couponList: [],
			memberReceiveAddressList: [],
			currentAddress: {},
			cartPromotionItemList: [],
			calcAmount: { totalAmount: 0, promotionAmount: 0, freightAmount: 0, payAmount: 0 },
			currCoupon: null,
			cartIds: [],
			membership: null,
			useIntegration: false, // 是否使用积分抵扣
			memberIntegration: 0, // 用户当前积分
			useIntegrationAmount: 0 // 使用的积分数
		}
	},
	computed: {
		membershipMultiplier () {
			if (this.membership && this.membership.multiplier) {
				return this.membership.multiplier
			}
			return 1.0
		},
		rewardPreview () {
			// 支付后积分预估：从CartPromotionItem的integration字段读取，并应用会员倍率
			let totalGiftPoints = 0
			for (let item of this.cartPromotionItemList) {
				// CartPromotionItem中的integration字段就是商品配置的积分奖励
				const giftPoint = item.integration || 0
				totalGiftPoints += giftPoint * item.quantity
			}
			const points = Math.ceil(totalGiftPoints * this.membershipMultiplier)
			return points
		},
		integrationAmount () {
			// 计算积分抵扣金额：100积分=1元
			if (!this.useIntegration || this.useIntegrationAmount <= 0) {
				return '0.00'
			}
			return (this.useIntegrationAmount / 100).toFixed(2)
		}
	},
	onLoad (option) {
		//商品数据
		try {
			if (option.cartIds) {
				// 尝试解析URL参数中的cartIds
				// 如果参数被URL编码，先解码再解析
				let cartIdsStr = decodeURIComponent(option.cartIds)
				this.cartIds = JSON.parse(cartIdsStr)
			} else {
				// 如果没有传递cartIds参数，提示用户
				uni.showToast({
					title: '缺少购物车商品信息',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 2000)
				return
			}
			console.log('购物车ID列表:', this.cartIds)
			// 验证cartIds是否有效
			if (!Array.isArray(this.cartIds) || this.cartIds.length === 0) {
				uni.showToast({
					title: '请选择要购买的商品',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 2000)
				return
			}
			this.loadData()
			this.loadMembership()
		} catch (error) {
			console.error('解析购物车ID失败:', error)
			uni.showToast({
				title: '参数错误，请重新选择商品',
				icon: 'none',
				duration: 2000
			})
			setTimeout(() => {
				uni.navigateBack()
			}, 2000)
		}
	},
	filters: {
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
		formatCouponUseType (useType) {
			if (useType == 0) {
				return "全场通用"
			} else if (useType == 1) {
				return "指定分类商品可用"
			} else if (useType == 2) {
				return "指定商品可用"
			}
			return null
		},
	},
	methods: {
		//生成确认单信息
		async loadData () {
			// 检查cartIds是否有效
			if (!this.cartIds || !Array.isArray(this.cartIds) || this.cartIds.length === 0) {
				uni.showToast({
					title: '请选择要购买的商品',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 2000)
				return
			}
			
			uni.showLoading({
				title: '加载中...'
			})
			
			// 保持参数格式与generateOrder一致，直接传递数组而不是JSON字符串
			generateConfirmOrder(this.cartIds).then(response => {
				uni.hideLoading()
				if (response.code === 200 && response.data) {
					this.memberReceiveAddressList = response.data.memberReceiveAddressList || []
					this.currentAddress = this.getDefaultAddress()
					this.cartPromotionItemList = response.data.cartPromotionItemList || []
					this.couponList = []
					if (response.data.couponHistoryDetailList) {
						for (let item of response.data.couponHistoryDetailList) {
							if (item.coupon) {
								this.couponList.push(item.coupon)
							}
						}
					}
					this.calcAmount = response.data.calcAmount || {}
					// 获取用户积分
					this.memberIntegration = response.data.memberIntegration || 0
					// 重新计算实付金额
					this.calcPayAmount()
					
					// 检查是否有商品数据
					if (this.cartPromotionItemList.length === 0) {
						uni.showToast({
							title: '购物车商品已失效，请重新选择',
							icon: 'none',
							duration: 2000
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 2000)
					}
				} else {
					uni.showToast({
						title: response.message || '加载订单信息失败',
						icon: 'none',
						duration: 2000
					})
				}
			}).catch(error => {
				uni.hideLoading()
				console.error('加载订单确认信息失败:', error)
				uni.showToast({
					title: error.message || '加载订单信息失败，请重试',
					icon: 'none',
					duration: 2000
				})
			})
		},
		//显示优惠券面板
		toggleMask (type) {
			let timer = type === 'show' ? 10 : 300
			let state = type === 'show' ? 1 : 0
			this.maskState = 2
			setTimeout(() => {
				this.maskState = state
			}, timer)
		},
		numberChange (data) {
			this.number = data.number
		},
		changePayType (type) {
			this.payType = type
		},
		submit () {
			// 检查收货地址是否有效
			if (!this.currentAddress || !this.currentAddress.id || this.currentAddress.id === null) {
				uni.showToast({
					title: '请选择收货地址',
					icon: 'none'
				})
				return
			}

			// 检查购物车ID是否有效
			if (!this.cartIds || this.cartIds.length === 0) {
				uni.showToast({
					title: '请选择要购买的商品',
					icon: 'none'
				})
				return
			}

			let orderParam = {
				payType: this.payType, // 使用用户选择的支付方式
				couponId: this.currCoupon ? this.currCoupon.id : null,
				cartIds: this.cartIds,
				memberReceiveAddressId: this.currentAddress.id,
				useIntegration: this.useIntegration ? this.useIntegrationAmount : 0, // 使用的积分数
				note: this.desc // 添加订单备注
			}

			console.log('提交订单参数:', orderParam)
			console.log('当前选择的优惠券:', this.currCoupon)
			
			// 如果选择了优惠券，验证优惠券ID
			if (this.currCoupon && !this.currCoupon.id) {
				uni.showToast({
					title: '优惠券信息错误，请重新选择',
					icon: 'none'
				})
				return
			}

			generateOrder(orderParam).then(response => {
				let orderId = response.data.order.id
				uni.showModal({
					title: '提示',
					content: '订单创建成功，是否要立即支付？',
					confirmText: '去支付',
					cancelText: '取消',
					success: function (res) {
						if (res.confirm) {
							uni.redirectTo({
								url: `/pages/money/pay?orderId=${orderId}`
							})
						} else if (res.cancel) {
							console.log("取消支付")
							uni.redirectTo({
								url: '/pages/order/order?state=0'
							})
						}
					}
				})
			}).catch(error => {
				// 错误已在requestUtil中处理，这里可以添加额外的错误逻辑
				console.error('订单生成失败:', error)
				
				// 如果是优惠券相关错误，清除已选择的优惠券并提示用户重新选择
				if (error && error.message && (error.message.includes('优惠券') || error.message.includes('不可用'))) {
					this.currCoupon = null
					this.calcPayAmount()
					// 重新加载可用优惠券列表
					setTimeout(() => {
						this.loadData()
					}, 1000)
				}
			})
		},
		stopPrevent () { },
		//获取默认收货地址
		getDefaultAddress () {
			for (let item of this.memberReceiveAddressList) {
				if (item.defaultStatus == 1) {
					return item
				}
			}
			if (this.memberReceiveAddressList != null && this.memberReceiveAddressList.length > 0) {
				return this.memberReceiveAddressList[0]
			}
			// 返回一个带有id属性的空对象，避免后续出错
			return { id: null }
		},
		selectCoupon (coupon) {
			if (!coupon || !coupon.id) {
				uni.showToast({
					title: '优惠券信息错误',
					icon: 'none'
				})
				return
			}
			
			this.currCoupon = coupon
			// 选择优惠券后重新计算实付金额
			this.calcPayAmount()
			this.toggleMask()
			
			uni.showToast({
				title: '已选择优惠券',
				icon: 'success',
				duration: 1500
			})
		},
		//计算支付金额
		calcPayAmount () {
			this.calcAmount.payAmount = this.calcAmount.totalAmount - this.calcAmount.promotionAmount - this.calcAmount.freightAmount
			if (this.currCoupon != null) {
				this.calcAmount.payAmount = this.calcAmount.payAmount - this.currCoupon.amount
			}
			// 积分抵扣
			if (this.useIntegration && this.useIntegrationAmount > 0) {
				const integrationDeduct = this.useIntegrationAmount / 100
				this.calcAmount.payAmount = this.calcAmount.payAmount - integrationDeduct
			}
			if (this.calcAmount.payAmount < 0) {
				this.calcAmount.payAmount = 0
			}
		},
		// 积分抵扣开关变化
		onIntegrationChange (e) {
			this.useIntegration = e.detail.value
			if (this.useIntegration) {
				// 计算可使用的最大积分数（不超过订单金额）
				const maxIntegration = Math.floor((this.calcAmount.totalAmount - this.calcAmount.promotionAmount - 
					(this.currCoupon ? this.currCoupon.amount : 0)) * 100)
				// 不超过用户拥有的积分
				this.useIntegrationAmount = Math.min(maxIntegration, this.memberIntegration)
				// 向下取整到100的倍数（100积分=1元）
				this.useIntegrationAmount = Math.floor(this.useIntegrationAmount / 100) * 100
			} else {
				this.useIntegrationAmount = 0
			}
			// 重新计算实付金额
			this.calcPayAmount()
		},
		async loadMembership () {
			try {
				const res = await fetchActiveMembership()
				if (res && res.code === 200) {
					this.membership = res.data
				}
			} catch (e) {
				console.error('加载会员信息失败', e)
			}
		}
	}
}
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-bottom: 100upx;
}

.address-section {
	padding: 30upx 0;
	background: #fff;
	position: relative;

	.order-content {
		display: flex;
		align-items: center;
	}

	.icon-shouhuodizhi {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 90upx;
		color: #888;
		font-size: 44upx;
	}

	.cen {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: 28upx;
		color: $font-color-dark;
	}

	.name {
		font-size: 34upx;
		margin-right: 24upx;
	}

	.address {
		margin-top: 16upx;
		margin-right: 20upx;
		color: $font-color-light;
	}

	.icon-you {
		font-size: 32upx;
		color: $font-color-light;
		margin-right: 30upx;
	}

	.a-bg {
		position: absolute;
		left: 0;
		bottom: 0;
		display: block;
		width: 100%;
		height: 5upx;
	}
}

.goods-section {
	margin-top: 16upx;
	background: #fff;
	padding-bottom: 1px;

	.g-header {
		display: flex;
		align-items: center;
		height: 84upx;
		padding: 0 30upx;
		position: relative;
	}

	.logo {
		display: block;
		width: 50upx;
		height: 50upx;
		border-radius: 100px;
	}

	.name {
		font-size: 30upx;
		color: $font-color-base;
		margin-left: 24upx;
	}

	.g-item {
		display: flex;
		margin: 20upx 30upx;

		image {
			flex-shrink: 0;
			display: block;
			width: 140upx;
			height: 140upx;
			border-radius: 4upx;
		}

		.right {
			flex: 1;
			padding-left: 24upx;
			overflow: hidden;
		}

		.title {
			font-size: 30upx;
			color: $font-color-dark;
		}

		.spec {
			font-size: 26upx;
			color: $font-color-light;
		}

		.promotion {
			font-size: 24upx;
			color: $base-color;
		}

		.price-box {
			display: flex;
			align-items: center;
			font-size: 32upx;
			color: $font-color-dark;
			padding-top: 10upx;

			.price {
				margin-bottom: 4upx;
			}

			.number {
				font-size: 26upx;
				color: $font-color-base;
				margin-left: 20upx;
			}
		}

		.step-box {
			position: relative;
		}
	}
}

.yt-list {
	margin-top: 16upx;
	background: #fff;
}

.yt-list-cell {
	display: flex;
	align-items: center;
	padding: 10upx 30upx 10upx 40upx;
	line-height: 70upx;
	position: relative;

	&.cell-hover {
		background: #fafafa;
	}

	&.b-b:after {
		left: 30upx;
	}

	.cell-icon {
		height: 32upx;
		width: 32upx;
		font-size: 22upx;
		color: #fff;
		text-align: center;
		line-height: 32upx;
		background: #f85e52;
		border-radius: 4upx;
		margin-right: 12upx;

		&.hb {
			background: #ffaa0e;
		}

		&.lpk {
			background: #3ab54a;
		}

	}

	.cell-more {
		align-self: center;
		font-size: 24upx;
		color: $font-color-light;
		margin-left: 8upx;
		margin-right: -10upx;
	}

	.cell-tit {
		flex: 1;
		font-size: 26upx;
		color: $font-color-light;
		margin-right: 10upx;
	}

	.cell-tip {
		font-size: 26upx;
		color: $font-color-dark;

		&.disabled {
			color: $font-color-light;
		}

		&.active {
			color: $base-color;
		}

		&.red {
			color: $base-color;
		}
	}

	&.desc-cell {
		.cell-tit {
			max-width: 90upx;
		}
	}

	.desc {
		flex: 1;
		font-size: $font-base;
		color: $font-color-dark;
	}

	.integration {
		flex: 1;
		font-size: $font-base;
		color: $font-color-dark;
		text-align: right;
	}
}

/* 支付列表 */
.pay-list {
	padding-left: 40upx;
	margin-top: 16upx;
	background: #fff;

	.pay-item {
		display: flex;
		align-items: center;
		padding-right: 20upx;
		line-height: 1;
		height: 110upx;
		position: relative;
	}

	.icon-weixinzhifu {
		width: 80upx;
		font-size: 40upx;
		color: #6BCC03;
	}

	.icon-alipay {
		width: 80upx;
		font-size: 40upx;
		color: #06B4FD;
	}

	.icon-xuanzhong2 {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60upx;
		height: 60upx;
		font-size: 40upx;
		color: $base-color;
	}

	.tit {
		font-size: 32upx;
		color: $font-color-dark;
		flex: 1;
	}
}

.footer {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 995;
	display: flex;
	align-items: center;
	width: 100%;
	height: 90upx;
	justify-content: space-between;
	font-size: 30upx;
	background-color: #fff;
	z-index: 998;
	color: $font-color-base;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, .1);

	.price-content {
		padding-left: 30upx;
	}

	.price-tip {
		color: $base-color;
		margin-left: 8upx;
	}

	.price {
		font-size: 36upx;
		color: $base-color;
	}

	.submit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 280upx;
		height: 100%;
		color: #fff;
		font-size: 32upx;
		background-color: $base-color;
	}
}

/* 优惠券面板 */
.mask {
	display: flex;
	align-items: flex-end;
	position: fixed;
	left: 0;
	top: var(--window-top);
	bottom: 0;
	width: 100%;
	background: rgba(0, 0, 0, 0);
	z-index: 9995;
	transition: .3s;

	.mask-content {
		width: 100%;
		min-height: 30vh;
		max-height: 70vh;
		background: #f3f3f3;
		transform: translateY(100%);
		transition: .3s;
		overflow-y: scroll;
		
		.coupon-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			background: #fff;
			border-bottom: 1rpx solid #f5f5f5;
			position: sticky;
			top: 0;
			z-index: 10;
			
			.coupon-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
			
			.coupon-close {
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
		
		.empty-coupon {
			text-align: center;
			padding: 100rpx 30rpx;
			background: #fff;
			margin: 20rpx;
			border-radius: 16rpx;
			
			text {
				display: block;
				font-size: 28rpx;
				color: #999;
				margin-bottom: 20rpx;
			}
			
			.empty-tip {
				font-size: 24rpx;
				color: #ccc;
			}
		}
	}

	&.none {
		display: none;
	}

	&.show {
		background: rgba(0, 0, 0, .4);

		.mask-content {
			transform: translateY(0);
		}
	}
}

/* 优惠券列表 */
.coupon-item {
	display: flex;
	flex-direction: column;
	margin: 20upx 24upx;
	background: #fff;

	.con {
		display: flex;
		align-items: center;
		position: relative;
		height: 120upx;
		padding: 0 30upx;

		&:after {
			position: absolute;
			left: 0;
			bottom: 0;
			content: '';
			width: 100%;
			height: 0;
			border-bottom: 1px dashed #f3f3f3;
			transform: scaleY(50%);
		}
	}

	.left {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		overflow: hidden;
		height: 100upx;
	}

	.title {
		font-size: 32upx;
		color: $font-color-dark;
		margin-bottom: 10upx;
	}

	.time {
		font-size: 24upx;
		color: $font-color-light;
	}

	.right {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 26upx;
		color: $font-color-base;
		height: 100upx;
	}

	.price {
		font-size: 44upx;
		color: $base-color;

		&:before {
			content: '￥';
			font-size: 34upx;
		}
	}

	.tips {
		font-size: 24upx;
		color: $font-color-light;
		line-height: 60upx;
		padding-left: 30upx;
	}

	.circle {
		position: absolute;
		left: -6upx;
		bottom: -10upx;
		z-index: 10;
		width: 20upx;
		height: 20upx;
		background: #f3f3f3;
		border-radius: 100px;

		&.r {
			left: auto;
			right: -6upx;
		}
	}
}
</style>
