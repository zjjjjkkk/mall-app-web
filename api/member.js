import request from '@/utils/requestUtil'

export function memberLogin(data) {
	return request({
		method: 'POST',
		url: '/sso/login',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function memberInfo() {
	return request({
		method: 'GET',
		url: '/sso/info'
	})
}

export function memberRegister(data) {
	return request({
		method: 'POST',
		url: '/sso/register',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function updateProfile(data) {
	return request({
		method: 'POST',
		url: '/sso/profile/update',
		data
	})
}

export function uploadAvatar(filePath) {
	const rawToken = uni.getStorageSync('token') || ''
	const authHeader = rawToken
		? (rawToken.startsWith('Bearer') ? rawToken : `Bearer ${rawToken}`)
		: ''
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${process.env.API_BASE_URL || 'http://localhost:8085'}/sso/avatar/upload`,
			filePath,
			name: 'file',
			header: {
				'Authorization': authHeader
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data)
					resolve(data)
				} catch (e) {
					reject(e)
				}
			},
			fail: reject
		})
	})
}

// 会员：查询当前有效会员
export function fetchActiveMembership() {
	return request({
		method: 'GET',
		url: '/member/membership/active'
	})
}

// 会员：购买/续费
export function purchaseMembership(levelType) {
	return request({
		method: 'POST',
		url: '/member/membership/purchase',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: { levelType }
	})
}

// 积分流水
export function fetchPointHistory(limit = 20) {
	return request({
		method: 'GET',
		url: '/sso/points/history',
		data: { limit }
	})
}

// 获取用户等级信息
export function fetchMemberLevel() {
	return request({
		method: 'GET',
		url: '/sso/level'
	})
}