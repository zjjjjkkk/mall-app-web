<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">姓名</text>
			<input class="input" type="text" v-model="addressData.name" placeholder="收货人姓名" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">手机号码</text>
			<input class="input" type="number" v-model="addressData.phoneNumber" placeholder="收货人手机号码" placeholder-class="placeholder" />
			</view>
		<view class="row b-b">
			<text class="tit">邮政编码</text>
			<input class="input" type="number" v-model="addressData.postCode" placeholder="收货人邮政编码" placeholder-class="placeholder" />
		</view>
<!-- 		<view class="row b-b">
			<text class="tit">所在区域</text>
			<text @click="chooseLocation" class="input">
				{{addressData.province}} {{addressData.city}} {{addressData.region}}
			</text>
			<text class="yticon icon-shouhuodizhi" @click="chooseLocation"></text>
		</view> -->
		<view class="row b-b region-row">
			<text class="tit">所在区域</text>
			<input
				class="input region-input"
				type="text"
				v-model="addressData.prefixAddress"
				placeholder="点击右侧按钮自动定位"
				readonly
				placeholder-class="placeholder"
				@focus="chooseLocation"
			/>
			<text class="yticon icon-dingwei" @click="chooseLocation"></text>
			</view>
		<view class="row b-b">
			<text class="tit">详细地址</text>
			<input class="input" type="text" v-model="addressData.detailAddress" placeholder="详细地址" placeholder-class="placeholder" />
		</view>

		<view class="row default-row">
			<text class="tit">设为默认</text>
			<switch :checked="addressData.defaultStatus==1" color="#fa436a" @change="switchChange" />
			</view>
		<button class="add-btn" @click="confirm">提交</button>

		<!-- #ifdef H5 -->
		<view v-if="mapDialogVisible" class="map-dialog-mask">
			<view class="map-dialog">
				<view class="map-dialog__header">
					<text>选择地址</text>
					<text class="map-dialog__close" @click="closeMapLocator">×</text>
				</view>
				<view class="map-dialog__body">
					<view v-if="mapInitLoading" class="map-loading">地图加载中...</view>
					<view id="amapContainer" class="map-container" v-show="!mapInitLoading"></view>
					<view class="map-result" v-show="!mapInitLoading">
						<text class="map-result__label">当前选址：</text>
						<text class="map-result__value">{{ mapAddressText || '移动地图获取地址' }}</text>
			</view>
		</view>
				<view class="map-dialog__footer">
					<button class="map-btn cancel" @click="closeMapLocator">取消</button>
					<button class="map-btn confirm" @click="confirmMapLocation">使用该位置</button>
				</view>
			</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		addAddress,
		updateAddress,
		fetchAddressDetail
	} from '@/api/address.js';
	import { fetchLocationAddress } from '@/api/home.js'
	export default {
		data() {
			return {
				addressData: {
					name: '',
					phoneNumber: '',
					postCode: '',
					detailAddress: '',
					default: false,
					province: '',
					city: '',
					region: '',
					prefixAddress: '',
					latitude: '',
					longitude: ''
				},
				mapDialogVisible: false,
				mapInitLoading: false,
				amapLoaded: false,
				amapInstance: null,
				amapMarker: null,
				mapAddressText: '',
				tempLocation: null,
				amapJsKey: '889850e947bcc15b8297972cc800270c'
			}
		},
		onLoad(option) {
			let title = '新增收货地址';
			if (option.type === 'edit') {
				title = '编辑收货地址'
				fetchAddressDetail(option.id).then(response=>{
					this.addressData = response.data;
					this.addressData.prefixAddress = this.addressData.province+this.addressData.city+this.addressData.region;
				});
			}
			this.manageType = option.type;
			uni.setNavigationBarTitle({
				title
			})
		},
		methods: {
			switchChange(e) {
				this.addressData.defaultStatus = e.detail.value ? 1 : 0;
			},
			//地图选择地址
			chooseLocation() {
				// #ifdef H5
				this.openMapLocator()
				// #endif
				// #ifndef H5
				uni.chooseLocation({
					success: (data) => {
						this.covertAdderss(data.address);
						this.addressData.detailAddress = data.name;
					}
				})
				// #endif
			},
			openMapLocator() {
				this.mapDialogVisible = true
				this.mapInitLoading = true
				this.$nextTick(() => {
					this.ensureAmapScript()
				})
			},
			closeMapLocator() {
				this.mapDialogVisible = false
			},
			ensureAmapScript() {
				if (this.amapLoaded) {
					this.initAmap()
					return
				}
				const scriptId = 'amap-sdk'
				if (document.getElementById(scriptId)) {
					this.initAmap()
					return
				}
				const script = document.createElement('script')
				script.id = scriptId
				script.type = 'text/javascript'
				script.src = `https://webapi.amap.com/maps?v=2.0&key=${this.amapJsKey}&plugin=AMap.Geolocation`
				script.onload = () => {
					this.amapLoaded = true
					this.initAmap()
				}
				script.onerror = () => {
					this.mapInitLoading = false
					this.$api.msg('地图加载失败，请检查网络')
				}
				document.body.appendChild(script)
			},
			initAmap() {
				if (!window.AMap) {
					this.mapInitLoading = false
					this.$api.msg('高德地图未加载，请刷新重试')
					return
				}
				if (this.amapInstance) {
					this.mapInitLoading = false
					return
				}
				const center = this.addressData.longitude && this.addressData.latitude
					? [this.addressData.longitude, this.addressData.latitude]
					: undefined
				this.amapInstance = new window.AMap.Map('amapContainer', {
					resizeEnable: true,
					zoom: 16,
					center
				})
				this.amapMarker = new window.AMap.Marker({
					position: this.amapInstance.getCenter(),
					offset: new window.AMap.Pixel(0, -20)
				})
				this.amapInstance.add(this.amapMarker)
				this.amapInstance.on('moveend', () => {
					const newCenter = this.amapInstance.getCenter()
					this.amapMarker.setPosition(newCenter)
					this.handleLngLatChange(newCenter.lng, newCenter.lat)
				})
				window.AMap.plugin('AMap.Geolocation', () => {
					const geolocation = new window.AMap.Geolocation({
						enableHighAccuracy: true,
						timeout: 10000,
						position: 'RB',
						buttonOffset: new window.AMap.Pixel(10, 20)
					})
					this.amapInstance.addControl(geolocation)
					geolocation.getCurrentPosition((status, result) => {
						if (status === 'complete' && result.position) {
							this.amapInstance.setCenter(result.position)
							this.amapMarker.setPosition(result.position)
							this.handleLngLatChange(result.position.lng, result.position.lat, result.addressComponent)
						} else {
							this.$api.msg('定位失败，可手动拖动地图选择')
						}
						this.mapInitLoading = false
					})
				})
				if (!this.mapInitLoading) {
					this.mapInitLoading = false
				}
			},
			async handleLngLatChange(lng, lat, addressComponent) {
				this.tempLocation = { lng, lat }
				if (addressComponent) {
					this.applyAddressComponent(addressComponent)
					this.mapAddressText = `${addressComponent.province || ''}${addressComponent.city || ''}${addressComponent.district || ''}`
					return
				}
				try {
					const resp = await fetchLocationAddress({ lng, lat })
					const payload = resp?.data ?? resp ?? {}
					this.updateAddressByPayload(payload)
				} catch (error) {
					console.error('handleLngLatChange error:', error)
				}
			},
			applyAddressComponent(comp = {}) {
				this.addressData.province = comp.province || ''
				this.addressData.city = typeof comp.city === 'string' ? comp.city : ''
				this.addressData.region = comp.district || ''
				this.addressData.prefixAddress = `${this.addressData.province}${this.addressData.city}${this.addressData.region}`
			},
			updateAddressByPayload(payload = {}) {
				const province = payload.province || ''
				const city = payload.city || ''
				const region = payload.district || ''
				const formatted = payload.formattedAddress || `${province}${city}${region}`
				this.addressData.province = province
				this.addressData.city = city
				this.addressData.region = region
				this.addressData.prefixAddress = formatted
				if (!this.addressData.detailAddress) {
					this.addressData.detailAddress = formatted
				}
				this.mapAddressText = formatted
			},
			confirmMapLocation() {
				if (!this.tempLocation) {
					this.$api.msg('请拖动地图选择位置')
					return
				}
				this.addressData.longitude = this.tempLocation.lng
				this.addressData.latitude = this.tempLocation.lat
				this.addressData.prefixAddress = this.mapAddressText || this.addressData.prefixAddress
				if (!this.addressData.detailAddress) {
					this.addressData.detailAddress = this.mapAddressText
				}
				this.closeMapLocator()
			},
			//将地址转化为省市区
			covertAdderss(address) {
				console.log("covertAdderss", address);
				if (address.indexOf("省") != -1) {
					this.addressData.province = address.substr(0, address.indexOf("省") + 1);
					address = address.replace(this.addressData.province, "");
					this.addressData.city = address.substr(0, address.indexOf("市") + 1);
					address = address.replace(this.addressData.city, "");
					this.addressData.region = address.substr(0, address.indexOf("区") + 1);
				} else {
					this.addressData.province = address.substr(0, address.indexOf("市") + 1);
					address = address.replace(this.addressData.province, "");
					this.addressData.city = "";
					this.addressData.region = address.substr(0, address.indexOf("区") + 1);
				}
			},
			//提交
			confirm() {
				let data = this.addressData;
				if (!data.name) {
					this.$api.msg('请填写收货人姓名');
					return;
				}
				if (!/(^1[3|4|5|7|8][0-9]{9}$)/.test(data.phoneNumber)) {
					this.$api.msg('请输入正确的手机号码');
					return;
				}
				if (!data.prefixAddress) {
					this.$api.msg('请输入区域');
					return;
				}
				this.covertAdderss(data.prefixAddress);
				if (!data.province) {
					this.$api.msg('请输入正确的省份');
					return;
				}
				if (!data.detailAddress) {
					this.$api.msg('请填写详细地址信息');
					return;
				}
				const afterSubmit = () => {
					const prevPage = this.$api?.prePage?.()
					if (prevPage && typeof prevPage.refreshList === 'function') {
						prevPage.refreshList(data, this.manageType)
					}
					this.$api.msg(this.manageType === 'edit' ? '地址修改成功！' : '地址添加成功！')
					setTimeout(() => {
						uni.navigateBack()
					}, 800)
				}
				const submitPromise =
					this.manageType === 'edit'
						? updateAddress(this.addressData)
						: addAddress(this.addressData)
				submitPromise
					.then(afterSubmit)
					.catch((error) => {
						console.error('address submit error:', error)
						this.$api.msg('提交失败，请稍后重试')
					})
			},
		}
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-top: 16upx;
	}

	.row {
		display: flex;
		align-items: center;
		position: relative;
		padding: 0 30upx;
		height: 110upx;
		background: #fff;

		.tit {
			flex-shrink: 0;
			width: 150upx;
			font-size: 30upx;
			color: $font-color-dark;
		}

		.input {
			flex: 1;
			font-size: 30upx;
			color: $font-color-dark;
		}

		.icon-shouhuodizhi {
			font-size: 36upx;
			color: $font-color-light;
		}
	}

	.region-row {
		.region-input {
			padding-right: 60upx;
		}

		.icon-dingwei {
			position: absolute;
			right: 40upx;
			font-size: 40upx;
			color: $uni-color-primary;
		}
	}

	.default-row {
		margin-top: 16upx;

		.tit {
			flex: 1;
		}

		switch {
			transform: translateX(16upx) scale(.9);
		}
	}

	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690upx;
		height: 80upx;
		margin: 60upx auto;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
		box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
	}

	/* #ifdef H5 */
	.map-dialog-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.map-dialog {
		width: 90%;
		max-width: 720upx;
		background: #fff;
		border-radius: 16upx;
		overflow: hidden;
			display: flex;
			flex-direction: column;
		}

	.map-dialog__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24upx 32upx;
		font-size: 32upx;
		font-weight: 600;
		border-bottom: 1px solid #f0f0f0;
	}

	.map-dialog__close {
		font-size: 40upx;
		cursor: pointer;
	}

	.map-dialog__body {
		padding: 16upx 32upx 0;
	}

	.map-container {
		width: 100%;
		height: 400upx;
		border-radius: 12upx;
		overflow: hidden;
	}

	.map-loading {
			width: 100%;
		height: 400upx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: $font-color-light;
		font-size: 30upx;
	}

	.map-result {
		margin-top: 16upx;
		font-size: 26upx;
			color: $font-color-dark;
		}

	.map-result__label {
			color: $font-color-light;
		margin-right: 8upx;
	}

	.map-dialog__footer {
		display: flex;
		justify-content: flex-end;
		gap: 20upx;
		padding: 24upx 32upx 32upx;
	}

	.map-btn {
		flex: 1;
		height: 80upx;
		border-radius: 10upx;
		font-size: 30upx;
	}

	.map-btn.cancel {
			color: $font-color-dark;
		background: #f4f4f4;
	}

	.map-btn.confirm {
		color: #fff;
		background: $base-color;
	}
	/* #endif */
</style>
