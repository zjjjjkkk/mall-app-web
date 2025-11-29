<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">REGISTER</view>
			<view class="welcome">
				欢迎注册！
			</view>
			<view class="input-content">
				<!-- 用户名 -->
				<view class="input-item">
					<text class="tit">用户名</text>
					<input 
						type="text" 
						v-model="form.username" 
						placeholder="请输入用户名" 
						maxlength="64"
						@input="clearError('username')"
					/>
					<text class="error-tips" v-if="errors.username">{{ errors.username }}</text>
				</view>
				
				<!-- 手机号 -->
				<view class="input-item">
					<text class="tit">手机号</text>
					<input 
						type="number" 
						v-model="form.phone" 
						placeholder="请输入手机号" 
						maxlength="11"
						@input="clearError('phone')"
					/>
					<text class="error-tips" v-if="errors.phone">{{ errors.phone }}</text>
				</view>
				
				<!-- 密码 -->
				<view class="input-item">
					<text class="tit">设置密码</text>
					<input 
						type="text" 
						v-model="form.password" 
						placeholder="8-18位不含特殊字符的数字、字母组合" 
						placeholder-class="input-empty" 
						maxlength="64"
						password
						@input="clearError('password')"
					/>
					<text class="error-tips" v-if="errors.password">{{ errors.password }}</text>
				</view>
				
				<!-- 确认密码 -->
				<view class="input-item">
					<text class="tit">确认密码</text>
					<input 
						type="text" 
						v-model="form.confirmPwd" 
						placeholder="请再次输入密码" 
						placeholder-class="input-empty" 
						maxlength="64"
						password
						@confirm="toRegister"
						@input="clearError('confirmPwd')"
					/>
					<text class="error-tips" v-if="errors.confirmPwd">{{ errors.confirmPwd }}</text>
				</view>
			</view>
			
			<button class="confirm-btn" @click="toRegister" :disabled="registering">注册</button>
		</view>
	</view>
</template>

<script>
	import {
		memberRegister
	} from '@/api/member.js';
export default {
	data() {
		return {
			// 注册表单（匹配ums_member表字段，移除验证码）
			form: {
				username: '',    // 用户名（唯一）
				phone: '',       // 手机号（唯一）
				password: '',    // 密码
				confirmPwd: ''   // 确认密码
			},
			
			// 状态控制
			registering: false,    // 注册请求中
			
			// 错误提示
			errors: {
				username: '',
				phone: '',
				password: '',
				confirmPwd: ''
			}
		};
	},
	methods: {
		// 返回上一页
		navBack() {
			uni.navigateBack({
				delta: 1
			});
		},
		
		// 清空指定字段错误提示
		clearError(field) {
			this.errors[field] = '';
		},
		
		// 表单验证（匹配数据库字段规则，移除验证码校验）
		validateForm() {
			let isValid = true;
			
			// 用户名验证
			if (!this.form.username) {
				this.errors.username = '请输入用户名';
				isValid = false;
			}
			
			// 手机号验证
			if (!this.form.phone) {
				this.errors.phone = '请输入手机号';
				isValid = false;
			} else if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
				this.errors.phone = '请输入正确的手机号';
				isValid = false;
			}
			
			// 密码验证（匹配表中password字段规则）
			if (!this.form.password) {
				this.errors.password = '请设置密码';
				isValid = false;
			} else if (!/^[0-9a-zA-Z]{8,18}$/.test(this.form.password)) {
				this.errors.password = '密码需为8-18位数字、字母组合';
				isValid = false;
			}
			
			// 确认密码验证
			if (!this.form.confirmPwd) {
				this.errors.confirmPwd = '请再次输入密码';
				isValid = false;
			} else if (this.form.confirmPwd !== this.form.password) {
				this.errors.confirmPwd = '两次输入的密码不一致';
				isValid = false;
			}
			
			return isValid;
		},
		
		// 提交注册（对接后端接口，无验证码逻辑）
		async toRegister() {
			// 1. 表单前置验证
			if (!this.validateForm()) return;
			
			// 2. 防止重复提交
			if (this.registering) return;
			this.registering = true;
			
			try {
				// 3. 调用注册接口（参数匹配ums_member表，移除验证码）
				// const res = await uni.request({
				// 	url: '/api/member/register', // 后端注册接口
				// 	method: 'POST',
				// 	data: {
				// 		username: this.form.username,  // 用户名
				// 		phone: this.form.phone,        // 手机号
				// 		password: this.form.password   // 密码（后端需加密存储）
					
				// 	}
				// });
				memberRegister({
					username: this.form.username,
					phone: this.form.phone,
					password: this.form.password
				}).then(res=>{
					// 4. 处理注册结果
					if (res.code == 200) {
						uni.showToast({
							title: '注册成功',
							icon: 'success'
						});
						uni.navigateTo({url:'/pages/public/login'});
					
					} else {
						// 后端返回的错误（如用户名已存在、手机号已注册）
						throw new Error(res.data.msg || '注册失败');
					}
				})
			
			} catch (err) {
				uni.showToast({
					title: err.message,
					icon: 'none'
				});
				this.registering = false; // 恢复按钮
			}
		}
	}
};
</script>

<style scoped>
/* 基础样式（和登录页保持一致，移除验证码相关样式） */
.container {
	position: relative;
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	padding: 40rpx 30rpx;
}

.left-bottom-sign,
.right-top-sign {
	position: absolute;
	width: 120rpx;
	height: 120rpx;
}

.left-bottom-sign {
	left: 0;
	bottom: 0;
}

.right-top-sign {
	right: 0;
	top: 0;
}

.back-btn {
	position: absolute;
	top: 40rpx;
	left: 30rpx;
	font-size: 36rpx;
	color: #333;
}

.wrapper {
	width: 100%;
	height: 100%;
	background: #fff;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	box-sizing: border-box;
}

.left-top-sign {
	font-size: 28rpx;
	color: #999;
	letter-spacing: 4rpx;
	margin-bottom: 40rpx;
}

.welcome {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 60rpx;
}

.input-content {
	margin-bottom: 60rpx;
}

.input-item {
	display: flex;
	flex-direction: column;
	margin-bottom: 40rpx;
}

.input-item .tit {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 16rpx;
}

.input-item input {
	height: 80rpx;
	line-height: 80rpx;
	font-size: 30rpx;
	color: #333;
	border-bottom: 1rpx solid #eee;
	padding: 0 10rpx;
	box-sizing: border-box;
}

.input-empty {
	color: #ccc;
}

/* 错误提示 */
.error-tips {
	font-size: 24rpx;
	color: #ff3b30;
	margin-top: 10rpx;
}

/* 注册按钮 */
.confirm-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: #ff0000;
	color: #fff;
	border-radius: 45rpx;
	font-size: 32rpx;
	border: none;
}

.confirm-btn:disabled {
	background: #ccc;
	color: #fff;
}
</style>