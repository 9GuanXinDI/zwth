<template>
	<view>
		<view class="order-item-address" @click="changeAddress">
			<view class="flex-start" style="height: 100%;">
				<image src="../../assets/address-icon.png" class="address-icon"></image>
				<view v-if="address">
					<view class="address">{{address}}</view>
					<view class="name-info mt-10">
						<text class="mr-10">{{name}}</text>
						<text>{{phone}}</text>
					</view>
				</view>
				<view v-else style="color:#909090;">请选择收货地址</view>
			</view>
			<uni-icons type="right" size="16" style="color:#999" class="icon"></uni-icons>
		</view>
		<view class="order-info-box">
			<view class="mt-10 flex-between order-info">
				<view class="flex-start" style="align-items: flex-start;margin-right: 10rpx;">
					<image :src="goodsInfo.coverUrl" class="goods-img"></image>
					<view>
						<view class="info-name"><text
								class="mr-10">{{goodsInfo.name}}</text><text>含{{goodsInfo.num}}件应急物品</text>
						</view>
						<view class="info-desc">{{goodsInfo.desc}}</view>
					</view>
				</view>
				<view>￥{{goodsInfo.price}}</view>
			</view>
			<view class="order-detail flex-end">
				<view @tap.stop.prevent>
					<uni-number-box :min="1" :value="goodsInfo.total" @change.stop="changeGoods($event)" />
				</view>
			</view>
		</view>

		<view class="info-bottom flex-end">
			<view class="num">共{{goodsInfo.total}}件</view>
			<view class="price">合计：<text style="color:#FF6617;">￥</text><text class="money"
					style="color:#FF6617;">{{(goodsInfo.price*goodsInfo.total).toFixed(2)}}</text></view>
			<view class="buy-btn" @click="buy">提交订单</view>
		</view>

		<!-- 		<uni-popup ref="popup" background-color="#fff" :is-mask-click="false">
			<uni-icons type="closeempty" size="20" class="close-icon" @click="cancelSelect"></uni-icons>
			<view class="modal-text">选择收货地址</view>
			<view class="address-container">
				<view class="address-item" v-for="(item,index) in addressList" :key="index"
					:class="[item.isSelect?'address-item-select':'']" @click="selectAddress(item)">
					<view class="flex-start">
						<view :class="[item.isSelect?'radio-icon-select':'radio-icon']">
						</view>
						<view>
							<view class="address-name">{{item.addressInfo?.split(',').join('')}}</view>
							<view class="address-desc">{{item.detail}}</view>
							<view class="user-info"><text class="mr-10">{{item.name}}</text>
								<text>{{item.phone}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="flex-center">
					<view class="btn-opt cancel-btn" @click="cancelSelect">取消</view>
					<view class="btn-opt confirm-btn" @click="confirmSelect">确定</view>
				</view>
			</view>
		</uni-popup> -->
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	export default {
		data() {
			return {
				id: '',
				address: '',
				name: '',
				phone: '',
				orderInfo: {},
				reason: '',
				isTimeout: false,
				isPayTimeout: false,

				addressId: '',
				type: 1,
				total: 1,
				carId: '',
				addressInfo: {},
				goodsInfo: {},
				addressList: []
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.total = options.total;
			this.type = options.type;
			this.carId = options.carId || '';
			user = useUserStore();
			// this.getAddressList();
			this.getGoodsDetail();
		},
		onShow() {
			this.getAddressList();
		},
		methods: {
			/**
			 * @name 获取地址列表
			 */
			async getAddressList() {
				const res = await API.getAddressListApi();
				if (res.code == 200) {
					let list = res.data;
					this.addressList = list.map((item) => {
						return {
							...item,
							isSelect: item.defual == 1
						}
					});
					this.addressInfo={};
					if(!this.addressId){
						let obj = list.filter((item) => item.defual == 1)[0];
						if (obj) {
							this.addressInfo = obj;
						} else if (list.length > 0) {
							this.addressInfo = list[0];
						}
						if (Object.keys(this.addressInfo).length>0) {
							this.addressId = this.addressInfo.id;
							this.address = this.addressInfo.addressInfo.split(',').join('');
							this.name = this.addressInfo.name;
							this.phone = this.addressInfo.phone;
						}else{
							this.addressId = '';
							this.address = '';
							this.name = '';
							this.phone = '';
						}
					}else{
						this.getAddressInfo(this.addressId)
					}
					

				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 获取选中的地址信息
			 */
			async getAddressInfo(id) {
				const res = await API.addressDetailApi(id);
				if (res.code == 200) {
					this.addressInfo = res.data;
					this.addressId = this.addressInfo.id;
					this.address = this.addressInfo.addressInfo.split(',').join('');
					this.name = this.addressInfo.name;
					this.phone = this.addressInfo.phone;

				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 修改选中的地址
			 */
			changeAddress() {
				uni.navigateTo({
					url: `/pageA/addressManage/addressManage?addressId=` + this.addressId+'&isPay=1',
				});
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
					this.goodsInfo.total = this.total;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 加购和减购
			 */
			changeGoods(num) {
				this.goodsInfo.total = num;
			},
			/**
			 * @name 付款
			 */
			async buy() {
				if (Object.keys(this.addressInfo).length==0) {
					uni.showToast({
						title: '请先选择地址',
						icon: 'none',
						duration: 2000
					})
					return
				}
				uni.showLoading({title: '加载中',mask:true});
				
				let object = {
					addressInfo: this.addressInfo.addressInfo,
					detail: this.addressInfo.detail,
					name: this.addressInfo.name,
					phone: this.addressInfo.phone
				}
				let code='';
				if(user.userInfo.userCode){
					code=user.userInfo.userCode;
				}else{
					code=user.userInfo.goodsCode==user.userInfo.code?'':user.userInfo.goodsCode;
				}
				const res = await API.goodsBuyApi({
					consignee: JSON.stringify(object),
					goodsId: this.id,
					carId: this.carId,
					inviteCode: code,
					num: this.goodsInfo.total,
					type: this.type
				})
				if (res.code == 200) {
					let data = res.data;
					uni.hideLoading();
					uni.requestPayment({
						timeStamp: data.timeStamp,
						nonceStr: data.nonceStr,
						package: data.package,
						signType: data.signType,
						paySign: data.paySign,
						success: function(res) {
							uni.redirectTo({
								url: `/pageA/orderList/orderList?type=1`,
							});
						},
						fail: function(err) {
							console.error('支付失败', err);
						}
					});
				} else {
					uni.hideLoading();
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
			async selectAddress(item) {
				this.addressList.forEach((sitem) => {
					sitem.isSelect = false;
					if (sitem.id == item.id) {
						sitem.isSelect = true;
					}
				});
			},
			/**
			 * @name 取消选择地址
			 */
			cancelSelect() {
				this.$refs.popup.close();
			},
			/**
			 * @name 确认选择地址
			 */
			confirmSelect() {
				this.addressInfo = this.addressList.filter((item) => item.isSelect == true)[0];
				this.address = this.addressInfo.addressInfo.split(',').join('');
				this.name = this.addressInfo.name;
				this.phone = this.addressInfo.phone;
				this.$refs.popup.close();
			}

		}
	}
</script>

<style lang="scss" scoped>
	.order-item-address {
		position: relative;
		height: 160rpx;
		margin: 0 24rpx;
		background: #FFFFFF;
		border-radius: 10rpx 10rpx 10rpx 10rpx;

		.icon {
			position: absolute;
			top: 50%;
			right: 40rpx;
			transform: translate(0, -50%);
		}

		.address-icon {
			width: 50rpx;
			height: 50rpx;
			margin-left: 40rpx;
			margin-right: 20rpx;
		}

		.address {
			font-size: 28rpx;
			color: #1A1A1A;
		}

		.name-info {
			font-size: 22rpx;
			color: #909090;
		}
	}

	.order-info-box {
		height: 430rpx;
		margin: 20rpx 24rpx;
		background: #FFFFFF;
		border-radius: 10rpx 10rpx 10rpx 10rpx;

		.order-info {
			padding: 30rpx 24rpx;
		}

		.goods-img {
			width: 190rpx;
			height: 190rpx;
			margin-right: 20rpx;
			border-radius: 5rpx;
		}

		.info-name {
			font-size: 28rpx;
			color: #1A1A1A;
		}

		.info-desc {
			width: 254rpx;
			line-height: 44rpx;
			margin-top: 18rpx;
			text-align: left;
			font-size: 24rpx;
			color: #909090;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: normal;
		}

		.num-text {
			font-size: 24rpx;
			color: #909090;

			.num {
				color: #1A1A1A;
			}
		}

		.order-money {
			margin-top: 40rpx;

			.money {
				color: #1A1A1AFF;
				font-size: 38rpx;
			}

			.symbol {
				font-size: 24rpx;
			}
		}
	}

	.btn {
		height: 60rpx;
		margin-right: 30rpx;
		text-align: center;
		line-height: 60rpx;
		background: #FFFFFF;
		border-radius: 30rpx;
		border: 1rpx solid #EBEBEB;
		font-size: 26rpx;
		color: #1A1A1A;
	}

	.add-car-btn {
		width: 180rpx;
	}

	.return-goods-btn {
		width: 156rpx;
	}

	.disable-pay-btn {
		background-color: #ccc;
		color: #fff;
	}

	.to-pay-btn {
		background-color: #FF6617;
		color: #fff;
	}

	.order-detail {
		padding: 30rpx 24rpx;

		.order-detail-item {
			margin-bottom: 26rpx;

			.label {
				font-size: 24rpx;
				color: #909090;
			}

			.value {
				font-size: 26rpx;
				color: #1A1A1A;
			}
		}
	}

	.bottom-box {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;

		.sure-recive-btn {
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

	.return-title {
		margin-top: 30rpx;
		text-align: center;
		font-weight: bold;
		font-size: 28rpx;
		color: #1A1A1A;
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 30rpx;
	}

	.return-btn {
		width: 640rpx;
		height: 90rpx;
		margin: 83rpx 55rpx 0 55rpx;
		text-align: center;
		line-height: 90rpx;
		background: #FF6617;
		border-radius: 45rpx 45rpx 45rpx 45rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #FFFFFF;
	}


	.info-bottom {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;

		.num {
			margin-right: 10rpx;
			font-size: 24rpx;
			color: #909090;
		}

		.price {
			margin-right: 10rpx;
			font-size: 30rpx;

			.money {
				font-size: 38rpx;
				;
			}
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


	.address-container {
		padding-top: 80rpx;
		padding-bottom: 30rpx;
	}

	.address-item {
		margin: 30rpx 24rpx;
		padding: 30rpx 20rpx 30rpx 0;
		background: #FFFFFF;
		border-radius: 10rpx;
		border: 2rpx solid #D6D6D6;

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
	}

	.address-item-select {
		border: 2rpx solid #FF6617;
	}

	.modal-text {
		position: absolute;
		top: 20rpx;
		left: 50%;
		transform: translate(-50%, 0);
	}

	.btn-opt {
		width: 200rpx;
		height: 70rpx;
		text-align: center;
		line-height: 70rpx;
		border-radius: 10rpx;
	}

	.cancel-btn {
		margin-right: 40rpx;
		border: 2rpx solid #D6D6D6;
	}

	.confirm-btn {
		background-color: #FF6617;
		color: #fff;
	}
</style>
<style lang="less" scoped>
	/deep/.uni-easyinput {
		width: calc(100% - 48rpx) !important;
		margin: 40rpx 24rpx 0 24rpx;
	}

	/deep/.is-input-border {
		height: 290rpx !important;
		border: 0 !important;
		background: #FAFAFA !important;
	}

	/deep/.uni-easyinput__content-textarea {
		height: 100% !important;
		padding-top: 30rpx;
	}
</style>