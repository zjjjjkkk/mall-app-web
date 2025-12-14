<template>  
    <view class="container">  
		
		<view class="user-section">
			<view class="user-bg-gradient"></view>
			<view class="user-info-box">
				<view class="portrait-box">
					<view class="portrait-wrapper">
						<image class="portrait" :src="userInfo.icon || '/static/missing-face.png'"></image>
						<view class="portrait-border"></view>
					</view>
				</view>
				<view class="info-box">
					<view class="username-row">
						<text class="username">{{userInfo.nickname || '游客'}}</text>
						<text v-if="hasLogin && userLevel" class="level-badge">Lv.{{ userLevel }}</text>
						<text v-if="hasLogin && membership && membership.levelType" 
							class="membership-badge" 
							:class="getMembershipClass(membership.levelType)">
							{{ getMembershipName(membership.levelType) }}
						</text>
					</view>
					<text class="user-desc" v-if="hasLogin">ID: {{userInfo.id || '--'}}</text>
					<text class="user-desc" v-else>点击登录，享受更多服务</text>
				</view>
			</view>
		</view>
		
		<view 
			class="cover-container"
			:style="[{
				transform: coverTransform,
				transition: coverTransition
			}]"
			@touchstart="coverTouchstart"
			@touchmove="coverTouchmove"
			@touchend="coverTouchend"
		>
			<image class="arc" src="/static/arc.png"></image>
			
			<view class="stats-section">
				<view class="stats-card">
					<view class="stats-item" @click="navTo('/pages/coupon/couponList')">
						<view class="stats-icon-wrapper coupon">
							<text class="stats-icon">🎫</text>
						</view>
						<text class="stats-num">{{couponCount || 0}}</text>
						<text class="stats-label">优惠券</text>
					</view>
					<view class="stats-divider"></view>
					<view class="stats-item" @click="navTo('/pages/points/points')">
						<view class="stats-icon-wrapper points">
							<text class="stats-icon yticon icon-jifen"></text>
						</view>
						<text class="stats-num">{{userInfo.integration || 0}}</text>
						<text class="stats-label">积分</text>
					</view>
					<view class="stats-divider"></view>
					<view class="stats-item" @click="navTo('/pages/points/points')">
						<view class="stats-icon-wrapper growth">
							<text class="stats-icon yticon icon-chengzhang"></text>
						</view>
						<text class="stats-num">{{userInfo.growth || 0}}</text>
						<text class="stats-label">成长值</text>
					</view>
				</view>
			</view>
			<!-- 签到区域 -->
			<view class="sign-in-section" v-if="hasLogin">
				<view class="sign-in-card">
					<view class="sign-in-header">
						<view class="sign-in-title-wrapper">
							<text class="sign-in-icon">📅</text>
							<view>
								<text class="sign-in-title">每日签到</text>
								<text class="sign-in-desc">签到可获得10积分</text>
							</view>
						</view>
						<view class="continuous-days-badge" v-if="continuousDays > 0">
							<text class="continuous-days-text">连续{{continuousDays}}天</text>
						</view>
					</view>
					<view class="sign-in-footer">
						<view class="sign-in-status">
							<text class="sign-in-tip" v-if="isSignedToday">✅ 今日已签到</text>
							<text class="sign-in-tip" v-else>⏰ 今日未签到</text>
						</view>
						<button 
							class="sign-in-btn" 
							:class="{ 'signed': isSignedToday, 'disabled': isSigning }"
							:disabled="isSignedToday || isSigning"
							@click="handleSignIn"
						>
							{{ isSignedToday ? '已签到' : (isSigning ? '签到中...' : '立即签到') }}
						</button>
					</view>
				</view>
			</view>
			<!-- 订单 -->
			<view class="order-section">
				<view class="order-header">
					<text class="order-title">我的订单</text>
					<text class="order-more" @click="navTo('/pages/order/order?state=0')">查看全部 ></text>
				</view>
				<view class="order-grid">
					<view class="order-item" @click="navTo('/pages/order/order?state=0')" hover-class="order-item-hover" :hover-stay-time="50">
						<view class="order-icon-wrapper all">
							<text class="order-icon">📋</text>
						</view>
						<text class="order-text">全部订单</text>
					</view>
					<view class="order-item" @click="navTo('/pages/order/order?state=1')" hover-class="order-item-hover" :hover-stay-time="50">
						<view class="order-icon-wrapper payment">
							<text class="order-icon">💳</text>
						</view>
						<text class="order-text">待付款</text>
					</view>
					<view class="order-item" @click="navTo('/pages/order/order?state=2')" hover-class="order-item-hover" :hover-stay-time="50">
						<view class="order-icon-wrapper receive">
							<text class="order-icon">📦</text>
						</view>
						<text class="order-text">待收货</text>
					</view>
					<view class="order-item" @click="navTo('/pages/user/refundList')" hover-class="order-item-hover" :hover-stay-time="50">
						<view class="order-icon-wrapper refund">
							<text class="order-icon">🔄</text>
						</view>
						<text class="order-text">退款/售后</text>
					</view>
				</view>
			</view>
			<!-- 浏览历史 -->
			<view class="history-section icon">
				<list-cell icon="icon-tuandui" iconColor="#5a8dee" title="个人资料" @eventClick="navTo('/pages/userinfo/userinfo')"></list-cell>
				<list-cell icon="icon-xiaoxi" iconColor="#ff6b6b" title="消息通知" :badge="unreadCount > 0 ? unreadCount : ''" @eventClick="navTo('/pages/notification/notification')"></list-cell>
				<list-cell icon="icon-dizhi" iconColor="#5fcda2" title="地址管理" @eventClick="navTo('/pages/address/address')"></list-cell>
				<list-cell icon="icon-lishijilu" iconColor="#e07472" title="我的足迹" @eventClick="navTo('/pages/user/readHistory')"></list-cell>
				<list-cell icon="icon-shoucang_xuanzhongzhuangtai" iconColor="#54b4ef" title="我的收藏" @eventClick="navTo('/pages/user/productCollection')"></list-cell>
				<list-cell icon="icon-jifen" iconColor="#ff9800" title="积分与成长值" @eventClick="navTo('/pages/points/points')"></list-cell>
				<list-cell icon="icon-pingjia" iconColor="#ee883b" title="我的评价" @eventClick="navTo('/pages/user/commentList')"></list-cell>
				<list-cell icon="icon-baoxiu" iconColor="#5fcda2" title="我的报修" @eventClick="navTo('/pages/repair/list')"></list-cell>
				<!-- 新增：我的退款入口 -->
				<list-cell 
					icon="icon-tuikuan" 
					iconColor="#fa436a" 
					title="我的退款" 
					@eventClick="navTo('/pages/user/refundList')"
				></list-cell>
				<list-cell icon="icon-kefu" iconColor="#667eea" title="联系客服" @eventClick="navTo('/pages/user/customerService')"></list-cell>
				<list-cell icon="icon-shezhi1" iconColor="#e07472" title="设置" border="" @eventClick="navTo('/pages/set/set')"></list-cell>
			</view>
		</view>
			
		
    </view>  
