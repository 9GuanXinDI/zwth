<template>
	<view class="botton-banner flex-between safe-padding">
		<view @click="gotoPage('index')" :class="['banner-item',tabIndex==1?'banner-item-select':'']">
			<image src="../static/index-select.png" v-if="tabIndex==1" class="banner-img"></image>
			<image src="../static/index.png" v-else class="banner-img"></image>
			<view>首页</view>
		</view>
		<view @click="gotoPage('goodsCar')" :class="['banner-item',tabIndex==2?'banner-item-select':'']">
			<uni-badge class="uni-badge-left-margin" :text="value" absolute="rightTop" size="small">
				<image src="../static/car-select.png" v-if="tabIndex==2" class="banner-img"></image>
				<image src="../static/car.png" v-else class="banner-img"></image>
				<view>购物车</view>
			</uni-badge>
		</view>
		<view @click="gotoPage('personal')" :class="['banner-item',tabIndex==3?'banner-item-select':'']">
			<image src="../static/my-select.png" v-if="tabIndex==3" class="banner-img"></image>
			<image src="../static/my.png" v-else class="banner-img"></image>
			<view>我的</view>
		</view>

	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import {
		computed
	} from '../uni_modules/lime-ball/components/l-ball/vue';
	export default {
		props: {
			tabIndex: {
				type: String,
				default: 1
			}
		},
		data() {
			return {
				value: computed(() => {
					user=useUserStore();
					return user.userInfo.goodsCarNum
				})
			}
		},
		onShow() {
			user=useUserStore();
		},
		mounted() {

		},
		methods: {
			gotoPage(page) {
				user = useUserStore();
				if (user.userInfo.userId) {
					uni.switchTab({
						url: `/pages/${page}/${page}`,
					});
				} else {
					uni.navigateTo({
						url: `/pageA/login/login`,
					})
				}
				user.userInfo.token&&this.getCarNum();
				user.setUserLoginState(false);

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
		}
	}
</script>

<style lang="scss" scoped>
	.botton-banner {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 98rpx;
		background-color: #fff;
		z-index: 900;

		.banner-item {
			display: inline-block;
			width: 33.33%;
			text-align: center;
			color: #7A7E83;
			font-size: 26rpx;
		}

		.banner-item-select {
			color: #FF6617;
		}

		.banner-img {
			width: 48rpx;
			height: 48rpx;
		}
	}

	.safe-padding {
		// padding-bottom: constant(safe-area-inset-bottom); /* 兼容iOS < 11.2 */
		// padding-bottom: env(safe-area-inset-bottom); /* 兼容iOS >= 11.2 */
		// box-sizing: content-box;
		padding-bottom: 30rpx;
		padding-top: 10rpx;
	}
</style>
<style lang="less" scoped>

</style>