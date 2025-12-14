<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular=true duration="400">
				<swiper-item class="swiper-item" v-for="(item,index) in imgList" :key="index">
					<view class="image-wrapper">
						<image :src="item.src" class="loaded" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="introduce-section">
			<text class="title">{{product.name}}</text><br>
			<text class="title2">{{product.subTitle}}</text>
			<view class="price-box">
				<!-- 如果有标配和高配价格，显示两个价格 -->
				<view v-if="product.standardPrice && product.topPrice" class="version-price-box">
					<view class="version-price-item">
						<text class="version-label">标配版：</text>
						<text class="price-tip">¥</text>
						<text class="price">{{product.standardPrice}}</text>
						<text v-if="product.standardVersion" class="version-info">({{product.standardVersion}})</text>
					</view>
					<view class="version-price-item">
						<text class="version-label">高配版：</text>
						<text class="price-tip">¥</text>
						<text class="price">{{product.topPrice}}</text>
						<text v-if="product.topVersion" class="version-info">({{product.topVersion}})</text>
					</view>
				</view>
				<!-- 如果没有版本价格，显示原来的价格 -->
				<view v-else>
					<text class="price-tip">¥</text>
					<text class="price">{{product.price}}</text>
					<text v-if="product.originalPrice && product.originalPrice > product.price" class="m-price">¥{{product.originalPrice}}</text>
				</view>
			</view>
			<view class="bot-row">
				<text>销量: {{product.sale}}</text>
				<text>库存: {{product.stock}}</text>
				<text>浏览量: 768</text>
			</view>
		</view>


		<view class="c-list">
			<view class="c-row b-b" @click="toggleSpec">
				<text class="tit">选择套餐</text>
				<view class="con">
					<text v-if="specSelected.length > 0" class="selected-text" v-for="(sItem, sIndex) in specSelected" :key="sIndex">
						{{sItem.name}}
					</text>
					<text v-else class="placeholder-text" style="color: #999;">请选择套餐</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b" @click="toggleAttr">
				<text class="tit">商品参数</text>
				<view class="con">
					<text class="con t-r">查看</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b" @click="addToCompare">
				<text class="tit">商品对比</text>
				<view class="con">
					<text class="con t-r" :class="{'red': isInCompare}">
						{{ isInCompare ? '已加入对比' : '加入对比' }}
					</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b" @click="toggleCoupon('show')">
				<text class="tit">优惠券</text>
				<text class="con t-r red">领取优惠券</text>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b">
				<text class="tit">促销活动</text>
				<view class="con-list">
					<text v-for="item in promotionTipList" :key="item">{{item}}</text>
				</view>
			</view>
			<view class="c-row b-b">
				<text class="tit">服务</text>
				<view class="bz-list con">
					<text v-for="item in serviceList" :key="item">{{item}} ·</text>
				</view>
			</view>
		</view>

		<!-- 评价 -->
		<view class="comment-section">
			<view class="comment-header" @click="viewAllComments">
				<text class="comment-title">商品评价</text>
				<text class="comment-count">({{ commentTotal }})</text>
				<text class="comment-rate">好评率 {{ goodRate }}%</text>
				<text class="icon-arrow">></text>
			</view>
			<view v-if="commentList === null" class="no-comment">
				<text>加载中...</text>
			</view>
			<view v-else-if="commentList.length === 0" class="no-comment">
				<text>暂无评价</text>
			</view>
			<template v-else>
				<view v-for="(item, index) in commentList" :key="index" class="comment-item">
				<view class="comment-user">
					<image class="user-avatar" :src="item.memberIcon || '/static/default-avatar.png'" mode="aspectFill"></image>
					<view class="user-info">
						<text class="user-name">{{ item.memberNickName || '匿名用户' }}</text>
						<view class="star-box">
							<text 
								v-for="(star, starIndex) in 5" 
								:key="starIndex"
								class="star"
								:class="starIndex < item.star ? 'star-active' : 'star-inactive'"
							>★</text>
						</view>
					</view>
					<text class="comment-date">{{ item.createTime | formatDateTime }}</text>
				</view>
				<view class="comment-content">
					<text>{{ item.content }}</text>
				</view>
				<view class="comment-pics" v-if="item.pics && getPicList(item.pics).length > 0">
					<image 
						v-for="(pic, picIndex) in getPicList(item.pics)" 
						:key="picIndex"
						:src="pic" 
						mode="aspectFill"
						class="comment-img"
						@click="previewCommentPic(pic, getPicList(item.pics))"
						@error="handleCommentImageError"
						lazy-load
					></image>
				</view>
				<!-- 管理员回复 -->
				<view class="admin-reply-box" v-if="item.replayList && item.replayList.length > 0">
					<view v-for="(replay, replayIndex) in item.replayList" :key="replayIndex" class="reply-box">
						<view class="reply-title">
							<text class="reply-name">{{ replay.memberNickName }}</text>
							<text class="reply-tag" v-if="replay.type === 1">管理员</text>
						</view>
						<text class="reply-text">{{ replay.content }}</text>
					</view>
				</view>
				<view class="comment-attr" v-if="item.productAttribute">
					<text>{{ item.productAttribute }}</text>
				</view>
			</view>
			</template>
		</view>

		<!-- 相关推荐 -->
		<view v-if="recommendations && recommendations.length" class="recommend-section">
			<view class="d-header">
				<text>相关推荐</text>
			</view>
			<view class="recommend-list">
				<view v-for="item in recommendations" :key="item.id" class="recommend-item" @click="goRecommend(item)">
					<image class="recommend-cover" :src="item.cover || defaultCover" mode="aspectFill"></image>
					<view class="recommend-info">
						<text class="recommend-name">{{ item.title }}</text>
						<text class="recommend-price" v-if="item.price">¥{{ item.price }}</text>
						<text class="recommend-reason">{{ item.reason || '热门推荐' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 品牌信息 -->
		<view class="brand-info" v-if="brand && brand.id">
			<view class="d-header">
				<text>品牌信息</text>
			</view>
			<view class="brand-box" @click="navToBrandDetail()">
				<view class="image-wrapper">
					<image :src="brand.logo || ''" class="loaded" mode="aspectFit"></image>
				</view>
				<view class="title">
					<text>{{brand.name || ''}}</text>
					<text>品牌首字母：{{brand.firstLetter || ''}}</text>
				</view>
			</view>
		</view>

		<view class="detail-desc">
			<view class="d-header">
				<text>图文详情</text>
			</view>
			<rich-text :nodes="desc"></rich-text>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom">
			<navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
				<text class="yticon icon-xiatubiao--copy"></text>
				<text>首页</text>
			</navigator>
			<navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
				<text class="yticon icon-gouwuche"></text>
				<text>购物车</text>
			</navigator>
			<view class="p-b-btn" :class="{active: favorite}" @click="toFavorite">
				<text class="yticon icon-shoucang"></text>
				<text>收藏</text>
			</view>

			<view class="action-btn-group">
				<button type="primary" class=" action-btn no-border buy-now-btn" @click="buy">立即购买</button>
				<button type="primary" class=" action-btn no-border add-cart-btn" @click="addToCart">加入购物车</button>
			</view>
		</view>


		<!-- 规格-模态层弹窗 -->
		<view class="popup spec" :class="specClass" @touchmove.stop.prevent="stopPrevent" @click="toggleSpec">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer attr-content" @click.stop="stopPrevent">
				<view class="a-t">
					<image :src="product.pic"></image>
					<view class="right">
						<text class="price">¥{{product.price}}</text>
						<text class="stock">库存：{{product.stock}}件</text>
						<view class="selected">
							已选：
							<text class="selected-text" v-for="(sItem, sIndex) in specSelected" :key="sIndex">
								{{sItem.name}}
								<text v-if="sItem.price" class="selected-price">(¥{{sItem.price}})</text>
							</text>
						</view>
					</view>
				</view>
				<view v-for="(item,index) in specList" :key="index" class="attr-list">
					<text class="attr-title">{{item.name}}</text>
					<view class="item-list">
						<view v-for="(childItem, childIndex) in specChildList" v-if="childItem.pid === item.id" :key="childIndex" 
							class="package-item" :class="{selected: childItem.selected}" 
							@click="selectSpec(childIndex, childItem.pid)">
							<text class="package-name">{{childItem.name}}</text>
							<text v-if="childItem.price" class="package-price">¥{{childItem.price}}</text>
						</view>
					</view>
				</view>
				<button class="btn" @click="toggleSpec">完成</button>
			</view>
		</view>
		<!-- 属性-模态层弹窗 -->
		<view class="popup spec" :class="attrClass" @touchmove.stop.prevent="stopPrevent" @click="toggleAttr">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer attr-content no-padding" @click.stop="stopPrevent">
				<view class="c-list">
					<view v-for="item in attrList" class="c-row b-b" :key="item.key">
						<text class="tit">{{item.key}}</text>
						<view class="con">
							<text class="con t-r">{{item.value}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 优惠券面板 -->
		<view class="mask" :class="couponState===0 ? 'none' : couponState===1 ? 'show' : ''" @click="toggleCoupon">
			<view class="mask-content" @click.stop.prevent="stopPrevent">
				<!-- 优惠券页面，仿mt -->
				<view class="coupon-item" v-for="(item,index) in couponList" :key="index" @click="addCoupon(item)">
					<view class="con">
						<view class="left">
							<text class="title">{{item.name}}</text>
							<text class="time">有效期至{{item.endTime | formatDateTime}}</text>
						</view>
						<view class="right">
							<text class="price">{{item.amount}}</text>
							<text>满{{item.minPoint}}可用</text>
						</view>

						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<text class="tips">{{item.useType | formatCouponUseType}}</text>
				</view>
			</view>
		</view>
		<!-- 分享 -->
		<share ref="share" :contentHeight="580" :shareList="shareList"></share>
	</view>
</template>

<script>
import share from '@/components/share';
import {
	fetchProductDetail
} from '@/api/product.js';
import { recommendProducts } from '@/api/ugc';
import { getCommentListByProductId, getCommentReplayList } from '@/api/comment.js';
import { addToCompare, checkInCompare } from '@/api/productCompare';
import logger from '@/utils/logger.js';
import { getPicList } from '@/utils/imageUtil.js';
import { handleApiError, showError } from '@/utils/errorHandler.js';
import {
	addCartItem,
	fetchCartList
	} from '@/api/cart.js';
	import {
		fetchProductCouponList,
		addMemberCoupon
	} from '@/api/coupon.js';
	import {
		createReadHistory
	} from '@/api/memberReadHistory.js';
	import {
		createProductCollection,
		deleteProductCollection,
		productCollectionDetail
	} from '@/api/memberProductCollection.js';
	import {
		mapState
	} from 'vuex';
	import {
		formatDate
	} from '@/utils/date';
	const defaultServiceList = [{
		id: 1,
		name: "无忧退货"
	}, {
		id: 2,
		name: "快速退款"
	}, {
		id: 3,
		name: "免费包邮"
	}];
	const defaultShareList = [{
			type: 1,
			icon: '/static/temp/share_wechat.png',
			text: '微信好友'
		},
		{
			type: 2,
			icon: '/static/temp/share_moment.png',
			text: '朋友圈'
		},
		{
			type: 3,
			icon: '/static/temp/share_qq.png',
			text: 'QQ好友'
		},
		{
			type: 4,
			icon: '/static/temp/share_qqzone.png',
			text: 'QQ空间'
		}
	]
	export default {
		components: {
			share
		},
		data() {
			return {
				specClass: 'none',
				attrClass: 'none',
				specSelected: [],
				favorite: false,
				shareList: [],
				imgList: [],
				desc: '',
				specList: [],
				specChildList: [],
				product: {},
				recommendations: [],
				defaultCover: '/static/missing-face.png',
				brand: {},
				serviceList: [],
				skuStockList: [],
				attrList: [],
				promotionTipList: [],
				couponState: 0,
				couponList: [],
				// 对比相关
				isInCompare: false,
				// 评价相关
				commentList: [],
				commentTotal: 0,
				goodRate: 100
			};
		},
		async onLoad(options) {
			let id = options.id;
			this.shareList = defaultShareList;
			this.loadData(id);
		},
		computed: {
			...mapState(['hasLogin'])
		},
		filters: {
			formatDateTime(time) {
				if (time == null || time === '') {
					return 'N/A';
				}
				let date = new Date(time);
				return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
			},
			formatCouponUseType(useType) {
				if (useType == 0) {
					return "全场通用";
				} else if (useType == 1) {
					return "指定分类商品可用";
				} else if (useType == 2) {
					return "指定商品可用";
				}
				return null;
			},
		},
		methods: {
			async loadRecommendations(product) {
				if (!product || !product.id) return;
				try {
					const res = await recommendProducts(product.id, { limit: 6 });
					this.recommendations = res.data || [];
				} catch (e) {
					logger.error('加载相关推荐失败:', e);
				}
			},
			async loadData(id) {
				fetchProductDetail(id).then(response => {
					this.product = response.data.product;
					this.skuStockList = response.data.skuStockList;
					this.brand = response.data.brand;
					
					// 调试：打印商品数据，检查是否有版本价格字段
					console.log('商品数据:', this.product);
					console.log('标配价格:', this.product.standardPrice, '高配价格:', this.product.topPrice);
					
					this.loadRecommendations(this.product);
					this.initImgList();
					this.initServiceList();
					this.initSpecList(response.data);
					this.initAttrList(response.data);
					this.initPromotionTipList(response.data);
					this.initProductDesc();
					this.handleReadHistory();
					this.initProductCollection();
					this.checkCompareStatus(id);
					// 延迟加载评价列表，确保商品数据已完全加载
					this.$nextTick(() => {
						setTimeout(() => {
							this.loadCommentList();
						}, 500);
					});
				});
			},
			async checkCompareStatus(productId) {
				if (!this.hasLogin) return;
				try {
					const res = await checkInCompare(productId);
					if (res && res.code === 200) {
						this.isInCompare = res.data || false;
					}
				} catch (e) {
					console.error('检查对比状态失败', e);
				}
			},
			async addToCompare() {
				if (!this.hasLogin) {
					this.checkForLogin();
					return;
				}
				
				const productId = this.product.id;
				if (this.isInCompare) {
					uni.showToast({ title: '已在对比列表中', icon: 'none' });
					uni.navigateTo({ url: '/pages/product/compare' });
					return;
				}
				
				try {
					const res = await addToCompare(productId);
					if (res && res.code === 200) {
						this.isInCompare = true;
						uni.showToast({ 
							title: `已加入对比（${res.data}/10）`, 
							icon: 'success' 
						});
					}
				} catch (e) {
					console.error('加入对比失败', e);
					const errorMsg = e?.message || e?.msg || e?.error || e?.response?.data?.message || '加入失败';
					uni.showToast({ title: errorMsg, icon: 'none' });
				}
			},
			goRecommend(item) {
				// 目前接口返回 type 为 product，为兼容后续扩展保留分支
				if (item.type === 'product' || !item.type) {
					uni.navigateTo({ url: `/pages/product/product?id=${item.id}` });
				} else if (item.type === 'post') {
					uni.navigateTo({ url: `/pages/ugc/detail?id=${item.id}` });
				}
			},
			// 加载评价列表
			async loadCommentList() {
				// 等待商品数据加载完成
				if (!this.product || !this.product.id) {
					logger.debug('商品ID不存在，等待商品加载...');
					setTimeout(() => {
						if (this.product && this.product.id) {
							this.loadCommentList();
						}
					}, 500);
					return;
				}
				try {
					logger.debug('开始加载评价，商品ID:', this.product.id);
					const response = await getCommentListByProductId(this.product.id, 1, 5);
					logger.debug('评价API响应:', response);
					
					// 处理响应数据
					let commentData = null;
					if (response && response.code === 200) {
						commentData = response.data;
					} else if (response && response.data) {
						// 如果响应拦截器已经处理过，直接使用response
						commentData = response.data;
					} else {
						commentData = response;
					}
					
					if (commentData) {
						if (commentData.list && Array.isArray(commentData.list)) {
							// CommonPage格式
							this.commentList = commentData.list || [];
							this.commentTotal = commentData.total || commentData.list.length || 0;
							logger.debug('评价列表加载成功（CommonPage格式），数量:', this.commentList.length);
						} else if (Array.isArray(commentData)) {
							// 直接数组格式
							this.commentList = commentData || [];
							this.commentTotal = commentData.length || 0;
							logger.debug('评价列表加载成功（数组格式），数量:', this.commentList.length);
						} else {
							this.commentList = [];
							this.commentTotal = 0;
							logger.warn('评价数据格式不正确', commentData);
						}
						
						// 加载每个评价的回复
						if (this.commentList.length > 0) {
							for (let comment of this.commentList) {
								await this.loadCommentReplay(comment);
							}
							// 计算好评率
							this.calculateGoodRate();
						}
					} else {
						logger.debug('评价数据为空');
						this.commentList = [];
						this.commentTotal = 0;
					}
				} catch (error) {
					const message = handleApiError(error, '加载评价列表失败，请稍后重试');
					logger.error('加载评价列表失败:', message, error);
					this.commentList = [];
					this.commentTotal = 0;
					uni.showToast({ title: message, icon: 'none', duration: 2000 });
				}
			},
			// 加载评价回复
			async loadCommentReplay(comment) {
				try {
					const response = await getCommentReplayList(comment.id);
					if (response.code === 200) {
						this.$set(comment, 'replayList', response.data || []);
					}
				} catch (error) {
					logger.error('加载评价回复失败:', error);
					// 静默失败，不影响主流程
				}
			},
			// 计算好评率
			calculateGoodRate() {
				if (this.commentList.length === 0) {
					this.goodRate = 100;
					return;
				}
				let goodCount = 0;
				this.commentList.forEach(comment => {
					if (comment.star >= 4) {
						goodCount++;
					}
				});
				this.goodRate = Math.round((goodCount / this.commentList.length) * 100);
			},
			// 查看所有评价
			viewAllComments() {
				uni.navigateTo({
					url: `/pages/product/commentList?productId=${this.product.id}`
				});
			},
			// 预览评价图片
			previewCommentPic(current, urls) {
				// 过滤掉blob URL
				const validUrls = urls.filter(url => {
					if (!url) return false;
					const trimmed = url.trim();
					return trimmed && trimmed.length > 0 && !trimmed.startsWith('blob:');
				});
				if (validUrls.length === 0) {
					uni.showToast({
						title: '没有可预览的图片',
						icon: 'none'
					});
					return;
				}
				uni.previewImage({
					current: current,
					urls: validUrls
				});
			},
			// 获取图片列表（使用公共工具）
			getPicList(pics) {
				return getPicList(pics);
			},
			//规格弹窗开关
			toggleSpec() {
				if (this.specClass === 'show') {
					this.specClass = 'hide';
					setTimeout(() => {
						this.specClass = 'none';
					}, 250);
				} else if (this.specClass === 'none') {
					this.specClass = 'show';
				}
			},
			//属性弹窗开关
			toggleAttr() {
				if (this.attrClass === 'show') {
					this.attrClass = 'hide';
					setTimeout(() => {
						this.attrClass = 'none';
					}, 250);
				} else if (this.attrClass === 'none') {
					this.attrClass = 'show';
				}
			},
			//优惠券弹窗开关
			toggleCoupon(type) {
				fetchProductCouponList(this.product.id).then(response => {
					this.couponList = response.data;
					if(this.couponList==null||this.couponList.length==0){
						uni.showToast({
							title:"暂无可领优惠券",
							icon:"none"
						})
						return;
					}
					let timer = type === 'show' ? 10 : 300;
					let state = type === 'show' ? 1 : 0;
					this.couponState = 2;
					setTimeout(() => {
						this.couponState = state;
					}, timer)
				});
			},
			//选择规格
			selectSpec(index, pid) {
				let list = this.specChildList;
				// 找到当前pid对应的所有选项
				let currentPidItems = list.filter(item => item.pid === pid);
				// 取消当前pid下所有选项的选中状态
				currentPidItems.forEach(item => {
					this.$set(item, 'selected', false);
				});

				// 选中当前选项
				let selectedItem = list.find((item, idx) => idx === index && item.pid === pid);
				if (selectedItem) {
					this.$set(selectedItem, 'selected', true);
				}

				//存储已选择
				this.specSelected = [];
				list.forEach(item => {
					if (item.selected === true) {
						this.specSelected.push(item);
					}
				})
				this.changeSpecInfo();
			},
			//领取优惠券
			addCoupon(coupon) {
				this.toggleCoupon();
				addMemberCoupon(coupon.id).then(response => {
					uni.showToast({
						title: '领取优惠券成功！',
						duration: 2000
					});
				});
			},
			//分享
			share() {
				this.$refs.share.toggleMask();
			},
			//收藏
			toFavorite() {
				if (!this.checkForLogin()) {
					return;
				}
				if (this.favorite) {
					//取消收藏
					deleteProductCollection({
						productId: this.product.id
					}).then(response => {
						uni.showToast({
							title: "取消收藏成功！",
							icon: 'none'
						});
						this.favorite = !this.favorite;
					});
				} else {
					//收藏
					let productCollection = {
						productId: this.product.id,
						productName: this.product.name,
						productPic: this.product.pic,
						productPrice: this.product.price,
						productSubTitle: this.product.subTitle
					}
					createProductCollection(productCollection).then(response => {
						uni.showToast({
							title: "收藏成功！",
							icon: 'none'
						});
						this.favorite = !this.favorite;
					});
				}
			},
			//立即购买
			buy() {
				if (!this.checkForLogin()) {
					return;
				}
				
				// 检查是否选择了规格
				let productSkuStock = this.getSkuStock();
				if (!productSkuStock) {
					uni.showToast({
						title: '请选择商品规格',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 检查库存
				if (productSkuStock.stock <= 0) {
					uni.showToast({
						title: '商品库存不足',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				uni.showLoading({
					title: '处理中...'
				});
				
				// 先将商品添加到购物车
				let cartItem = {
					price: this.product.price,
					productAttr: productSkuStock.spData,
					productBrand: this.product.brandName,
					productCategoryId: this.product.productCategoryId,
					productId: this.product.id,
					productName: this.product.name,
					productPic: this.product.pic,
					productSkuCode: productSkuStock.skuCode,
					productSkuId: productSkuStock.id,
					productSn: this.product.productSn,
					productSubTitle: this.product.subTitle,
					quantity: 1
				};
				
				// 先添加商品到购物车
				addCartItem(cartItem).then(response => {
					if (response.code === 200) {
						// 添加成功后，重新获取购物车列表来找到对应的购物车项
						fetchCartList().then(cartResponse => {
							uni.hideLoading();
							if (cartResponse.code === 200 && cartResponse.data && cartResponse.data.length > 0) {
								// 查找匹配的商品（根据商品ID和SKU ID）
								let targetCartItem = cartResponse.data.find(item => 
									item.productId === this.product.id && 
									item.productSkuId === productSkuStock.id
								);
								
								if (targetCartItem) {
									// 找到匹配的购物车项，跳转到订单创建页面
									let cartIdsStr = encodeURIComponent(JSON.stringify([targetCartItem.id]));
									uni.navigateTo({
										url: `/pages/order/createOrder?cartIds=${cartIdsStr}`
									});
								} else {
									// 如果找不到匹配项，使用最新的购物车项（可能是刚添加的）
									let latestCartItem = cartResponse.data[cartResponse.data.length - 1];
									if (latestCartItem) {
										let cartIdsStr = encodeURIComponent(JSON.stringify([latestCartItem.id]));
										uni.navigateTo({
											url: `/pages/order/createOrder?cartIds=${cartIdsStr}`
										});
									} else {
										uni.showToast({
											title: '添加购物车失败，请重试',
											icon: 'none',
											duration: 2000
										});
									}
								}
							} else {
								uni.showToast({
									title: '添加购物车失败，请重试',
									icon: 'none',
									duration: 2000
								});
							}
						}).catch(error => {
							uni.hideLoading();
							console.error('获取购物车列表失败:', error);
							uni.showToast({
								title: '添加购物车成功，请前往购物车结算',
								icon: 'none',
								duration: 2000
							});
						});
					} else {
						uni.hideLoading();
						uni.showToast({
							title: response.message || '添加购物车失败',
							icon: 'none',
							duration: 2000
						});
					}
				}).catch(error => {
					uni.hideLoading();
					console.error('添加购物车失败:', error);
					uni.showToast({
						title: error.message || '添加购物车失败，请重试',
						icon: 'none',
						duration: 2000
					});
				});
			},
			stopPrevent() {},
			//设置头图信息
			initImgList() {
				if (!this.product) return;
				let tempPics = [];
				if (this.product.albumPics && typeof this.product.albumPics === 'string') {
					tempPics = this.product.albumPics.split(',');
				}
				if (this.product.pic) {
					tempPics.unshift(this.product.pic);
				}
				for (let item of tempPics) {
					if (item != null && item != '') {
						this.imgList.push({
							src: item
						});
					}
				}
			},
			//设置服务信息
			initServiceList() {
				if (!this.product) return;
				for (let item of defaultServiceList) {
					if (this.product.serviceIds && this.product.serviceIds.indexOf(item.id) != -1) {
						this.serviceList.push(item.name);
					}
				}
			},
			//设置商品规格
			initSpecList(data) {
				// 安全检查
				if (!data || !data.productAttributeList || !Array.isArray(data.productAttributeList)) {
					logger.warn('商品规格数据不存在或格式错误');
					// 如果没有规格属性，尝试使用标配/顶配版本作为套餐
					this.initPackageFromVersion();
					return;
				}
				
				for (let i = 0; i < data.productAttributeList.length; i++) {
					let item = data.productAttributeList[i];
					if (item && item.type == 0) {
						this.specList.push({
							id: item.id,
							name: item.name
						});
						if (item.handAddStatus == 1) {
							//支持手动新增的
							let valueList = data.productAttributeValueList;
							if (valueList && Array.isArray(valueList)) {
								let filterValueList = valueList.filter(value => value && value.productAttributeId == item.id);
								if (filterValueList.length > 0 && filterValueList[0] && filterValueList[0].value) {
									let inputList = filterValueList[0].value.split(',');
									for (let j = 0; j < inputList.length; j++) {
										this.specChildList.push({
											pid: item.id,
											pname: item.name,
											name: inputList[j].trim()
										});
									}
								}
							}
						} else if (item.handAddStatus == 0) {
							//不支持手动新增的
							if (item.inputList) {
								let inputList = item.inputList.split(',');
								for (let j = 0; j < inputList.length; j++) {
									this.specChildList.push({
										pid: item.id,
										pname: item.name,
										name: inputList[j].trim()
									});
								}
							}
						}
					}
				}
				
				// 如果仍然没有规格，尝试使用标配/顶配版本
				if (this.specList.length === 0) {
					this.initPackageFromVersion();
					return;
				}
				
				let availAbleSpecSet = new Set();
				for (let i = 0; i < this.skuStockList.length; i++) {
					if (this.skuStockList[i].spData) {
						try {
							let spDataArr = JSON.parse(this.skuStockList[i].spData);
							for (let j = 0; j < spDataArr.length; j++) {
								availAbleSpecSet.add(spDataArr[j].value);
							}
						} catch (e) {
							logger.warn('解析SKU spData失败:', e);
						}
					}
				}
				// 根据商品sku筛选出可用规格
				if (availAbleSpecSet.size > 0) {
					this.specChildList = this.specChildList.filter(item => {
						return availAbleSpecSet.has(item.name)
					});
				}
				// 规格 默认选中第一条
				this.specList.forEach(item => {
					for (let cItem of this.specChildList) {
						if (cItem.pid === item.id && !cItem.selected) {
							this.$set(cItem, 'selected', true);
							this.specSelected.push(cItem);
							this.changeSpecInfo();
							break;
						}
					}
				})
			},
			// 从商品版本信息初始化套餐（如果没有规格属性）
			initPackageFromVersion() {
				if (!this.product) {
					console.warn('商品数据不存在，无法初始化套餐');
					return;
				}
				
				// 兼容下划线命名（如果后端返回的是下划线格式）
				const standardPrice = this.product.standardPrice || this.product.standard_price;
				const topPrice = this.product.topPrice || this.product.top_price;
				const standardVersion = this.product.standardVersion || this.product.standard_version;
				const topVersion = this.product.topVersion || this.product.top_version;
				
				console.log('初始化套餐 - 商品ID:', this.product.id);
				console.log('标配版本:', standardVersion, '价格:', standardPrice);
				console.log('高配版本:', topVersion, '价格:', topPrice);
				console.log('完整商品对象:', JSON.stringify(this.product, null, 2));
				
				// 清空之前的套餐列表
				this.specList = [];
				this.specChildList = [];
				
				// 创建套餐规格
				let packageSpecId = 9999; // 临时ID
				this.specList.push({
					id: packageSpecId,
					name: '套餐'
				});
				
				// 添加标配套餐（即使没有版本信息，只要有价格就显示）
				if (standardPrice != null && standardPrice !== undefined && standardPrice !== '') {
					this.specChildList.push({
						pid: packageSpecId,
						pname: '套餐',
						name: standardVersion ? `标配版（${standardVersion}）` : '标配版',
						price: Number(standardPrice),
						version: standardVersion || '标配版'
					});
					console.log('已添加标配套餐:', this.specChildList[this.specChildList.length - 1]);
				}
				
				// 添加高配套餐（即使没有版本信息，只要有价格就显示）
				if (topPrice != null && topPrice !== undefined && topPrice !== '') {
					this.specChildList.push({
						pid: packageSpecId,
						pname: '套餐',
						name: topVersion ? `高配版（${topVersion}）` : '高配版',
						price: Number(topPrice),
						version: topVersion || '高配版'
					});
					console.log('已添加高配套餐:', this.specChildList[this.specChildList.length - 1]);
				}
				
				// 如果既没有标配也没有高配，使用商品基础价格创建一个默认套餐
				if (this.specChildList.length === 0) {
					console.warn('没有找到版本价格信息，使用商品基础价格');
					this.specChildList.push({
						pid: packageSpecId,
						pname: '套餐',
						name: '标准版',
						price: Number(this.product.price) || 0,
						version: '标准版'
					});
				}
				
				console.log('最终套餐列表:', this.specChildList);
				
				// 默认选中第一个套餐
				if (this.specChildList.length > 0) {
					this.$set(this.specChildList[0], 'selected', true);
					this.specSelected = [this.specChildList[0]];
					this.changeSpecInfo();
				}
			},
			//设置商品参数
			initAttrList(data) {
				if (!data || !data.productAttributeList || !data.productAttributeValueList) {
					return;
				}
				for (let item of data.productAttributeList) {
					if (item.type == 1) {
						const valueList = data.productAttributeValueList || [];
						const filterValueList = valueList.filter(value => value.productAttributeId == item.id);
						if (filterValueList.length > 0 && filterValueList[0] && filterValueList[0].value !== undefined) {
							this.attrList.push({
								key: item.name,
								value: filterValueList[0].value
							});
						}
					}
				}
			},
			//设置促销活动信息
			initPromotionTipList(data) {
				let promotionType = this.product.promotionType;
				if (promotionType == 0) {
					this.promotionTipList.push("暂无优惠");
				} else if (promotionType == 1) {
					this.promotionTipList.push("单品优惠");
				} else if (promotionType == 2) {
					this.promotionTipList.push("会员优惠");
				} else if (promotionType == 3) {
					this.promotionTipList.push("多买优惠");
					for (let item of data.productLadderList) {
						this.promotionTipList.push("满" + item.count + "件打" + item.discount * 10 + "折");
					}
				} else if (promotionType == 4) {
					this.promotionTipList.push("满减优惠");
					for (let item of data.productFullReductionList) {
						this.promotionTipList.push("满" + item.fullPrice + "元减" + item.reducePrice + "元");
					}
				} else if (promotionType == 5) {
					this.promotionTipList.push("限时优惠");
				}
			},
			//初始化商品详情信息
			initProductDesc() {
				// #ifdef MP
				// 小程序环境无法使用document对象，可以直接通过CSS控制样式
				this.desc = this.product.detailMobileHtml;
				// #endif
				
				// #ifdef H5
				let rawhtml = this.product.detailMobileHtml;
				let tempNode = document.createElement('div');
				tempNode.innerHTML = rawhtml;
				let imgs = tempNode.getElementsByTagName('img');
				for (let i = 0; i < imgs.length; i++) {
					imgs[i].style.width = '100%';
					imgs[i].style.height = 'auto';
					imgs[i].style.display = 'block';
				}
				this.desc = tempNode.innerHTML;
				// #endif
			},
			//处理创建浏览记录
			handleReadHistory() {
				if (this.hasLogin) {
					let data = {
						productId: this.product.id,
						productName: this.product.name,
						productPic: this.product.pic,
						productPrice: this.product.price,
						productSubTitle: this.product.subTitle,
					}
					createReadHistory(data);
				}
			},
			//当商品规格改变时，修改商品信息
			changeSpecInfo() {
				let skuStock = this.getSkuStock();
				if (skuStock != null) {
					this.product.originalPrice = skuStock.price;
					if (this.product.promotionType == 1) {
						//单品优惠使用促销价
						this.product.price = skuStock.promotionPrice;
					} else {
						this.product.price = skuStock.price;
					}
					this.product.stock = skuStock.stock;
				} else {
					// 如果没有SKU，使用套餐价格
					let selectedPackage = this.specSelected.find(item => item.price);
					if (selectedPackage && selectedPackage.price) {
						this.product.price = selectedPackage.price;
						console.log('更新商品价格为套餐价格:', selectedPackage.price);
					}
				}
			},
			//获取当前选中商品的SKU
			getSkuStock() {
				// 如果没有SKU列表，返回null
				if (!this.skuStockList || this.skuStockList.length === 0) {
					return null;
				}
				
				// 判断商品是否有规格系统
				const hasSpecSystem = this.specList && this.specList.length > 0;
				const hasSelectedSpec = this.specSelected && this.specSelected.length > 0;
				
				// 如果没有规格系统，直接返回第一个SKU（或默认SKU）
				if (!hasSpecSystem) {
					// 优先查找默认SKU（spData为空或为"[]"的SKU）
					for (let i = 0; i < this.skuStockList.length; i++) {
						let sku = this.skuStockList[i];
						if (!sku.spData || sku.spData === '[]' || sku.spData === 'null' || sku.spData === 'undefined' || sku.spData.trim() === '') {
							return sku;
						}
					}
					// 如果没有默认SKU，直接返回第一个
					return this.skuStockList[0];
				}
				
				// 如果有规格系统但没有选择规格，返回null（让调用方提示用户选择）
				if (!hasSelectedSpec) {
					return null;
				}
				
				// 有规格选择时，匹配对应的SKU
				for (let i = 0; i < this.skuStockList.length; i++) {
					let sku = this.skuStockList[i];
					
					// 如果SKU的spData为空，跳过（这种情况应该在上面的逻辑中处理）
					if (!sku.spData || sku.spData === 'null' || sku.spData === 'undefined' || sku.spData.trim() === '') {
						continue;
					}
					
					try {
						let spDataArr = JSON.parse(sku.spData);
						if (!Array.isArray(spDataArr) || spDataArr.length === 0) {
							continue;
						}
						
						let availAbleSpecSet = new Map();
						for (let j = 0; j < spDataArr.length; j++) {
							if (spDataArr[j] && spDataArr[j].key && spDataArr[j].value) {
								availAbleSpecSet.set(spDataArr[j].key, spDataArr[j].value);
							}
						}
						
						// 如果规格选择数量与spData中的规格数量不匹配，跳过
						if (this.specSelected.length !== spDataArr.length) {
							continue;
						}
						
						let correctCount = 0;
						for (let item of this.specSelected) {
							let value = availAbleSpecSet.get(item.pname);
							if (value != null && value == item.name) {
								correctCount++;
							}
						}
						
						if (correctCount == this.specSelected.length) {
							return sku;
						}
					} catch (e) {
						console.warn('解析SKU spData失败:', sku.spData, e);
						continue;
					}
				}
				
				// 如果所有SKU都不匹配，返回null
				return null;
			},
			//将商品加入到购物车
			addToCart() {
				if (!this.checkForLogin()) {
					return;
				}
				
				// 检查是否选择了规格或套餐
				let productSkuStock = this.getSkuStock();
				let selectedPackage = null;
				
				// 如果没有SKU但有套餐选择，使用套餐信息
				if (!productSkuStock && this.specSelected && this.specSelected.length > 0) {
					selectedPackage = this.specSelected[0];
					// 检查库存（使用商品库存）
					if (this.product.stock <= 0) {
						uni.showToast({
							title: '商品库存不足',
							icon: 'none',
							duration: 2000
						});
						return;
					}
				} else if (!productSkuStock) {
					// 既没有SKU也没有套餐选择
					uni.showToast({
						title: '请选择商品规格',
						icon: 'none',
						duration: 2000
					});
					return;
				} else {
					// 有SKU，检查库存
					if (productSkuStock.stock <= 0) {
						uni.showToast({
							title: '商品库存不足',
							icon: 'none',
							duration: 2000
						});
						return;
					}
				}
				
				// 构建购物车项
				let cartItem = {
					price: this.product.price,
					productBrand: this.product.brandName,
					productCategoryId: this.product.productCategoryId,
					productId: this.product.id,
					productName: this.product.name,
					productPic: this.product.pic,
					productSn: this.product.productSn,
					productSubTitle: this.product.subTitle || '',
					quantity: 1
				};
				
				// 如果有SKU，使用SKU信息
				if (productSkuStock) {
					cartItem.productAttr = productSkuStock.spData || '[]';
					cartItem.productSkuCode = productSkuStock.skuCode || '';
					cartItem.productSkuId = productSkuStock.id;
				} else if (selectedPackage) {
					// 如果没有SKU但有套餐，构建套餐属性信息
					// 使用套餐名称作为主要标识，确保不同配置能区分
					let packageAttr = [{
						key: '套餐',
						value: selectedPackage.name
					}];
					if (selectedPackage.version) {
						packageAttr.push({
							key: '版本',
							value: selectedPackage.version
						});
					}
					// 添加价格信息，确保不同价格的配置能区分
					if (selectedPackage.price) {
						packageAttr.push({
							key: '价格',
							value: '¥' + selectedPackage.price
						});
					}
					cartItem.productAttr = JSON.stringify(packageAttr);
					cartItem.productSkuCode = '';
					cartItem.productSkuId = null; // 没有SKU ID
					console.log('添加购物车 - 套餐信息:', selectedPackage);
					console.log('添加购物车 - 属性信息:', cartItem.productAttr);
				}
				
				addCartItem(cartItem).then(response => {
					if (response && response.code === 200) {
						uni.showToast({
							title: response.message || '已加入购物车',
							icon: 'success',
							duration: 1500
						});
					} else {
						uni.showToast({
							title: response.message || '加入购物车失败',
							icon: 'none',
							duration: 2000
						});
					}
				}).catch(error => {
					console.error('加入购物车失败:', error);
					uni.showToast({
						title: '加入购物车失败',
						icon: 'none',
						duration: 2000
					});
				});
			},
			//检查登录状态并弹出登录框
			checkForLogin() {
				if (!this.hasLogin) {
					uni.showModal({
						title: '提示',
						content: '你还没登录，是否要登录？',
						confirmText: '去登录',
						cancelText: '取消',
						success: function(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/public/login'
								})
							} else if (res.cancel) {
								logger.debug('用户点击取消');
							}
						}
					});
					return false;
				} else {
					return true;
				}
			},
			//初始化收藏状态
			initProductCollection() {
				if (this.hasLogin) {
					productCollectionDetail({
						productId: this.product.id
					}).then(response => {
						this.favorite = response.data != null;
					});
				}
			},
			//跳转到品牌详情页
			navToBrandDetail(){
				let id = this.brand.id;
				uni.navigateTo({
					url: `/pages/brand/brandDetail?id=${id}`
				})
			},
		},

	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
		padding-bottom: 160upx;
	}

	.icon-you {
		font-size: $font-base + 2upx;
		color: #888;
	}

	.carousel {
		height: 722upx;
		position: relative;

		swiper {
			height: 100%;
		}

		.image-wrapper {
			width: 100%;
			height: 100%;
		}

		.swiper-item {
			display: flex;
			justify-content: center;
			align-content: center;
			height: 750upx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}

	}

	/* 标题简介 */
	.introduce-section {
		background: #fff;
		padding: 20upx 30upx;

		.title {
			font-size: 32upx;
			color: #333;
			line-height: 1.5;
			margin-bottom: 10upx;
			font-weight: normal;
		}

		.title2 {
			font-size: 26upx;
			color: #999;
			line-height: 1.5;
			margin-bottom: 20upx;
		}

	.price-box {
		display: flex;
		align-items: baseline;
		padding: 20upx 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.version-price-box {
		display: flex;
		flex-direction: column;
		gap: 12upx;
		width: 100%;
	}

	.version-price-item {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
	}

	.version-label {
		font-size: 28upx;
		color: #666;
		margin-right: 8upx;
	}

	.version-info {
		font-size: 24upx;
		color: #999;
		margin-left: 8upx;
	}

	.price {
		font-size: 36upx;
		color: #ff4444;
		font-weight: normal;
	}

		.m-price {
			margin: 0 12upx;
			color: $font-color-light;
			text-decoration: line-through;
		}

		.coupon-tip {
			align-items: center;
			padding: 4upx 10upx;
			background: $uni-color-primary;
			font-size: $font-sm;
			color: #fff;
			border-radius: 6upx;
			line-height: 1;
			transform: translateY(-4upx);
		}

		.bot-row {
			display: flex;
			align-items: center;
			height: 50upx;
			font-size: $font-sm;
			color: $font-color-light;

			text {
				flex: 1;
			}
		}
	}

	/* 分享 */
	.share-section {
		display: flex;
		align-items: center;
		color: $font-color-base;
		background: linear-gradient(left, #fdf5f6, #fbebf6);
		padding: 12upx 30upx;

		.share-icon {
			display: flex;
			align-items: center;
			width: 70upx;
			height: 30upx;
			line-height: 1;
			border: 1px solid $uni-color-primary;
			border-radius: 4upx;
			position: relative;
			overflow: hidden;
			font-size: 22upx;
			color: $uni-color-primary;

			&:after {
				content: '';
				width: 50upx;
				height: 50upx;
				border-radius: 50%;
				left: -20upx;
				top: -12upx;
				position: absolute;
				background: $uni-color-primary;
			}
		}

		.icon-xingxing {
			position: relative;
			z-index: 1;
			font-size: 24upx;
			margin-left: 2upx;
			margin-right: 10upx;
			color: #fff;
			line-height: 1;
		}

		.tit {
			font-size: $font-base;
			margin-left: 10upx;
		}

		.icon-bangzhu1 {
			padding: 10upx;
			font-size: 30upx;
			line-height: 1;
		}

		.share-btn {
			flex: 1;
			text-align: right;
			font-size: $font-sm;
			color: $uni-color-primary;
		}

		.icon-you {
			font-size: $font-sm;
			margin-left: 4upx;
			color: $uni-color-primary;
		}
	}

	.c-list {
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		background: #fff;

		.c-row {
			display: flex;
			align-items: center;
			padding: 20upx 30upx;
			position: relative;
		}

		.tit {
			width: 140upx;
		}

		.con {
			flex: 1;
			color: $font-color-dark;

			.selected-text {
				margin-right: 10upx;
			}

			.selected-price {
				font-size: 24upx;
				color: #ff4444;
				margin-left: 8upx;
			}
		}

		.bz-list {
			height: 40upx;
			font-size: $font-sm+2upx;
			color: $font-color-dark;

			text {
				display: inline-block;
				margin-right: 30upx;
			}
		}

		.con-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			color: $font-color-dark;
			line-height: 40upx;
		}

		.red {
			color: $uni-color-primary;
		}
	}

	/* 评价 */
	.comment-section {
		background: #fff;
		margin-top: 20upx;
		padding: 0 30upx;
	}

	.comment-header {
		display: flex;
		align-items: center;
		height: 90upx;
		border-bottom: 1px solid #f0f0f0;
		
		.comment-title {
			font-size: 32upx;
			color: #333;
			font-weight: normal;
		}
		
		.comment-count {
			font-size: 28upx;
			color: #666;
			margin-left: 10upx;
		}
		
		.comment-rate {
			flex: 1;
			text-align: right;
			font-size: 26upx;
			color: #999;
		}
		
		.icon-arrow {
			font-size: 28upx;
			color: #999;
			margin-left: 10upx;
		}
	}

	.no-comment {
		padding: 60upx 0;
		text-align: center;
		color: #999;
		font-size: 28upx;
	}

	.comment-item {
		padding: 30upx 0;
		border-bottom: 1px solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.comment-user {
		display: flex;
		align-items: center;
		margin-bottom: 20upx;
		
		.user-avatar {
			width: 60upx;
			height: 60upx;
			border-radius: 50%;
			margin-right: 20upx;
		}
		
		.user-info {
			flex: 1;
			
			.user-name {
				display: block;
				font-size: 28upx;
				color: #333;
				margin-bottom: 8upx;
			}
			
			.star-box {
				display: flex;
				
				.star {
					font-size: 24upx;
					margin-right: 4upx;
					
					&.star-active {
						color: #ff9500;
					}
					
					&.star-inactive {
						color: #ddd;
					}
				}
			}
		}
		
		.comment-date {
			font-size: 24upx;
			color: #999;
		}
	}

	.comment-content {
		margin-bottom: 20upx;
		
		text {
			font-size: 28upx;
			color: #333;
			line-height: 1.6;
		}
	}

	.comment-pics {
		display: flex;
		flex-wrap: wrap;
		gap: 10upx;
		margin-bottom: 20upx;
		
		.comment-img {
			width: 150upx;
			height: 150upx;
			border-radius: 4upx;
		}
	}

	.admin-reply-box {
		background: #f5f5f5;
		border-radius: 4upx;
		padding: 20upx;
		margin-bottom: 20upx;
		
		.reply-box {
			margin-bottom: 15upx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.reply-title {
				display: flex;
				align-items: center;
				margin-bottom: 10upx;
				
				.reply-name {
					font-size: 26upx;
					color: #333;
					margin-right: 10upx;
				}
				
				.reply-tag {
					background: #4caf50;
					color: #fff;
					font-size: 20upx;
					padding: 2upx 8upx;
					border-radius: 2upx;
				}
			}
			
			.reply-text {
				font-size: 26upx;
				color: #666;
				line-height: 1.5;
			}
		}
	}

	.comment-attr {
		font-size: 24upx;
		color: #999;
	}

	/*  详情 */
	.detail-desc {
		background: #fff;
		margin-top: 16upx;

		.d-header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;

			text {
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}

			&:after {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}
	}

	.detail-desc ::v-deep img {
		width: 100%;
		height: auto;
	}

	/* 规格选择弹窗 */
	.attr-content {
		padding: 10upx 30upx;

		.a-t {
			display: flex;

			image {
				width: 170upx;
				height: 170upx;
				flex-shrink: 0;
				margin-top: -40upx;
				border-radius: 8upx;
				;
			}

			.right {
				display: flex;
				flex-direction: column;
				padding-left: 24upx;
				font-size: $font-sm + 2upx;
				color: $font-color-base;
				line-height: 42upx;

				.price {
					font-size: $font-lg;
					color: $uni-color-primary;
					margin-bottom: 10upx;
				}

				.selected-text {
					margin-right: 10upx;
				}
			}
		}

		.attr-list {
			display: flex;
			flex-direction: column;
			font-size: $font-base + 2upx;
			color: $font-color-base;
			padding-top: 30upx;
			padding-left: 10upx;
		}

		.attr-title {
			font-size: 32upx;
			font-weight: 600;
			color: $font-color-dark;
			margin-bottom: 20upx;
		}

		.item-list {
			padding: 20upx 0 0;
			display: flex;
			flex-wrap: wrap;

			text {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #eee;
				margin-right: 20upx;
				margin-bottom: 20upx;
				border-radius: 100upx;
				min-width: 60upx;
				height: 60upx;
				padding: 0 20upx;
				font-size: $font-base;
				color: $font-color-dark;
			}

			.selected {
				background: #fbebee;
				color: $uni-color-primary;
			}

			.package-item {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				justify-content: center;
				background: #f5f5f5;
				border: 2upx solid #e0e0e0;
				border-radius: 12upx;
				margin-right: 20upx;
				margin-bottom: 20upx;
				padding: 20upx 30upx;
				min-width: 200upx;
				transition: all 0.3s;

				.package-name {
					font-size: 30upx;
					color: $font-color-dark;
					font-weight: 500;
					margin-bottom: 8upx;
				}

				.package-price {
					font-size: 28upx;
					color: $uni-color-primary;
					font-weight: 600;
				}

				&.selected {
					background: #fff5f7;
					border-color: $uni-color-primary;
					
					.package-name {
						color: $uni-color-primary;
					}
				}

				&:active {
					opacity: 0.8;
				}
			}
		}
	}

	.no-padding {
		padding: 0upx 0upx;
	}

	/*  弹出层 */
	.popup {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 99;

		&.show {
			display: block;

			.mask {
				animation: showPopup 0.2s linear both;
			}

			.layer {
				animation: showLayer 0.2s linear both;
			}
		}

		&.hide {
			.mask {
				animation: hidePopup 0.2s linear both;
			}

			.layer {
				animation: hideLayer 0.2s linear both;
			}
		}

		&.none {
			display: none;
		}

		.mask {
			position: fixed;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-color: rgba(0, 0, 0, 0.4);
		}

		.layer {
			position: fixed;
			z-index: 99;
			bottom: 0;
			width: 100%;
			min-height: 40vh;
			border-radius: 10upx 10upx 0 0;
			background-color: #fff;

			.btn {
				height: 66upx;
				line-height: 66upx;
				border-radius: 100upx;
				background: $uni-color-primary;
				font-size: $font-base + 2upx;
				color: #fff;
				margin: 30upx auto 20upx;
			}
		}

		@keyframes showPopup {
			0% {
				opacity: 0;
			}

			100% {
				opacity: 1;
			}
		}

		@keyframes hidePopup {
			0% {
				opacity: 1;
			}

			100% {
				opacity: 0;
			}
		}

		@keyframes showLayer {
			0% {
				transform: translateY(120%);
			}

			100% {
				transform: translateY(0%);
			}
		}

		@keyframes hideLayer {
			0% {
				transform: translateY(0);
			}

			100% {
				transform: translateY(120%);
			}
		}
	}

	/* 底部操作菜单 */
	.page-bottom {
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 690upx;
		height: 100upx;
		background: rgba(255, 255, 255, .9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
		border-radius: 16upx;

		.p-b-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: $font-sm;
			color: $font-color-base;
			width: 96upx;
			height: 80upx;

			.yticon {
				font-size: 40upx;
				line-height: 48upx;
				color: $font-color-light;
			}

			&.active,
			&.active .yticon {
				color: $uni-color-primary;
			}

			.icon-fenxiang2 {
				font-size: 42upx;
				transform: translateY(-2upx);
			}

			.icon-shoucang {
				font-size: 46upx;
			}
		}

		.action-btn-group {
			display: flex;
			height: 76upx;
			border-radius: 100px;
			overflow: hidden;
			box-shadow: 0 20upx 40upx -16upx #fa436a;
			box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
			background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);
			margin-left: 20upx;
			position: relative;

			&:after {
				content: '';
				position: absolute;
				top: 50%;
				right: 50%;
				transform: translateY(-50%);
				height: 28upx;
				width: 0;
				border-right: 1px solid rgba(255, 255, 255, .5);
			}

			.action-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 180upx;
				height: 100%;
				font-size: $font-base;
				padding: 0;
				border-radius: 0;
				background: transparent;
			}
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

	.brand-info {
		margin-top: 16upx;
		background-color: #fff;
		display: flex;
		flex-direction: column;

		.brand-box {
			display: flex;
			align-items: center;
			padding: 30upx 50upx;

			.image-wrapper {
				width: 210upx;
				height: 70upx;

				image {
					width: 100%;
					height: 100%;
				}
			}

			.title {
				flex: 1;
				display: flex;
				flex-direction: column;
				font-size: $font-lg+4upx;
				margin-left: 30upx;
				color: $font-color-dark;

				text:last-child {
					font-size: $font-sm;
					color: $font-color-light;
					margin-top: 8upx;

					&.Skeleton {
						width: 220upx;
					}
				}
			}
		}

		.d-header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;
		
			text {
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}
		
			&:after {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}
	}

	/* 相关推荐 */
	.recommend-section {
		margin-top: 16upx;
		background: #fff;
		border-radius: 12upx;
		padding: 24upx;
	}
	.recommend-list {
		display: flex;
		flex-direction: column;
		gap: 20upx;
	}
	.recommend-item {
		display: flex;
		gap: 16upx;
		align-items: center;
	}
	.recommend-cover {
		width: 180upx;
		height: 130upx;
		border-radius: 8upx;
		background: #f5f5f5;
	}
	.recommend-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8upx;
	}
	.recommend-name {
		font-size: 30upx;
		color: #333;
		font-weight: 600;
	}
	.recommend-price {
		font-size: 28upx;
		color: #e64340;
	}
	.recommend-reason {
		font-size: 24upx;
		color: #999;
	}
</style>
