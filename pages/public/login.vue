<template>
	<view class="login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- 返回按钮 -->
		<view class="back-btn" @click="navBack">
			<text class="back-icon">‹</text>
		</view>

		<!-- 主要内容区域 -->
		<view class="content-wrapper">
			<!-- Logo和标题区域 -->
			<view class="header-section">
				<view class="logo-wrapper">
					<text class="logo-text">Mall</text>
				</view>
				<view class="title">欢迎回来</view>
				<view class="subtitle">登录您的账户以继续</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- 用户名输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.username }">
					<view class="input-icon">
						<text class="icon-text">👤</text>
					</view>
					<input 
						class="input-field"
						type="text" 
						v-model="form.username" 
						placeholder="请输入用户名" 
						placeholder-class="input-placeholder"
						maxlength="64"
						@input="clearError('username')"
						@focus="handleInputFocus('username')"
						@blur="handleInputBlur('username')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'username' }"></view>
				</view>
				<view class="error-message" v-if="errors.username">{{ errors.username }}</view>

				<!-- 密码输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.password }">
					<view class="input-icon">
						<text class="icon-text">🔒</text>
					</view>
					<input 
						class="input-field"
						type="text" 
						v-model="form.password" 
						placeholder="请输入密码" 
						placeholder-class="input-placeholder"
						maxlength="20"
						password
						@confirm="toLogin"
						@input="clearError('password')"
						@focus="handleInputFocus('password')"
						@blur="handleInputBlur('password')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'password' }"></view>
				</view>
				<view class="error-message" v-if="errors.password">{{ errors.password }}</view>

				<!-- 记住密码和忘记密码 -->
				<view class="form-options">
					<view class="remember-me" @click="toggleRemember">
						<view class="checkbox" :class="{ 'checked': rememberMe }">
							<text class="check-icon" v-if="rememberMe">✓</text>
						</view>
						<text class="option-text">记住密码</text>
					</view>
					<view class="forget-pwd" @click="handleForgetPassword">
						<text>忘记密码？</text>
					</view>
				</view>

				<!-- 登录按钮 -->
				<button 
					class="login-btn" 
					:class="{ 'loading': logining }"
					@click="toLogin" 
					:disabled="logining"
				>
					<text v-if="!logining">登录</text>
					<text v-else>登录中...</text>
				</button>

				<!-- 快速登录（可选） -->
				<view class="quick-login-section">
					<view class="divider">
						<view class="divider-line"></view>
						<text class="divider-text">或</text>
						<view class="divider-line"></view>
					</view>
					<!-- 可以在这里添加第三方登录按钮 -->
				</view>
			</view>

			<!-- 注册链接 -->
			<view class="register-link">
				<text class="link-text">还没有账号？</text>
				<text class="link-btn" @click="toRegist">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	import {
		memberLogin, memberInfo
	} from '@/api/member.js';
	
	export default {
		data() {
			return {
				form: {
					username: '',
					password: ''
				},
				logining: false,
				rememberMe: false,
				focusedField: '',
				fromRegister: false,
				errors: {
					username: '',
					password: ''
				}
			}
		},
		onLoad(options) {
			// 从本地存储读取记住的账号密码
			const savedUsername = uni.getStorageSync('saved_username') || '';
			const savedPassword = uni.getStorageSync('saved_password') || '';
			const rememberMe = uni.getStorageSync('remember_me') || false;
			
			if (rememberMe && savedUsername) {
				this.form.username = savedUsername;
				this.form.password = savedPassword;
				this.rememberMe = true;
			} else {
				// 只读取用户名，不读取密码
				this.form.username = uni.getStorageSync('username') || '';
			}
			
			// 如果是从注册页跳转过来的，标记来源
			if (options && options.from === 'register') {
				this.fromRegister = true;
			}
		},
		methods: {
			...mapMutations(['login']),
			
			// 返回上一页
			navBack() {
				uni.navigateBack();
			},
			
			// 跳转到注册页面
			toRegist() {
				uni.navigateTo({
					url: '/pages/public/register'
				});
			},
			
			// 输入框聚焦
			handleInputFocus(field) {
				this.focusedField = field;
				this.clearError(field);
			},
			
			// 输入框失焦
			handleInputBlur(field) {
				this.focusedField = '';
			},
			
			// 清空指定字段错误提示
			clearError(field) {
				this.errors[field] = '';
			},
			
			// 切换记住密码
			toggleRemember() {
				this.rememberMe = !this.rememberMe;
			},
			
			// 忘记密码
			handleForgetPassword() {
				uni.showToast({
					title: '请联系客服重置密码',
					icon: 'none'
				});
			},
			
			// 处理登录成功后的跳转
			handleLoginSuccess() {
				const pages = getCurrentPages();
				// 如果是从注册页跳转过来的，或者上一页是注册页/登录页，则跳转到用户中心
				if (this.fromRegister || (pages.length > 1 && pages[pages.length - 2].route === 'pages/public/register')) {
					uni.switchTab({
						url: '/pages/user/user',
						fail: () => {
							// 如果switchTab失败（可能不在tabBar页面），使用reLaunch
							uni.reLaunch({
								url: '/pages/user/user'
							});
						}
					});
				} else if (pages.length > 1) {
					// 有上一页且不是注册页，返回上一页
					uni.navigateBack({
						delta: 1,
						fail: () => {
							// 如果返回失败，跳转到用户中心
							uni.switchTab({
								url: '/pages/user/user'
							});
						}
					});
				} else {
					// 没有上一页，直接跳转到用户中心
					uni.switchTab({
						url: '/pages/user/user',
						fail: () => {
							uni.reLaunch({
								url: '/pages/user/user'
							});
						}
					});
				}
			},
			
			// 表单验证
			validateForm() {
				let isValid = true;
				
				// 用户名验证
				if (!this.form.username.trim()) {
					this.errors.username = '请输入用户名';
					isValid = false;
				}
				
				// 密码验证
				if (!this.form.password) {
					this.errors.password = '请输入密码';
					isValid = false;
				} else if (!/^[0-9a-zA-Z]{8,18}$/.test(this.form.password)) {
					this.errors.password = '密码需为8-18位数字、字母组合';
					isValid = false;
				}
				
				return isValid;
			},
			
			// 登录
			async toLogin() {
				// 表单验证
				if (!this.validateForm()) return;
				
				// 防止重复提交
				if (this.logining) return;
				
				try {
					this.logining = true;
					uni.showLoading({ title: '登录中...', mask: true });
					
					// 调用登录接口
					const loginResponse = await memberLogin({
						username: this.form.username,
						password: this.form.password
					});
					
					// 处理登录结果
					if (loginResponse.code === 200) {
						// 保存token
						let token = loginResponse.data.tokenHead + loginResponse.data.token;
						uni.setStorageSync('token', token);
						uni.setStorageSync('username', this.form.username);
						
						// 记住密码处理
						if (this.rememberMe) {
							uni.setStorageSync('saved_username', this.form.username);
							uni.setStorageSync('saved_password', this.form.password);
							uni.setStorageSync('remember_me', true);
						} else {
							uni.removeStorageSync('saved_username');
							uni.removeStorageSync('saved_password');
							uni.removeStorageSync('remember_me');
						}
						
						// 获取用户信息
						const userInfoResponse = await memberInfo();
						if (userInfoResponse.code === 200) {
							// 更新Vuex状态
							this.login(userInfoResponse.data);
							// 再次从后端刷新用户信息，确保积分等实时数据
							try {
								await this.$store.dispatch('getUserInfo');
							} catch (err) {
								console.error('登录后刷新用户信息失败:', err);
							}
							
							uni.hideLoading();
							uni.showToast({ 
								title: '登录成功', 
								icon: 'success',
								duration: 1500
							});
							
							// 延迟跳转，让用户看到成功提示
							setTimeout(() => {
								this.handleLoginSuccess();
							}, 1500);
						} else {
							uni.hideLoading();
							uni.showToast({ 
								title: userInfoResponse.data?.msg || '获取用户信息失败', 
								icon: 'none' 
							});
						}
					} else {
						uni.hideLoading();
						const errorMsg = loginResponse.data?.msg || loginResponse.message || '登录失败';
						uni.showToast({ 
							title: errorMsg, 
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('登录失败:', error);
					uni.showToast({ 
						title: '网络错误，请稍后重试', 
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.logining = false;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		overflow: hidden;
	}

	// 背景装饰
	.bg-decoration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 0;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		animation: float 20s infinite ease-in-out;
	}

	.circle-1 {
		width: 300px;
		height: 300px;
		top: -100px;
		right: -100px;
		animation-delay: 0s;
	}

	.circle-2 {
		width: 200px;
		height: 200px;
		bottom: -50px;
		left: -50px;
		animation-delay: 5s;
	}

	.circle-3 {
		width: 150px;
		height: 150px;
		top: 50%;
		left: 10%;
		animation-delay: 10s;
	}

	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) rotate(0deg);
		}
		33% {
			transform: translate(30px, -30px) rotate(120deg);
		}
		66% {
			transform: translate(-20px, 20px) rotate(240deg);
		}
	}

	// 返回按钮
	.back-btn {
		position: absolute;
		top: calc(var(--status-bar-height) + 20rpx);
		left: 30rpx;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		backdrop-filter: blur(10px);
		z-index: 100;
		
		.back-icon {
			font-size: 60rpx;
			color: #fff;
			line-height: 1;
			font-weight: 300;
		}
	}

	// 主要内容区域
	.content-wrapper {
		position: relative;
		z-index: 10;
		padding: 120rpx 60rpx 60rpx;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	// 头部区域
	.header-section {
		text-align: center;
		margin-bottom: 80rpx;
	}

	.logo-wrapper {
		margin-bottom: 40rpx;
	}

	.logo-text {
		font-size: 80rpx;
		font-weight: bold;
		color: #fff;
		letter-spacing: 4rpx;
		text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
	}

	.title {
		font-size: 56rpx;
		font-weight: 600;
		color: #fff;
		margin-bottom: 20rpx;
	}

	.subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	// 表单区域
	.form-section {
		flex: 1;
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		padding: 60rpx 50rpx;
		margin-top: 60rpx;
		box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
	}

	// 输入框样式
	.input-wrapper {
		position: relative;
		margin-bottom: 50rpx;
		padding-bottom: 20rpx;
		
		&.error {
			.input-line {
				background: #ff3b30;
			}
		}
	}

	.input-icon {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		
		.icon-text {
			font-size: 36rpx;
		}
	}

	.input-field {
		width: 100%;
		height: 80rpx;
		padding-left: 80rpx;
		padding-right: 20rpx;
		font-size: 32rpx;
		color: #333;
		background: transparent;
		border: none;
		outline: none;
	}

	.input-placeholder {
		color: #999;
	}

	.input-line {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2rpx;
		background: #e5e5e5;
		transition: all 0.3s ease;
		
		&.active {
			background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
			height: 3rpx;
		}
	}

	.error-message {
		font-size: 24rpx;
		color: #ff3b30;
		margin-top: -40rpx;
		margin-bottom: 20rpx;
		padding-left: 80rpx;
	}

	// 表单选项
	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.remember-me {
		display: flex;
		align-items: center;
		
		.checkbox {
			width: 36rpx;
			height: 36rpx;
			border: 2rpx solid #ddd;
			border-radius: 6rpx;
			margin-right: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			
			&.checked {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-color: #667eea;
				
				.check-icon {
					color: #fff;
					font-size: 24rpx;
					font-weight: bold;
				}
			}
		}
		
		.option-text {
			font-size: 28rpx;
			color: #666;
		}
	}

	.forget-pwd {
		font-size: 28rpx;
		color: #667eea;
	}

	// 登录按钮
	.login-btn {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 48rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
		transition: all 0.3s ease;
		margin-bottom: 40rpx;
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
		}
		
		&.loading {
			opacity: 0.7;
		}
		
		&:disabled {
			opacity: 0.6;
		}
	}

	// 快速登录
	.quick-login-section {
		margin: 40rpx 0;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 40rpx 0;
	}

	.divider-line {
		flex: 1;
		height: 1rpx;
		background: #e5e5e5;
	}

	.divider-text {
		margin: 0 30rpx;
		font-size: 24rpx;
		color: #999;
	}

	// 注册链接
	.register-link {
		text-align: center;
		margin-top: 40rpx;
		padding: 40rpx 0;
		
		.link-text {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.8);
		}
		
		.link-btn {
			font-size: 28rpx;
			color: #fff;
			font-weight: 600;
			margin-left: 10rpx;
			text-decoration: underline;
		}
	}
</style>