</template>  
<script>  
	import listCell from '@/components/mix-list-cell';
	import {
		fetchMemberCouponList
	} from '@/api/coupon.js';
	import {
		signIn,
		checkTodaySignIn,
		getContinuousSignInDays
	} from '@/api/signIn.js';
	import { getUnreadCount } from '@/api/notification.js';
		import { fetchActiveMembership, purchaseMembership, fetchMemberLevel } from '@/api/member.js';
    import {  
        mapState 
    } from 'vuex';  
	let startY = 0, moveY = 0, pageAtTop = true;
    export default {
		components: {
			listCell
		},
			data(){
			return {
				coverTransform: 'translateY(0px)',
				coverTransition: '0s',
				moving: false,
				couponCount:null,
				isSignedToday: false,
				isSigning: false,
				continuousDays: 0,
				unreadCount: 0,
				membership: null,
				userLevel: null,
				userGrowth: 0,
				nextLevelGrowth: 0
			}
		},
		computed: {
			...mapState(['hasLogin','userInfo']),
			// 计算用户等级
			calculatedLevel() {
				if (!this.userInfo || !this.userInfo.growth) {
					return 1;
				}
				const growth = this.userInfo.growth || 0;
				// 等级计算规则：1级到2级需要3000，2到3要5000，以此类推
				const thresholds = [0, 3000, 8000, 15000, 24000, 35000, 48000, 63000, 80000, 99000, 120000, 143000, 168000, 195000, 224000];
				for (let level = 15; level >= 1; level--) {
					if (growth >= thresholds[level]) {
						return level;
					}
				}
				return 1;
			}
		},
		onLoad(){
		},
		onShow(){
			if(this.hasLogin){
				fetchMemberCouponList(0).then(response=>{
					if(response.data!=null&&response.data.length>0){
						this.couponCount = response.data.length;
					}
				});
				// 检查今日签到状态
				this.checkSignInStatus();
				// 加载未读消息数量
				this.loadUnreadCount();
				// 会员信息
				this.loadMembership();
				// 加载用户等级信息
				this.loadUserLevel();
			}else{
				this.couponCount=null;
				this.isSignedToday = false;
				this.continuousDays = 0;
				this.unreadCount = 0;
				this.membership = null;
				this.pointHistory = [];
			}
		},
		// #ifndef MP
		onNavigationBarButtonTap(e) {
			const index = e.index;
			if (index === 0) {
				this.navTo('/pages/set/set');
			}else if(index === 1){
				// #ifdef APP-PLUS
				const pages = getCurrentPages();
				const page = pages[pages.length - 1];
				const currentWebview = page.$getAppWebview();
				currentWebview.hideTitleNViewButtonRedDot({
					index
				});
				// #endif
				uni.navigateTo({
					url: '/pages/notification/notification'
				})
			}
		},
		// #endif
        methods: {
			/**
			 * 统一跳转接口,拦截未登录路由
			 * navigator标签现在默认没有转场动画，所以用view
			 */
			navTo(url){
				if(!this.hasLogin){
					url = '/pages/public/login';
				}
				uni.navigateTo({  
					url
				})  
			}, 
			async loadMembership() {
				try {
					const res = await fetchActiveMembership();
					if (res && res.code === 200) {
						this.membership = res.data;
					}
				} catch (e) {
					console.error('加载会员信息失败', e);
				}
			},
			async loadUserLevel() {
				try {
					const res = await fetchMemberLevel();
					if (res && res.code === 200 && res.data) {
						this.userLevel = res.data.currentLevel || this.calculatedLevel;
						this.userGrowth = res.data.growth || (this.userInfo.growth || 0);
						this.nextLevelGrowth = res.data.growthRequired || 0;
					} else {
						// 如果接口失败，使用计算值
						this.userLevel = this.calculatedLevel;
						this.userGrowth = this.userInfo.growth || 0;
					}
				} catch (e) {
					console.error('加载用户等级失败', e);
					// 如果接口失败，使用计算值
					this.userLevel = this.calculatedLevel;
					this.userGrowth = this.userInfo.growth || 0;
				}
			},
			getMembershipName(levelType) {
				const map = {
					'MONTH': '月度会员',
					'QUARTER': '季度会员',
					'YEAR': '年度会员'
				}
				return map[levelType] || ''
			},
			getMembershipClass(levelType) {
				return `membership-${levelType.toLowerCase()}`
			},
			async handlePurchaseMembership() {
				if (!this.hasLogin) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					this.navTo('/pages/public/login');
					return;
				}
				const options = [
					{ name: '月卡 1.10x', value: 'MONTH', price: 38 },
					{ name: '季卡 1.70x', value: 'QUARTER', price: 98 },
					{ name: '年卡 2.00x', value: 'YEAR', price: 168 }
				];
				const names = options.map(o => `${o.name} · ¥${o.price}`);
				uni.showActionSheet({
					itemList: names,
					success: async (res) => {
						const idx = res.tapIndex;
						const level = options[idx];
						if (!level) return;
						// 简易支付确认弹窗；实际支付集成时可替换为支付收银台
						uni.showModal({
							title: '确认支付',
							content: `确定购买 ${level.name}（¥${level.price}）吗？`,
							confirmText: '立即支付',
							cancelText: '再想想',
							success: async (mRes) => {
								if (!mRes.confirm) return;
								try {
									const resp = await purchaseMembership(level.value);
									if (resp && resp.code === 200) {
										uni.showToast({ title: '开通成功', icon: 'success' });
										this.membership = resp.data;
										// 更新积分/会员信息
										this.loadMembership();
									} else {
										uni.showToast({ title: resp.message || '开通失败', icon: 'none' });
									}
								} catch (err) {
									console.error('购买会员失败', err);
									uni.showToast({ title: '开通失败', icon: 'none' });
								}
							}
						});
					}
				});
			},
	
			/**
			 *  会员卡下拉和回弹
			 *  1.关闭bounce避免ios端下拉冲突
			 *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
			 *    transition设置0.1秒延迟，让css来过渡这段空窗期
			 *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
			 */
			coverTouchstart(e){
				if(pageAtTop === false){
					return;
				}
				this.coverTransition = 'transform .1s linear';
				startY = e.touches[0].clientY;
			},
			coverTouchmove(e){
				moveY = e.touches[0].clientY;
				let moveDistance = moveY - startY;
				if(moveDistance < 0){
					this.moving = false;
					return;
				}
				this.moving = true;
				if(moveDistance >= 80 && moveDistance < 100){
					moveDistance = 80;
				}
		
				if(moveDistance > 0 && moveDistance <= 80){
					this.coverTransform = `translateY(${moveDistance}px)`;
				}
			},
			coverTouchend(){
				if(this.moving === false){
					return;
				}
				this.moving = false;
				this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
				this.coverTransform = 'translateY(0px)';
			},
			// 检查签到状态
			async checkSignInStatus() {
				if (!this.hasLogin) {
					return;
				}
				try {
					const response = await checkTodaySignIn();
					if (response.code === 200) {
						this.isSignedToday = response.data.isSigned || false;
					}
					// 获取连续签到天数
					const daysResponse = await getContinuousSignInDays();
					if (daysResponse.code === 200) {
						this.continuousDays = daysResponse.data.continuousDays || 0;
					}
				} catch (error) {
					console.error('检查签到状态失败:', error);
				}
			},
			// 加载未读消息数量
			async loadUnreadCount() {
				if (!this.hasLogin) {
					this.unreadCount = 0
					return
				}
				try {
					const res = await getUnreadCount()
					this.unreadCount = res.data || 0
					// 更新tabBar badge
					if (this.unreadCount > 0) {
						uni.setTabBarBadge({
							index: 3,
							text: this.unreadCount > 99 ? '99+' : String(this.unreadCount)
						})
					} else {
						uni.removeTabBarBadge({ index: 3 })
					}
				} catch (e) {
					console.error('加载未读消息数量失败:', e)
				}
			},
			// 处理签到
			async handleSignIn() {
				if (!this.hasLogin) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.navTo('/pages/public/login');
					return;
				}
				if (this.isSignedToday) {
					uni.showToast({
						title: '今日已签到',
						icon: 'none'
					});
					return;
				}
				if (this.isSigning) {
					return;
				}
				this.isSigning = true;
				try {
					const response = await signIn();
					if (response.code === 200) {
						this.isSignedToday = true;
						this.continuousDays = (this.continuousDays || 0) + 1;
						
						uni.showToast({
							title: response.data.message || '签到成功',
							icon: 'success',
							duration: 2000
						});
						
						// 先本地更新积分，避免等待网络刷新
						const totalIntegration = response.data && response.data.totalIntegration;
						const addedIntegration = response.data && response.data.integration;
						if (totalIntegration !== undefined) {
							this.$store.commit('updateUserInfo', {
								integration: totalIntegration
							});
						} else if (addedIntegration !== undefined) {
							this.$store.commit('updateUserInfo', {
								integration: (this.userInfo.integration || 0) + addedIntegration
							});
						}
						
						// 异步刷新用户信息（包括积分）
						try {
							await this.$store.dispatch('getUserInfo');
							// 重新检查签到状态和连续天数
							await this.checkSignInStatus();
						} catch (error) {
							console.error('刷新用户信息失败:', error);
							// 如果后端返回了积分，手动更新
							if (response.data && response.data.totalIntegration !== undefined) {
								this.$store.commit('updateUserInfo', {
									integration: response.data.totalIntegration
								});
							}
						}
					} else {
						uni.showToast({
							title: response.message || '签到失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('签到失败:', error);
					uni.showToast({
						title: error.message || '签到失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.isSigning = false;
				}
			},
			fmtDate(val) {
				if (!val) return '--';
				return String(val).substring(0, 10);
			}
        }  
    }  
</script>  
<style lang='scss'>
	%flex-center {
	 display:flex;
	 flex-direction: column;
	 justify-content: center;
	 align-items: center;
	}
	%section {
	  display:flex;
	  justify-content: space-around;
	  align-content: center;
	  background: #fff;
	  border-radius: 10upx;
	}
	.user-section{
		height: 520upx;
		padding: 100upx 30upx 0;
		position:relative;
		overflow: hidden;
	}
	
	.user-bg-gradient {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
		opacity: 0.95;
	}
	
	.user-info-box{
		height: 180upx;
		display:flex;
		align-items:center;
		position:relative;
		z-index: 1;
		margin-bottom: 30upx;
		
		.portrait-wrapper {
			position: relative;
			padding: 6upx;
			background: rgba(255, 255, 255, 0.3);
			border-radius: 50%;
			backdrop-filter: blur(10upx);
		}
		
		.portrait{
			width: 130upx;
			height: 130upx;
			border: 4upx solid #fff;
			border-radius: 50%;
			display: block;
		}
		
		.portrait-border {
			position: absolute;
			top: 0;
			left: 0;
			width: 142upx;
			height: 142upx;
			border: 2upx solid rgba(255, 255, 255, 0.5);
			border-radius: 50%;
		}
		
		.info-box {
			margin-left: 30upx;
			display: flex;
			flex-direction: column;
		}
		
		.username-row {
		display: flex;
		align-items: center;
		gap: 12upx;
	}
	.level-badge {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 20upx;
		padding: 4upx 12upx;
		border-radius: 8upx;
		font-weight: 600;
	}
	.membership-badge {
		display: inline-block;
		padding: 4upx 12upx;
		border-radius: 8upx;
		font-size: 20upx;
		color: #ffffff;
		font-weight: 600;
	}
	.membership-badge.membership-month {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}
	.membership-badge.membership-quarter {
		background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
	}
	.membership-badge.membership-year {
		background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
	}
	.username{
			font-size: 36upx;
			font-weight: 600;
			color: #ffffff;
			margin-bottom: 8upx;
		}
		
		.user-desc {
			font-size: 24upx;
			color: rgba(255, 255, 255, 0.8);
		}
	}
	
	.vip-card-box{
		display:flex;
		flex-direction: column;
		height: 240upx;
		border-radius: 20upx;
		overflow: hidden;
		position: relative;
		box-shadow: 0 8upx 24upx rgba(0, 0, 0, 0.15);
	}
	
	.vip-card-gradient {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
	}
	
	.vip-card-content {
		position: relative;
		z-index: 1;
		padding: 30upx;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.vip-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.vip-badge {
		display: flex;
		align-items: center;
	}
	
	.vip-icon {
		font-size: 40upx;
		margin-right: 12upx;
	}
	
	.vip-title {
		font-size: 32upx;
		font-weight: 600;
		color: #ffffff;
	}
	
	.b-btn{
		width: 140upx;
		height: 48upx;
		text-align: center;
		line-height: 48upx;
		font-size: 24upx;
		font-weight: 500;
		color: #f6d365;
		border-radius: 24upx;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.1);
	}
	
	.e-m{
		font-size: 24upx;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}
	
	.e-b{
		font-size: 22upx;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 8upx;
	}
	.cover-container{
		background: $page-color-base;
		margin-top: -150upx;
		padding: 0 30upx;
		position:relative;
		background: #f5f5f5;
		padding-bottom: 20upx;
		.arc{
			position:absolute;
			left: 0;
			top: -34upx;
			width: 100%;
			height: 36upx;
		}
	}
	.stats-section {
		margin-top: 20upx;
	}
	
	.stats-card {
		display: flex;
		align-items: center;
		background: #ffffff;
		border-radius: 20upx;
		padding: 40upx 0;
		box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);
	}
	
	.stats-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.stats-icon-wrapper {
		width: 80upx;
		height: 80upx;
		border-radius: 20upx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16upx;
		
		&.coupon {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		
		&.points {
			background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		}
		
		&.growth {
			background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		}
		
		&.level {
			background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
		}
	}
	
	.stats-icon {
		font-size: 40upx;
		&.yticon {
			font-size: 44upx;
			color: #ffffff;
		}
	}
	
	.stats-num {
		font-size: 36upx;
		font-weight: 600;
		color: $font-color-dark;
		margin-bottom: 8upx;
	}
	
	.stats-label {
		font-size: 24upx;
		color: $font-color-light;
	}
	
	.stats-divider {
		width: 1upx;
		height: 60upx;
		background: #f0f0f0;
	}
	.order-section{
		background: #ffffff;
		border-radius: 20upx;
		padding: 30upx;
		margin-top: 20upx;
		box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);
	}
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30upx;
	}
	
	.order-title {
		font-size: 32upx;
		font-weight: 600;
		color: $font-color-dark;
	}
	
	.order-more {
		font-size: 24upx;
		color: $font-color-light;
	}
	
	.order-grid {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
	
	.order-item{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
	}
	
	.order-icon-wrapper {
		width: 88upx;
		height: 88upx;
		border-radius: 20upx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16upx;
		
		&.all {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		
		&.payment {
			background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		}
		
		&.receive {
			background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		}
		
		&.refund {
			background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
		}
	}
	
	.order-icon {
		font-size: 44upx;
	}
	
	.order-text {
		font-size: 24upx;
		color: $font-color-dark;
	}
	
	.order-item-hover {
		opacity: 0.7;
	}
	.history-section{
		padding: 0;
		margin-top: 20upx;
		background: #fff;
		border-radius: 20upx;
		overflow: hidden;
		box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.08);
		.sec-header{
			display:flex;
			align-items: center;
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 40upx;
			margin-left: 30upx;
			.yticon{
				font-size: 44upx;
				color: #5eba8f;
				margin-right: 16upx;
				line-height: 40upx;
			}
		}
		.h-list{
			white-space: nowrap;
			padding: 30upx 30upx 0;
			image{
				display:inline-block;
				width: 160upx;
				height: 160upx;
				margin-right: 20upx;
				border-radius: 10upx;
			}
		}
	}
	
	/* 新增：适配退款图标样式（若图标大小不一致可调整） */
	.icon-tuikuan {
		font-size: 44upx;
	}
	
	/* 签到区域样式 */
	.sign-in-section {
		margin-top: 20upx;
	}
	
	.sign-in-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20upx;
		padding: 40upx;
		box-shadow: 0 8upx 24upx rgba(102, 126, 234, 0.3);
		position: relative;
		overflow: hidden;
	}
	
	.sign-in-card::before {
		content: '';
		position: absolute;
		right: -50upx;
		top: -50upx;
		width: 200upx;
		height: 200upx;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
	}
	
	.sign-in-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30upx;
		position: relative;
		z-index: 1;
	}
	
	.sign-in-title-wrapper {
		display: flex;
		align-items: center;
	}
	
	.sign-in-icon {
		font-size: 48upx;
		margin-right: 20upx;
	}
	
	.sign-in-title {
		font-size: 36upx;
		font-weight: 600;
		color: #ffffff;
		display: block;
		margin-bottom: 8upx;
	}
	
	.sign-in-desc {
		font-size: 24upx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
	}
	
	.continuous-days-badge {
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(10upx);
		padding: 8upx 20upx;
		border-radius: 30upx;
		border: 1upx solid rgba(255, 255, 255, 0.3);
	}
	
	.continuous-days-text {
		font-size: 24upx;
		color: #ffffff;
		font-weight: 500;
	}
	
	.sign-in-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		z-index: 1;
	}
	
	.sign-in-status {
		flex: 1;
	}
	
	.sign-in-tip {
		font-size: 26upx;
		color: rgba(255, 255, 255, 0.95);
		font-weight: 500;
	}
	
	.sign-in-btn {
		background: #ffffff;
		color: #667eea;
		border: none;
		border-radius: 50upx;
		padding: 20upx 50upx;
		font-size: 28upx;
		font-weight: 600;
		box-shadow: 0 4upx 12upx rgba(0, 0, 0, 0.15);
		transition: all 0.3s;
	}
	
	.sign-in-btn:active {
		transform: scale(0.95);
	}
	
	.sign-in-btn.signed {
		background: rgba(255, 255, 255, 0.3);
		color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10upx);
	}
	
	.sign-in-btn.disabled {
		opacity: 0.6;
	}

	/* 会员与积分流水 */
	.membership-card {
		background: #fff;
		border-radius: 20upx;
		margin-top: 20upx;
		padding: 24upx;
		box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.06);
	}
	.membership-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16upx;
	}
	.membership-title {
		font-size: 32upx;
		font-weight: 600;
		color: $font-color-dark;
	}
	.membership-sub {
		display: block;
		font-size: 24upx;
		color: $font-color-light;
		margin-top: 6upx;
	}
	.membership-body {
		display: flex;
		justify-content: space-between;
		margin-top: 8upx;
	}
	.membership-item {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.membership-item .label {
		font-size: 24upx;
		color: $font-color-light;
	}
	.membership-item .value {
		font-size: 28upx;
		color: $font-color-dark;
		margin-top: 6upx;
	}
	.purchase-btn {
		line-height: 1;
		padding: 10upx 20upx;
		border-radius: 12upx;
	}
	.points-history {
		margin-top: 20upx;
	}
	.ph-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 10upx;
	}
	.ph-list {
		background: #f8f9fb;
		border-radius: 12upx;
		padding: 12upx;
	}
	.ph-item {
		display: flex;
		justify-content: space-between;
		padding: 12upx 6upx;
		border-bottom: 1upx solid #eceff4;
	}
	.ph-item:last-child {
		border-bottom: none;
	}
	.ph-left {
		display: flex;
		flex-direction: column;
	}
	.ph-type {
		font-size: 26upx;
		color: $font-color-dark;
	}
	.ph-note {
		font-size: 22upx;
		color: $font-color-light;
		margin-top: 4upx;
	}
	.ph-right {
		font-size: 28upx;
		font-weight: 600;
	}
	.ph-right.inc {
		color: #16c79a;
	}
	.ph-right.dec {
		color: #f94c66;
	}
</style>
