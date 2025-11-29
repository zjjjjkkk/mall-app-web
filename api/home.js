import request from '@/utils/requestUtil'

export function fetchContent() {
	return request({
		method: 'GET',
		url: '/home/content'
	})
}

export function fetchRecommendProductList(params) {
	return request({
		method: 'GET',
		url: '/home/recommendProductList',
		params:params
	})
}

export function fetchProductCateList(parentId) {
	return request({
		method: 'GET',
		url: '/home/productCateList/'+parentId,
	})
}

export function fetchNewProductList(params) {
	return request({
		method: 'GET',
		url: '/home/newProductList',
		params:params
	})
}

export function fetchHotProductList(params) {
	return request({
		method: 'GET',
		url: '/home/hotProductList',
		params:params
	})
}
export function fetchLocationAddress(params) {
  // params 需要带上 lat、lng（或 latitude、longitude）
  return request({
    method: 'GET',
    url: '/location/reverse',   // 这里就是你们后端刚写的接口地址
    params
  })
}