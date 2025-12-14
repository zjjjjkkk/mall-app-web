<script>
/**
 * vuex管理登陆状态，具体可以参考官方登陆模板示例
 */
import { mapMutations } from 'vuex'
import store from '@/store/index.js'
import { logTokenInfo, checkTokenFormat, getTokenInfo } from '@/utils/checkToken'

export default {
	methods: {
		...mapMutations(['login'])
	},
	onLaunch: function () {
		let userInfo = uni.getStorageSync('userInfo') || ''
		let token = uni.getStorageSync('token') || ''
		if (userInfo.id && token) {
			// 如果有token，先恢复登录状态，然后刷新用户信息
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.login(res.data)
					// 刷新用户信息，确保积分等数据是最新的
					store.dispatch('getUserInfo').catch(err => {
						console.error('启动时刷新用户信息失败:', err)
					})
				}
			})
		}
		
		// 在全局作用域添加 token 检查方法（仅用于调试）
		// #ifdef H5
		if (typeof window !== 'undefined') {
			window.checkToken = () => {
				console.log('🔍 Token 检查工具')
				console.log('====================')
				logTokenInfo()
				console.log('====================')
				console.log('💡 提示: 如果 token 不存在，请先登录')
				return getTokenInfo()
			}
			
			window.getToken = () => {
				const token = uni.getStorageSync('token')
				if (token) {
					console.log('Token:', token.substring(0, 50) + '...')
					return token
				} else {
					console.log('❌ 未找到 token')
					return null
				}
			}
			
			console.log('✅ Token 检查工具已加载')
			console.log('💡 在控制台输入 checkToken() 检查 token 状态')
			console.log('💡 在控制台输入 getToken() 获取完整 token')
		}
		// #endif
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
}
</script>

<style lang='scss'>
/*
		全局公共样式和字体图标
	*/
@font-face {
	font-family: yticon;
	font-weight: normal;
	font-style: normal;
	src: url('https://at.alicdn.com/t/font_1078604_w4kpxh0rafi.ttf') format('truetype');
}

