import Vue from 'vue'
import Vuex from 'vuex'
import { memberInfo } from '@/api/member.js'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		userInfo: {},
	},
	mutations: {
		login(state, provider) {

			state.hasLogin = true;
			state.userInfo = provider;
			uni.setStorage({//缓存用户登陆状态
			    key: 'userInfo',  
			    data: provider  
			}) 
			console.log(state.userInfo);
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = {};
			uni.removeStorage({  
                key: 'userInfo'  
            });
			uni.removeStorage({
			    key: 'token'  
			})
		},
		updateUserInfo(state, userInfo) {
			// 合并更新用户信息，确保响应式
			if (state.userInfo && Object.keys(state.userInfo).length > 0) {
				// 如果已有用户信息，逐个更新字段以保持响应式
				Object.keys(userInfo).forEach(key => {
					Vue.set(state.userInfo, key, userInfo[key]);
				});
			} else {
				// 如果没有用户信息，直接赋值
				state.userInfo = userInfo;
			}
			uni.setStorage({
				key: 'userInfo',
				data: state.userInfo
			});
		}
	},
	actions: {
		async getUserInfo({ commit, state }) {
			try {
				const response = await memberInfo();
				if (response.code === 200 && response.data) {
					// 直接使用服务器返回的积分，确保数据一致性
					commit('updateUserInfo', response.data);
					return response.data;
				}
			} catch (error) {
				console.error('获取用户信息失败:', error);
				throw error;
			}
		}
	}
})

export default store
