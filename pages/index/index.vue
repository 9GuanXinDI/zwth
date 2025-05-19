<template>
	<view>
		<view class="container">
			<view class="container-bg">
				<image src="../../assets/index-bg.png" class="index-bg"></image>
				<view class="info-box">
					<view class="container-title">中维天汇580应急产品服务系统</view>
					<view class="search-input">
						<uni-easyinput v-model="keyWord" prefixIcon="search" placeholder="请搜索"
							@input="search"></uni-easyinput>
					</view>
				<!-- 	<view class="banner-box" v-if="keyWord==''">
						<swiper indicator-dots autoplay>
							<swiper-item v-for="(item,index) in lunboList" :key="index" class="swipe-item">
								<image :src="item.imgUrl" class="slide-image" @click="imgLink(item)">
								</image>
							</swiper-item>
						</swiper>
					</view> -->
				</view>
				
				<view class="container-content">
					<view class="flex-between" :style="keyWord!=''?'margin-top:60rpx':''">
						<view @click="changeCategory(1)">
							<image src="../../assets/emergency-kit-select.png" class="category-img" v-if="category==1">
							</image>
							<image src="../../assets/emergency-kit.png" class="category-img" v-else></image>
						</view>
						<view @click="changeCategory(2)">
							<image src="../../assets/emergency-supplies-select.png" class="category-img"
								v-if="category==2"></image>
							<image src="../../assets/emergency-supplies.png" class="category-img" v-else></image>
						</view>
					</view>
					<view class="mt-10">
						<view v-if="goodsList.length>0">
							<view class="goods-item" v-for="(item,index) in goodsList" :key="index"
								@click="goToGoodsDetail(item)">
								<view class="goods-item-img">
									<image :src="item.coverUrl" class="goods-img" mode="widthFix"></image>
								</view>
								<view class="goods-item-info">
									<view>
										<view class="info-name"><text
												class="mr-10">{{item.name}}</text><text>含{{item.num}}件应急物品</text></view>
										<view style="margin-top:30rpx;">
											<text class="money"><text class="symbol">￥</text>{{item.price}}</text>
											<text class="saled"><text>已售:</text>{{item.sum||0}}</text>
										</view>
									</view>
									<view class="shopping-cart-btn flex-center"
										@click.stop="addShoppingCart($event,item,index)">
										<view>加购</view>
										<image src="../../assets/add-car-icon.png" class="add-icon"></image>
									</view>
								</view>
							</view>
							<!-- 使用标签包住你的购物车 -->
							<l-ball ref="ballRef" duration="1000">
								<!-- 可以导出active变量，小球将要达到时，给这购物车加点动画 -->
								<template #default="{active}">
									<uni-load-more :status="statusType"></uni-load-more>
								</template>
							</l-ball>

						</view>
						<view v-else class="no-data">
							<image src="../../assets/no-data.png" class="no-data-img"></image>
							<view class="no-data-text">暂无数据</view>
						</view>
					</view>
				</view>
			</view>
			<bottom-banner :tabIndex='1'></bottom-banner>
		</view>
		<view class="no-login-banner flex-between" v-if="!userId">
			<view class="flex-start">
				<image src="../../assets/login-icon.png" class="login-icon"></image>
				<view class="login-text">登录购买商品</view>
			</view>
			<view class="login-btn" @click="login">立即登录</view>
		</view>
		<sure-login v-if="isShowLogin" @close-login="closeLogin"></sure-login>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import {
		imgUrl
	} from "@/App.config.js";
	import sureLogin from "@/components/sureLogin.vue"
	import bottomBanner from "@/components/bottomBanner.vue"
	import {
		ref,
		unref,
		reactive
	} from 'vue'
	export default {
		components: {
			sureLogin,
			bottomBanner
		},
		data() {
			return {
				userId: '',
				currentPage: 1,
				pageSize: 20,
				keyWord: '',
				category: 1,
				goodsTotal: 0,
				statusType: 'noMore',
				goodsList: [],
				isShowLogin: false,
				lunboList: [],
			}
		},
		onShow() {
			user = useUserStore();
			this.userId = user.userInfo.userId;
			this.getBannerList();
			this.handleSearch();
			if (user.userInfo.token) {
				this.getCarNum();
			} else {
				user.setGoodsCarNum(0)
			}
		},
		onLoad() {
			uni.hideTabBar({
				success: () => {},
				fail: () => {
					// 捕获报错，防止没有tabbar页面调用后控制台报错
				}
			})
		},
		onPullDownRefresh() {
			let _this = this;
			uni.startPullDownRefresh({
				success() {
					_this.handleSearch();
				},
				fail() {}
			})
			uni.stopPullDownRefresh();
		},
		onReachBottom() {
			let allTotal = this.currentPage * 20
			if (allTotal < this.goodsTotal) {
				this.statusType = "loading";
				this.currentPage++;
				this.getGoodsList(); //请求更多数据列表
			} else {
				this.statusType = "noMore";
			}
		},
		onUnload() {},
		methods: {
			/**
			 * @name 取消登录
			 */
			closeLogin() {
				this.isShowLogin = false;
			},
			/**
			 * @name 获取轮播图列表
			 */
			async getBannerList() {
				// let params = {
				// 	orgId: user.userInfo.orgId,
				// 	status: 1
				// }
				// const res = await API.sysBannerListApi(params);
				// if (res.code == 200) {
				// 	this.lunboList = res.data;
				// } else {
				// 	uni.showToast({
				// 		title: res.message,
				// 		icon: 'none',
				// 		duration: 2000
				// 	})
				// }
			},
			/**
			 * @name 刷新
			 */
			handleSearch() {
				this.currentPage = 1;
				this.goodsList = [];
				this.getGoodsList();
			},
			/**
			 * @name 搜索
			 */
			search(val) {
				this.keyWord = val;
				this.handleSearch();
			},
			/**
			 * @name 切换品类
			 */
			changeCategory(category) {
				this.category = category;
				this.handleSearch();
			},
			/**
			 * @name 获取商品列表
			 */
			async getGoodsList() {
				let params = {
					type: this.category,
					key: this.keyWord,
					currentPage: this.currentPage,
					pageSize: 20
				}
				const res = await API.getGoodsListApi(params);
				if (res.code == 200) {
					this.goodsList = this.goodsList.concat(res.data.list);
					this.goodsTotal = res.data.allTotal;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 加入购物车
			 */
			async addShoppingCart(e, item, index) {
				if (this.userId) {
					let ballRef = this.$refs.ballRef;
					if (!ballRef) return

					uni.showLoading({
						title: '加载中',
						mask: true
					});
					const res = await API.addGoodsCarApi({
						goodsId: item.id,
						total: 1
					});
					if (res.code == 200) {
						uni.hideLoading();
						uni.showToast({
							title: '加购成功',
							icon: 'success',
							duration: 2000
						})
						await this.getCarNum()
						ballRef.action(e)
					} else {
						uni.hideLoading();
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 2000
						})
					}
				} else {
					this.isShowLogin = true;
				}

			},
			/**
			 * @name 获取购物车数量
			 */
			async getCarNum() {
				await user.getCarNum()
			},
			/**
			 * @name 查看商品详情
			 */
			goToGoodsDetail(item) {
				uni.navigateTo({
					url: `/pageA/goodsInfo/goodsInfo?id=` + item.id
				});
			},
			/**
			 * @name 登录
			 */
			login() {
				uni.navigateTo({
					url: `/pageA/login/login`,
				});
			},
			/**
			 * @name 点击轮播图
			 */
			imgLink(item) {
				if (item.link) {
					uni.navigateTo({
						url: `/pageA/webview/webview?url=` + item.link,
					});
				}

			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		position: relative;
		height: 100%;
	}

	.index-bg {
		width: 100%;
		height: 100%;
	}
	.info-box{
		position: absolute;
		top: 0;
		width: 100%;
	}

	.container-bg {
		position: relative;
		width: 100%;
		height: 645rpx;

		.container-title {
			padding: 80rpx 0 0 24rpx;
			font-weight: bold;
			font-size: 38rpx;
			color: #FFFFFF;
			line-height: 53rpx;
		}

		.search-input {
			margin:0 auto;
			margin-top: 18rpx;
		}
	}

	.banner-box {
		width: 702rpx;
		height: 294rpx;
		margin: 20rpx auto;
		border-radius: 10rpx 10rpx 10rpx 10rpx;

		.slide-image {
			height: 100%;
			object-fit: cover;
			margin: auto;
			border-radius: 10rpx 10rpx 10rpx 10rpx;
		}
	}

	.container-content {
		position: relative;
		padding: 10rpx 24rpx 138rpx 24rpx;

		.category-img {
			width: 339rpx;
			height: 160rpx;
			border-radius: 10rpx 10rpx 10rpx 10rpx;
		}

		.goods-item {
			position: relative;
			width: 100%;
			height: 702rpx;
			margin-top: 20rpx;
			background: #fff;
			border-radius: 10rpx;

			.goods-item-img {
				width: 100%;
				height: 600rpx;

				.goods-img {
					width: 100%;
					height: 100% !important;
				}
			}

			.goods-item-info {
				position: absolute;
				bottom: -2rpx;
				left: 0;
				width: 100%;
				height: 168rpx;
				background-color: #FCF7F8;

				.info-name {
					padding: 20rpx 0 0 24rpx;
					font-weight: bold;
					font-size: 32rpx;
					color: #1A1A1A;
				}

				.money {
					padding: 20rpx 0 0 24rpx;
					color: #FF6617;
					font-size: 42rpx;
				}

				.symbol {
					font-size: 24rpx;
				}

				.saled {
					margin-left: 60rpx;
					font-size: 24rpx;
					color: #909090;
				}

				.shopping-cart-btn {
					position: absolute;
					top: 52rpx;
					right: 24rpx;
					width: 160rpx;
					height: 80rpx;
					background: linear-gradient(180deg, #FF934B 0%, #FF4F17 100%);
					border-radius: 40rpx;
					font-size: 26rpx;
					color: #fff;

					.add-icon {
						width: 50rpx;
						height: 50rpx;
						margin-left: 17rpx;
					}
				}
			}
		}


	}

	.no-data {
		width: 426rpx;
		margin: 250rpx auto 0 auto;
		padding-bottom: 30rpx;
		text-align: center;

		.no-data-img {
			width: 100%;
			height: 230rpx;
		}

		.no-data-text {
			margin-top: 79rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #1A1A1A;
		}
	}

	.imgIcon {
		width: 40rpx;
		height: 40rpx;
	}

	.device-top {
		padding: 0 40rpx 20rpx 40rpx;
	}

	.add-img {
		position: fixed;
		right: 40rpx;
		bottom: 200rpx;
		width: 80rpx;
		height: 80rpx;
		z-index: 2;
	}

	.popup-content {
		width: 600rpx;
		padding-top: 40rpx;
		text-align: center;

		.text {
			font-size: 40rpx;
			font-weight: bold;
		}

		.content {
			width: 80%;
			margin: auto;
			margin-top: 40rpx;


		}

		.btn-item {
			width: 120rpx;
			height: 70rpx;
			margin-right: 40rpx;
			line-height: 70rpx;
			text-align: center;
			border-radius: 60rpx;
		}

		.submit-btn-item {
			background-color: #3370FF;
			color: #fff;
		}

		.cancel-btn-item {
			border: 1px solid #ddd;
		}
	}

	.no-login-banner {
		position: fixed;
		bottom: 138rpx;
		left: 19rpx;
		width: 702rpx;
		height: 84rpx;
		padding: 0 10rpx;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 102rpx;

		.login-icon {
			width: 64rpx;
			height: 64rpx;
			margin-right: 18rpx;
		}

		.login-text {
			font-size: 26rpx;
			color: #FFFFFF;
		}

		.login-btn {
			width: 170rpx;
			height: 64rpx;
			line-height: 64rpx;
			text-align: center;
			background: linear-gradient(180deg, #FF934B 0%, #FF4F17 100%);
			border-radius: 35rpx;
			font-size: 28rpx;
			color: #FFFFFF;
		}
	}


	@keyframes addToCart {
		0% {
			transform: translateX(100px);
			opacity: 0;
		}

		100% {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.cart-item-enter {
		animation: addToCart 0.5s ease-out forwards;
	}
</style>
<style lang="less">
	/deep/.search-input .uni-easyinput {
		width: 702rpx !important;
		margin: auto;
	}

	/deep/.search-input .is-input-border {
		// 使用/deep/对组件内样式修改
		border-radius: 60rpx !important;
	}

	/deep/.search-input .uni-easyinput__content-input {
		height: 70rpx !important;
	}

	/deep/.search-input .uni-easyinput__placeholder-class {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 28rpx;
		color: #858B9C;
		line-height: 40rpx;
	}

	/deep/.search-input .content-clear-icon {
		padding: 0 10rpx 0 26rpx;
	}

	/deep/.uni-popup {
		z-index: 9999 !important;
	}

	/deep/ swiper {
		height: 100%;
	}

	/deep/ .uniui-clear {
		color: #FF6617 !important;
	}

	/deep/ swiper-item {
		text-align: center;
		// background: #F7F8FA;
	}

	/deep/ .l-ball-wrapper {
		width: 100%;
	}
</style>