.yticon {
	font-family: "yticon" !important;
	font-size: 16px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-yiguoqi1:before {
	content: "\e700";
}

.icon-iconfontshanchu1:before {
	content: "\e619";
}

.icon-iconfontweixin:before {
	content: "\e611";
}

.icon-alipay:before {
	content: "\e636";
}

.icon-shang:before {
	content: "\e624";
}

.icon-shouye:before {
	content: "\e626";
}

.icon-shanchu4:before {
	content: "\e622";
}

.icon-xiaoxi:before {
	content: "\e618";
}

.icon-jiantour-copy:before {
	content: "\e600";
}

.icon-fenxiang2:before {
	content: "\e61e";
}

.icon-pingjia:before {
	content: "\e67b";
}

.icon-daifukuan:before {
	content: "\e68f";
}

.icon-pinglun-copy:before {
	content: "\e612";
}

.icon-dianhua-copy:before {
	content: "\e621";
}

.icon-shoucang:before {
	content: "\e645";
}

.icon-xuanzhong2:before {
	content: "\e62f";
}

.icon-gouwuche_:before {
	content: "\e630";
}

.icon-icon-test:before {
	content: "\e60c";
}

.icon-icon-test1:before {
	content: "\e632";
}

.icon-bianji:before {
	content: "\e646";
}

.icon-jiazailoading-A:before {
	content: "\e8fc";
}

.icon-zuoshang:before {
	content: "\e613";
}

.icon-jia2:before {
	content: "\e60a";
}

.icon-huifu:before {
	content: "\e68b";
}

.icon-sousuo:before {
	content: "\e7ce";
}

.icon-arrow-fine-up:before {
	content: "\e601";
}

.icon-hot:before {
	content: "\e60e";
}

.icon-lishijilu:before {
	content: "\e6b9";
}

.icon-zhengxinchaxun-zhifubaoceping-:before {
	content: "\e616";
}

.icon-naozhong:before {
	content: "\e64a";
}

.icon-xiatubiao--copy:before {
	content: "\e608";
}

.icon-shoucang_xuanzhongzhuangtai:before {
	content: "\e6a9";
}

.icon-jia1:before {
	content: "\e61c";
}

.icon-bangzhu1:before {
	content: "\e63d";
}

.icon-arrow-left-bottom:before {
	content: "\e602";
}

.icon-arrow-right-bottom:before {
	content: "\e603";
}

.icon-arrow-left-top:before {
	content: "\e604";
}

.icon-icon--:before {
	content: "\e744";
}

.icon-zuojiantou-up:before {
	content: "\e605";
}

.icon-xia:before {
	content: "\e62d";
}

.icon--jianhao:before {
	content: "\e60b";
}

.icon-weixinzhifu:before {
	content: "\e61a";
}

.icon-comment:before {
	content: "\e64f";
}

.icon-weixin:before {
	content: "\e61f";
}

.icon-fenlei1:before {
	content: "\e620";
}

.icon-erjiye-yucunkuan:before {
	content: "\e623";
}

.icon-Group-:before {
	content: "\e688";
}

.icon-you:before {
	content: "\e606";
}

.icon-forward:before {
	content: "\e607";
}

.icon-tuijian:before {
	content: "\e610";
}

.icon-bangzhu:before {
	content: "\e679";
}

.icon-share:before {
	content: "\e656";
}

.icon-yiguoqi:before {
	content: "\e997";
}

.icon-shezhi1:before {
	content: "\e61d";
}

.icon-fork:before {
	content: "\e61b";
}

.icon-kafei:before {
	content: "\e66a";
}

.icon-iLinkapp-:before {
	content: "\e654";
}

.icon-saomiao:before {
	content: "\e60d";
}

.icon-shezhi:before {
	content: "\e60f";
}

.icon-shouhoutuikuan:before {
	content: "\e631";
}

/* 退款图标 - 可以根据需要更换content值 */
.icon-tuikuan:before {
	content: "\e61b";
	/* 更换为叉号图标，可以根据需要修改Unicode字符 */
}

.icon-gouwuche:before {
	content: "\e609";
}

.icon-dizhi:before {
	content: "\e614";
}

.icon-fenlei:before {
	content: "\e706";
}

.icon-xingxing:before {
	content: "\e70b";
}

.icon-tuandui:before {
	content: "\e633";
}

.icon-zuanshi:before {
	content: "\e615";
}

/* 积分图标 */
.icon-jifen:before {
	content: "\e70b"; /* 使用星星图标，表示积分 */
}

/* 成长值图标 */
.icon-chengzhang:before {
	content: "\e615"; /* 使用钻石图标，表示成长值 */
}

.icon-zuo:before {
	content: "\e63c";
}

.icon-shoucang2:before {
	content: "\e62e";
}

.icon-shouhuodizhi:before {
	content: "\e712";
}

.icon-yishouhuo:before {
	content: "\e71a";
}

.icon-dianzan-ash:before {
	content: "\e617";
}

/* 报修图标 - 使用工具/维修相关图标 */
.icon-baoxiu:before {
	content: "\e679"; /* 使用帮助图标，表示报修/维修服务 */
}

/* 客服图标 - 使用消息/客服相关图标 */
.icon-kefu:before {
	content: "\e618"; /* 使用消息图标，表示客服沟通 */
}





view,
scroll-view,
swiper,
swiper-item,
cover-view,
cover-image,
icon,
text,
rich-text,
progress,
button,
checkbox,
form,
input,
label,
radio,
slider,
switch,
textarea,
navigator,
audio,
camera,
image,
video {
	box-sizing: border-box;
}

/* 骨架屏替代方案 */
.Skeleton {
	background: #f3f3f3;
	padding: 20upx 0;
	border-radius: 8upx;
}

/* 图片载入替代方案 */
.image-wrapper {
	font-size: 0;
	background: #f3f3f3;
	border-radius: 4px;

	image {
		width: 100%;
		height: 100%;
		transition: .6s;
		opacity: 0;

		&.loaded {
			opacity: 1;
		}
	}
}

.clamp {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: block;
}

.common-hover {
	background: #f5f5f5;
}

/*边框*/
.b-b:after,
.b-t:after {
	position: absolute;
	z-index: 3;
	left: 0;
	right: 0;
	height: 0;
	content: '';
	transform: scaleY(.5);
	border-bottom: 1px solid $border-color-base;
}

.b-b:after {
	bottom: 0;
}

.b-t:after {
	top: 0;
}

/* button样式改写 */
uni-button,
button {
	height: 80upx;
	line-height: 80upx;
	font-size: $font-lg + 2upx;
	font-weight: normal;

	&.no-border:before,
	&.no-border:after {
		border: 0;
	}
}

uni-button[type=default],
button[type=default] {
	color: $font-color-dark;
}

/* input 样式 */
.input-placeholder {
	color: #999999;
}

.placeholder {
	color: #999999;
}
</style>
