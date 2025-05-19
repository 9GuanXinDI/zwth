<template>
	<view>
		<view class="order-item-address">
			<view class="flex-start" style="height: 100%;">
				<image src="../../assets/address-icon.png" class="address-icon"></image>
				<view>
					<view class="address">{{address}}</view>
					<view class="name-info mt-10">
						<text class="mr-10">{{name}}</text>
						<text>{{phone}}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="order-info-box">
			<view class="mt-10 flex-between order-info">
				<view class="flex-start" style="align-items: flex-start;margin-right: 10rpx;">
					<image :src="orderInfo.snapshots?.coverUrl" class="goods-img"></image>
					<view>
						<view class="info-name"><text
								class="mr-10">{{orderInfo.snapshots?.name}}</text><text>含{{orderInfo.count}}件应急物品</text>
						</view>
						<view class="info-desc">{{orderInfo.desc}}</view>
						<view class="order-money">
							<text class="money"><text class="symbol">￥</text>{{orderInfo.price}}</text>
						</view>
					</view>
				</view>
				<view v-if="orderInfo.snapshots?.num>1">x{{orderInfo.snapshots?.num}}</view>
			</view>
			<view class="flex-end">
				<view class="add-car-btn btn" @click="addShoppingCart">加入购物车</view>
				<!-- 已发货,十天内支持退货,十天后不支持 -->
				<view class="return-goods-btn btn" v-if="orderInfo.realStatus==2&&!isTimeout" @click="returnGoods">退货
				</view>
				<!-- 未发货,支持退款 -->
				<view class="return-goods-btn btn" v-if="orderInfo.realStatus==1" @click="returnMoney">退款</view>
				<!-- 未支付,去支付 -->
				<view v-if="orderInfo.realStatus==0" class="flex-start">
					<view class="return-goods-btn btn" @click="cancelOrder()">取消订单</view>
					<view class="return-goods-btn btn" :class="[isPayTimeout?'disable-pay-btn':'to-pay-btn']"
						@click="toPay">去支付</view>
					
				</view>
				<!-- 退货,取消退货 -->
				<view class="add-car-btn btn" v-if="orderInfo.realStatus==5" @click="cancelReturn">取消退款/退货</view>
			</view>
			<view class="order-detail">
				<view class="flex-between order-detail-item">
					<text class="label">付款金额</text>
					<text class="value" style="font-weight: bold;">￥{{orderInfo.price}}</text>
				</view>
				<view class="flex-between order-detail-item">
					<text class="label">订单编号</text>
					<text class="value">{{orderInfo.id}}</text>
				</view>
				<view class="flex-between order-detail-item">
					<text class="label">创建时间</text>
					<text class="value">{{orderInfo.createTime}}</text>
				</view>
				<view class="flex-between order-detail-item">
					<text class="label">支付时间</text>
					<text class="value">{{orderInfo.payTime}}</text>
				</view>
			</view>
		</view>
		<view class="bottom-box" v-if="orderInfo.realStatus==2&&!isTimeout">
			<view class="sure-recive-btn" @click="confirmGoods">确认收货</view>
		</view>
		<!-- 退货弹窗 -->
		<uni-popup ref="returnPopup" background-color="#fff">
			<view style="padding-bottom: 40rpx;">
				<view class="return-title">退货原因</view>
				<uni-icons type="closeempty" size="20" class="close-icon" @click="close"></uni-icons>
				<view>
					<uni-easyinput type="textarea" v-model="reason" placeholder="请输入退货原因"></uni-easyinput>
					<view class="return-btn" @click="sureReturn">确认退货</view>
				</view>
			</view>
		</uni-popup>
		<!-- 退款弹窗 -->
		<uni-popup ref="returnMoneyPopup" background-color="#fff">
			<view style="padding-bottom: 40rpx;">
				<view class="return-title">退款原因</view>
				<uni-icons type="closeempty" size="20" class="close-icon" @click="close"></uni-icons>
				<view>
					<uni-easyinput type="textarea" v-model="reason" placeholder="请输入退款原因"></uni-easyinput>
					<view class="return-btn" @click="sureReturn">确认退款</view>
				</view>
			</view>
		</uni-popup>
		<!-- 确认收货弹窗 -->
		<uni-popup ref="confirmPopup" background-color="#fff">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="确认收货" content="点击确认收货后将不支持退货,确认收货吗?"
				@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="cancelDialog" type="dialog">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="警告" content="确认取消当前订单吗?"
				@confirm="dialogCancel" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
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
				isPayTimeout: false
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.getOrderDetail();
		},
		methods: {
			/**
			 * @name 获取订单详情
			 */
			async getOrderDetail() {
				const res = await API.getOrderDetailApi(this.id);
				this.orderInfo = res.data;
				let val = res.data.snapshots.address.addressInfo;
				this.address = val.split('/').join('');
				this.name = res.data.snapshots.address.name;
				this.phone = res.data.snapshots.address.phone;
				// 判断是否超时(十天)
				this.isTimeout = this.judgeIsTimeout(10, this.orderInfo.sendTime);
				// 判断支付是否超时(两天-48小时);
				this.isPayTimeout = this.judgeIsTimeout(2, this.orderInfo.createTime);
			},
			/**
			 * @name 判断是否超时
			 */
			judgeIsTimeout(num, time) {
				// 创建一个表示当前日期的Date对象
				var currentDate = new Date();
				// 比较日期
				var compareDate = new Date(time);
				// 计算两个日期之间的时间差（以毫秒为单位）
				var timeDifference = currentDate - compareDate;

				// 将时间差转换为天数
				var dayDifference = timeDifference / (1000 * 60 * 60 * 24);
				// 判断是否超过十天
				return dayDifference > num
			},
			/**
			 * @name 退款
			 */
			returnMoney() {
				this.$refs.returnMoneyPopup.open('bottom');
			},
			/**
			 * @name 取消退款
			 */
			async cancelReturn() {
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				const res = await API.cancelReturnApi(this.id);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '取消成功',
						icon: 'success',
						duration: 2000
					})
					this.getOrderDetail();
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
			 * @name 确认收货
			 */
			confirmGoods() {
				this.$refs.confirmPopup.open();
			},
			/**
			 * @name 确认收货
			 */
			async dialogConfirm() {
				uni.showLoading({
					title: '加载中',
					mask: true
				});

				// wx.openBusinessView({
				// 	businessType:'friendGoodsRecommend',
				// 	extraData:{
				// 		transaction_id:this.orderInfo.transactionId,
				// 		merchant_trade_no:this.orderInfo.id
				// 	},
				// 	success(res) {
				// 		console.log('success:'+res)
				// 	    },
				// 	    fail(error) {
				// 	     console.log('error:'+JSON.stringify(error))
				// 	    },
				// })




				const res = await API.confirmGoodsApi(this.id);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '确认成功',
						icon: 'success',
						duration: 2000
					})
					this.getOrderDetail();
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
			 * @name 加入购物车
			 */
			async addShoppingCart(item) {
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				const res = await API.addGoodsCarApi({
					goodsId: this.orderInfo.goodsId,
					total: 1
				});
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '加购成功',
						icon: 'success',
						duration: 2000
					})

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
			 * @name 取消订单
			 */
			cancelOrder() {
				this.$refs.cancelDialog.open();
			},
			/**
			 * @name 取消订单
			 */
			async dialogCancel() {
				uni.showLoading({title: '加载中',mask:true});
				const res = await API.cancelOrderApi(this.id);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '取消成功',
						duration: 1000 //单位毫秒
					});
					this.getOrderDetail();
					this.dialogClose();
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
			 * @name 退货
			 */
			returnGoods() {
				this.$refs.returnPopup.open('bottom');
			},
			/**
			 * @name 确认退货
			 */
			async sureReturn() {
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				const res = await API.returnGoodsApi({
					orderId: this.id,
					reason: this.reason
				});
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '已提交，请稍后',
						icon: 'success',
						duration: 2000
					})
					this.reason = "";
					this.$refs.returnMoneyPopup && this.$refs.returnMoneyPopup.close();
					this.$refs.returnPopup && this.$refs.returnPopup.close();
					this.getOrderDetail();

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
			 * @name 关闭退货理由
			 */
			close() {
				this.reason = "";
				this.$refs.returnMoneyPopup && this.$refs.returnMoneyPopup.close();
				this.$refs.returnPopup && this.$refs.returnPopup.close();
			},
			/**
			 * @name 去付款
			 */
			async toPay() {
				if (!this.isPayTimeout) {
					uni.showLoading({
						title: '加载中',
						mask: true
					});
					const res = await API.orderNowPayApi(this.id);
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
									url: `/pageA/orderList/orderList?type=1`
								})
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
				} else {
					uni.showToast({
						title: '支付超时',
						icon: 'none',
						duration: 2000
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.order-item-address {
		height: 160rpx;
		margin: 0 24rpx;
		background: #FFFFFF;
		border-radius: 10rpx 10rpx 10rpx 10rpx;

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
		height: 598rpx;
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
			min-width: 254rpx;
			height: 44rpx;
			line-height: 44rpx;
			margin-top: 18rpx;
			text-align: center;
			background: #F0F0F0;
			border-radius: 2rpx;
			font-size: 24rpx;
			color: #909090;
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
		width: 200rpx;
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
		top: 0;
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