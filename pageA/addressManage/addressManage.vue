<template>
	<view>
		<view style="padding-bottom: 130rpx;">
			<view class="address-item" v-for="(item,index) in addressList" :key="index">
				<view class="flex-between">
					<view>
						<view class="address-name">{{item.addressInfo?.split(',').join('')}}</view>
						<view class="address-desc">{{item.detail}}</view>
						<view class="user-info"><text class="mr-10">{{item.name}}</text>
							<text>{{item.phone}}</text>
						</view>
					</view>
					<view :class="[item.isSelect?'radio-icon-select-v':'radio-icon']" @click="changeAddress(item)" v-if="isPay==1">
					</view>
				</view>
				<view class="option-box flex-between">
					<view class="flex-start">
						<view :class="[item.isDefual?'radio-icon-select':'radio-icon']" @click="selectAddress(item)">
						</view>
						<text :style="item.isDefual?'color:#FF6617;':''">默认</text>
					</view>
					<view class="flex-end">
						<image src="../../assets/modify-icon.png" class="modify-img" @click="modifyAddress(item)">
						</image>
						<image src="../../assets/modify-delete.png" class="modify-img" @click="deleteAddress(item)">
						</image>
					</view>
				</view>

			</view>
		</view>
		<view class="bottom-box">
			<view class="add-address-btn" @click="addAddress">新增地址</view>
		</view>
		<sure-login v-if="isShowLogin" @close-login="closeLogin"></sure-login>
		<uni-popup ref="confirmPopup" background-color="#fff">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="" content="确认删除该地址吗?"
				@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import sureLogin from "@/components/sureLogin.vue"
	export default {
		components: {
			sureLogin
		},
		data() {
			return {
				userId: '',
				id: '',
				isShowLogin: false,
				addressList: [],
				addressId:'',
				isPay:''
			}
		},
		onLoad(options) {
			this.addressId=options.addressId;
			this.isPay=options.isPay;
			user = useUserStore();
			this.userId = user.userInfo.userId;
			this.getAddressList();
		},
		mounted() {
			this.getAddressList();
		},
		methods: {
			/**
			 * @name 取消登录
			 */
			closeLogin() {
				this.isShowLogin = false;
			},
			/**
			 * @name 获取地址列表
			 */
			async getAddressList() {
				const res = await API.getAddressListApi();
				if (res.code == 200) {
					this.addressList = res.data.map((item) => {
						return {
							...item,
							isDefual: item.defual==1,
							isSelect:item.id==this.addressId
						}
					});
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 新增地址
			 */
			addAddress() {
				if (!this.userId) {
					this.isShowLogin = true;
				} else {
					uni.navigateTo({
						url: `/pageA/addAddress/addAddress`
					});
				}
			},
			/**
			 * @name 选择地址
			 */
			async selectAddress(item) {
				this.addressList.forEach((sitem) => {
					sitem.isDefual = false;
					if (sitem.id == item.id) {
						sitem.isDefual = true;
					}
				});
				const res = await API.defualAddressApi(item.id);
				if (res.code == 200) {
					uni.showToast({
						title: '设置成功',
						icon: 'success',
						duration: 2000
					})
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 选择地址
			 */
			changeAddress(item){
				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2];
				if (prevPage && prevPage.$vm && prevPage.$vm.getAddressInfo) {
				    prevPage.$vm.getAddressInfo(item.id);
				}
				uni.navigateBack();
			},
			/**
			 * @name 删除地址
			 */
			deleteAddress(item) {
				if(item.id==this.addressId){
					this.addressId='';
					let pages = getCurrentPages();
					let prevPage = pages[pages.length - 2];
					if (prevPage && prevPage.$vm) {
					    prevPage.$vm.addressId='';
					}
				}
				this.id = item.id;
				this.$refs.confirmPopup.open();
			},
			/**
			 * @name 确认删除
			 */
			async dialogConfirm() {
				const res = await API.deleteAddressApi(this.id);
				if (res.code == 200) {
					uni.showToast({
						title: '删除成功',
						icon: 'success',
						duration: 2000
					})
					this.getAddressList();
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 修改当前地址
			 */
			modifyAddress(item) {
				uni.navigateTo({
					url: `/pageA/addAddress/addAddress?id=` + item.id
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.address-item {
		margin: 30rpx 24rpx;
		padding: 30rpx 20rpx 0 20rpx;
		background: #FFFFFF;
		border-radius: 10rpx;

		.radio-icon {
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: #fff;
			border: 2rpx solid #D6D6D6;
			border-radius: 50%;
		}

		.radio-icon-select {
			position: relative;
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: #fff;
			border: 2rpx solid #FF6617;
			border-radius: 50%;
		}

		.radio-icon-select::after {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			content: '';
			display: block;
			width: 20rpx;
			height: 20rpx;
			background-color: #FF6617;
			border-radius: 50%;
		}
		.radio-icon-select-v {
			position: relative;
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: #fff;
			border: 2rpx solid #49cc90;
			border-radius: 50%;
		}
		
		.radio-icon-select-v::after {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			content: '';
			display: block;
			width: 20rpx;
			height: 20rpx;
			background-color: #49cc90;
			border-radius: 50%;
		}

		.address-name {
			font-size: 22rpx;
			color: #909090;
		}

		.address-desc {
			font-weight: bold;
			font-size: 28rpx;
			color: #000000;
		}

		.user-info {
			margin-top: 8rpx;
			color: #000000;
			font-size: 22rpx;
		}

		.modify-img {
			width: 38rpx;
			height: 38rpx;
			margin-right: 30rpx;
		}
	}

	.bottom-box {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;

		.add-address-btn {
			width: 702rpx;
			height: 80rpx;
			margin: 15rpx auto;
			text-align: center;
			line-height: 80rpx;
			background: #FF6617;
			border-radius: 40rpx;
			font-size: 30rpx;
			color: #FFFFFF;
		}
	}

	.option-box {
		width: 100%;
		height: 70rpx;
		margin-top: 30rpx;
		border-top: 1px solid #EBEBEB;
	}
</style>