import Request from '@/js_sdk/luch-request/request.js'
import { API_BASE_URL} from '@/utils/appConfig.js';

const http = new Request()

http.setConfig((config) => { /* 设置全局配置 */
	config.baseUrl = API_BASE_URL /* 根域名不同 */
	config.header = {
		...config.header
	}
	return config
})

/**
 * 自定义验证器，如果返回true 则进入响应拦截器的响应成功函数(resolve)，否则进入响应拦截器的响应错误函数(reject)
 * @param { Number } statusCode - 请求响应体statusCode（只读）
 * @return { Boolean } 如果为true,则 resolve, 否则 reject
 */
http.validateStatus = (statusCode) => {
	return statusCode === 200
}

http.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
	const token = uni.getStorageSync('token');
	if(token){
		config.header = {
			'Authorization':token,
			...config.header
		}
	}else{
		config.header = {
			...config.header
		}
	}
	/*
	if (!token) { // 如果token不存在，调用cancel 会取消本次请求，但是该函数的catch() 仍会执行
	  cancel('token 不存在') // 接收一个参数，会传给catch((err) => {}) err.errMsg === 'token 不存在'
	}
	*/
	return config
})

http.interceptor.response((response) => { /* 请求之后拦截器 */
	const res = response.data;
	if (res.code !== 200) {
		//提示错误信息，增加显示时长以便用户看清
		uni.showToast({
			title: res.message || '请求失败',
			duration: 3000,
			icon: 'none'
		})
		//401未登录处理
		if (res.code === 401) {
			uni.showModal({
				title: '提示',
				content: '你已被登出，可以取消继续留在该页面，或者重新登录',
				confirmText:'重新登录',
				cancelText:'取消',
				success: function(res) {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/public/login'
						})
					} else if (res.cancel) {
						// 用户取消登录，静默处理
					}
				}
			});
		}
		return Promise.reject(res);
	} else {
		return response.data;
	}
}, (error) => {
	//提示错误信息
	// 错误已在下方处理，无需额外日志
	let errorMsg = '网络请求失败';
	if (error.statusCode) {
		if (error.statusCode === 500) {
			errorMsg = '服务器内部错误，请稍后重试';
			// 尝试获取服务器返回的错误信息
			if (error.data && error.data.msg) {
				errorMsg = error.data.msg;
			} else if (error.data && error.data.message) {
				errorMsg = error.data.message;
			} else if (error.data && error.data.error) {
				errorMsg = error.data.error;
			}
		} else if (error.statusCode === 404) {
			errorMsg = '请求的接口不存在';
		} else if (error.statusCode === 403) {
			errorMsg = '没有权限访问该接口';
		} else if (error.statusCode === 401) {
			errorMsg = '未登录或登录已过期';
		} else if (error.statusCode === 400) {
			errorMsg = '请求参数错误';
		} else {
			errorMsg = `请求失败(${error.statusCode})`;
		}
	}
	uni.showToast({
		title: errorMsg,
		icon: 'none',
		duration: 3000
	})
	return Promise.reject(error);
})

export function request (options = {}) {
	return http.request(options);
}

export default request