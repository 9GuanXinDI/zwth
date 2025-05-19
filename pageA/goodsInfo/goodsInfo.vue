<template>
	<view class="info-container">
		<view v-if="isShowWhite" class="white-page">
			<text>商品链接已过期~</text>
		</view>
		<template v-else>
			<view class="banner-box">
				<swiper indicator-dots autoplay>
					<swiper-item v-for="(item,index) in goodsInfo.imgUrls">
						<image :src="item" class="slide-image" @click="preview(index)" mode="scaleToFill"></image>
					</swiper-item>
				</swiper>
			</view>
			<view class="info-content">
				<view class="flex-between info-top">
					<text class="money"><text class="symbol">￥</text>{{goodsInfo.price}}</text>
					<text class="saled"><text>库存:</text>{{goodsInfo.total||0}}</text>
				</view>
				<view class="info-name"><text
						class="mr-10">{{goodsInfo.name}}</text><text>含{{goodsInfo.num}}件应急物品</text>
				</view>
				<view class="info-item-box">
					<view class="info-item flex-between">
						<text class="label">商品名称</text><text class="value">{{goodsInfo.name}}</text>
					</view>
					<view class="info-item flex-between">
						<text class="label">商品编号</text><text class="value">{{goodsInfo.code}}</text>
					</view>
					<view class="info-item flex-between">
						<text class="label">上架时间</text><text class="value">{{goodsInfo.createTime}}</text>
					</view>
					<view class="info-item flex-between">
						<text class="label">类型</text><text class="value">{{goodsInfo.type=='1'?'核心产品':'应急物资'}}</text>
					</view>
					<view class="info-item flex-between">
						<text class="label">产品清单</text><text class="value">{{goodsInfo.list}}</text>
					</view>

				</view>
				<view class="info-img-box">
					<view class="title">图文信息</view>
					<view v-if="goodsInfo.desc" class="desc-text">{{goodsInfo.desc}}</view>
					<image v-for="(item,index) in goodsInfo.imgUrls" :key="index" :src="item" class="info-img-item" mode="widthFix">
					</image>
				</view>
			</view>
			<view class="info-bottom flex-start">
				<button id="shareBtn" :open-type="userId?'share':''" class="share-item" @click="share">
					<image src="../../assets/share-icon.png" class="share-icon"></image>
					<view>分享</view>
				</button>
				<view class="car-item" @click="goodsCar">
					
					<uni-badge class="uni-badge-left-margin" :text="value" absolute="rightTop" size="small">
						<image src="../../assets/car-icon.png" class="add-icon"></image>
						<view>购物车</view>
					</uni-badge>
				</view>
				<view class="add-car-btn" @click="addGoodsCar">加入购物车</view>
				<view class="buy-btn" @click="buy">立即购买</view>
			</view>
			<sure-login v-if="isShowLogin" @close-login="closeLogin"></sure-login>
		</template>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import sureLogin from "@/components/sureLogin.vue"
	import {
		computed
	} from '@/uni_modules/lime-ball/components/l-ball/vue';
	export default {
		components: {
			sureLogin
		},
		data() {
			return {
				value: computed(() => {
					user=useUserStore();
					return user.userInfo.goodsCarNum
				}),
				isShowWhite: false,
				userId: '',
				isShowLogin: false,
				id: '',
				code: '',
				goodsInfo: {}
			}
		},
		onLoad(option) {
			user = useUserStore();
			uni.hideTabBar({
				success: () => {},
				fail: () => {
					// 捕获报错，防止没有tabbar页面调用后控制台报错
				}
			})
			this.code = '';
			if (option.createTime) {
				// this.code = option.code;
				user.setGoodsCode(option.code);
				let minutes = this.isLoseEfficacy(option.createTime, 7);
				this.isShowWhite = minutes > 1;
			}
			this.userId = user.userInfo.userId;
			this.id = option.id;
			this.getGoodsDetail();
		},
		onShow() {
			user = useUserStore();
			if(user.userInfo.token){
				this.getCarNum();
			}else{
				user.setGoodsCarNum(0)
			}
		},
		onShareAppMessage(res) {
			return {
				title: '580应急用品商城',
				path: `/pageA/goodsInfo/goodsInfo?id=${this.id}&code=${user.userInfo.code}&createTime=${this.getCreatime()}`
			}
		},
		methods: {
			preview(i) {
				uni.previewImage({
					// 预览时，默认显示图片的索引
					current: i,
					// 所有图片 url 地址的数组
					urls: this.goodsInfo.imgUrls.filter((item,index)=>index==i)
				})
			},
			/**
			 * @name 判断是否过期
			 */
			isLoseEfficacy(createTime) {
				let nowTime = this.getCreatime();
				let differenceInTime = nowTime - createTime;
				// let differenceInMinutes = differenceInTime / (1000 * 60);
				// return differenceInMinutes
				 // 将毫秒差转换为天数
				const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 48));

				return differenceInDays;
			},
			/**
			 * @name 获取当前时间的时间戳
			 */
			getCreatime() {
				return new Date().getTime()
			},
			/**
			 * @name 取消登录
			 */
			closeLogin() {
				this.isShowLogin = false;
			},
			/**
			 * @name 未登录的分享
			 */
			share() {
				if (!this.userId) {
					uni.navigateTo({
						url: `/pageA/login/login`,
					});
				}
			},
			/**
			 * @name 获取商品详情
			 */
			async getGoodsDetail() {
				let params = {
					id: this.id
				}
				const res = await API.getGoodsDetailApi(params);
				if (res.code == 200) {
					this.goodsInfo = res.data;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 获取购物车数量
			 */
			async getCarNum() {
				let params = {}
				const res = await API.getCarNumApi(params);
				if (res.code == 200) {
					let num=res.data;
					user.setGoodsCarNum(num)
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			
			/**
			 * @name 去购物车
			 */
			goodsCar() {
				if (!this.userId) {
					uni.navigateTo({
						url: `/pageA/login/login`,
					});
				} else {
					uni.switchTab({
						url: `/pages/goodsCar/goodsCar`,
					});
				}

			},
			/**
			 * @name 加入购物车
			 */
			async addGoodsCar() {
				if (!this.userId) {
					this.isShowLogin = true;
				} else {
					uni.showLoading({title: '加载中',mask:true});
					const res = await API.addGoodsCarApi({
						goodsId: this.goodsInfo.id,
						total: 1
					});
					if (res.code == 200) {
						uni.hideLoading();
						uni.showToast({
							title: '加购成功',
							icon: 'success',
							duration: 2000
						})
						await this.getCarNum();
					} else {
						uni.hideLoading();
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 2000
						})
					}
				}
			},
			/**
			 * @name 购买
			 */
			async buy() {
				if (!this.userId) {
					this.isShowLogin = true;
				} else {
					uni.navigateTo({
						url: `/pageA/paymentInfo/paymentInfo?id=` + this.id + '&total=1' + '&type=1',
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.info-container {
		padding-bottom: 180rpx;
	}

	.banner-box {
		width: 100%;
		height: 500rpx;

		.slide-image {
			width: 100%;
			height: 500rpx;
		}
	}

	.info-content {
		padding: 0 24rpx;
		background: #F0F0F0;
		border-radius: 20rpx;

		.info-top {
			padding-top: 20rpx;
			align-items: flex-end;

			.money {
				padding: 20rpx 0 0 0;
				color: #FF6617;
				font-size: 48rpx;
			}

			.symbol {
				font-size: 30rpx;
			}

			.saled {
				font-size: 22rpx;
				color: #909090;
			}
		}

		.info-name {
			padding: 20rpx 0 28rpx 0;
			font-size: 28rpx;
			color: #1A1A1A;
		}

		.info-item-box {
			padding: 0 24rpx;
			background: #fff;
			border-radius: 20rpx;

			.info-item {
				width: 100%;
				min-height: 93rpx;
				padding: 20rpx 0;
				width: 654rpx;
				border-bottom: 2rpx solid #EBEBEB;

				.label {
					width: 20%;
					font-size: 26rpx;
					color: #909090;
				}

				.value {
					width: 80%;
					text-align: end;
					font-size: 26rpx;
					color: #1A1A1A;
				}
			}
		}
	}

	.info-bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;

		.share-item {
			width: 114rpx;
			margin-left: 24rpx;
			margin-right: 20rpx;
			text-align: center;
			font-size: 24rpx;
			color: #909090;
			line-height: normal !important;
			border: none !important;
			background-color: transparent !important;

			&::after {
				border: none; //百度平台的需要删掉 & 符号，抖音平台的删掉&符号也是可以的，其他平台没试
			}
		}

		.car-item {
			margin-right: 40rpx;
			text-align: center;
			font-size: 24rpx;
			color: #909090;
		}

		.add-car-btn {
			width: 230rpx;
			height: 80rpx;
			margin-right: 20rpx;
			text-align: center;
			line-height: 80rpx;
			background: #FFAA17;
			border-radius: 40rpx;
			font-size: 30rpx;
			color: #FFFFFF;
		}

		.buy-btn {
			width: 210rpx;
			height: 80rpx;
			margin-right: 24rpx;
			background: #FF6617;
			text-align: center;
			line-height: 80rpx;
			border-radius: 40rpx 40rpx 40rpx 40rpx;
			font-size: 30rpx;
			color: #FFFFFF;
		}
	}

	.info-img-box {
		width: 702rpx;
		margin-top: 24rpx;
		background: #FFFFFF;
		border-radius: 20rpx 20rpx 20rpx 20rpx;

		.title {
			display: flex;
			align-items: center;
			padding: 28rpx 0;
			font-weight: bold;
			font-size: 26rpx;
			color: #1A1A1A;
		}

		.title::before {
			content: "";
			display: flex;
			width: 4rpx;
			height: 25rpx;
			margin-right: 20rpx;
			background: #FF6617;
		}

		.info-img-item {
			width: 100%;
			margin-top: 20rpx;
		}
	}

	.desc-text {
		margin: 20rpx 0;
		padding: 0 20rpx;
		font-size: 26rpx;
		color: #1A1A1A;
		line-height: 36rpx;
	}

	.share-icon {
		width: 38rpx;
		height: 38rpx;
	}

	.add-icon {
		width: 38rpx;
		height: 38rpx;
	}

	.white-page {
		height: 1000rpx;
		padding-top: 200rpx;
		background-color: #fff;
		text-align: center;
		color: #909090;
	}
</style>
<style lang="less">
	/deep/ swiper {
		height: 100%;
	}
</style>