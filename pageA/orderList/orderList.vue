<template>
	<view>
		<view class="tab-box">
			<!-- 0待付款 1待发货 2已发货 3已完成 4交易关闭 5待退货审核 6已退款 -->
			<text class="tab-item" @click="changeType('')" :class="[type===''?'tab-item-select':'']">全部</text>
			<text class="tab-item" @click="changeType(1)" :class="[type===1?'tab-item-select':'']">待发货</text>
			<text class="tab-item" @click="changeType(0)" :class="[type===0?'tab-item-select':'']">待付款</text>
			<text class="tab-item" @click="changeType(2)" :class="[type===2?'tab-item-select':'']">已发货</text>
			<text class="tab-item" @click="changeType(6)" :class="[type===6?'tab-item-select':'']">已退款</text>
		</view>

		<view class="order-box">
			<view v-if="orderList.length>0">
				<view class="order-item" v-for="(item,index) in orderList" :key="index" @click="goToOrderDetail(item)">
					<view class="flex-between pt-10">
						<view class="create-time">{{item.createTime}}</view>
						<view class="status" :class="[[0,1,5].indexOf(item.realStatus)>-1?'stall-status':'']">
							{{getTextByStatus(item.realStatus)}}
						</view>
					</view>
					<view class="mt-10 flex-between">
						<view class="flex-start" style="align-items: flex-start;margin-right: 10rpx;">
							<image :src="item.snapshots.coverUrl" class="goods-img"></image>
							<view>
								<view class="info-name"><text
										class="mr-10">{{item.snapshots.name}}</text><text>含{{item.count}}件应急物品</text>
								</view>
								<view class="info-desc">{{item.desc}}</view>
							</view>
						</view>
						<view v-if="item.snapshots.num>1">x{{item.snapshots.num}}</view>
					</view>
					<view class="mt-10 flex-between">
						<view class="num-text">共<text class="num">{{item.snapshots.num}}</text>件</view>
						<view class="money-text">应付总额:<text class="money"><text
									class="symbol">￥</text>{{item.price}}</text>
						</view>
					</view>
					<view class="flex-end">
						<view v-if="item.realStatus==2" class="return-goods" @click.stop="returnGoods(item)">退货</view>
						<view v-else-if="item.realStatus==1" class="return-goods" @click.stop="returnMoney(item)">退款</view>
						<view v-else-if="item.realStatus==4||item.realStatus==3" class="return-goods"
							@click.stop="deleteOrder(item)">删除订单</view>
					
						<view v-else-if="item.realStatus==5" class="cancel-continus-pay" @click.stop="cancelReturn(item)">取消退货/退款
						</view>
						<view v-else-if="item.realStatus==0" class="flex-end">
						<view class="cancel-dd" @click.stop="cancelOrder(item)">取消订单
						</view>
						<view :class="[!judgeIsTimeout(2, item.createTime)?'continus-pay':'disable-continus-pay']" @click.stop="continusPay(item)">继续付款
						</view>
						</view>
						
					</view>
				</view>
				<uni-load-more :status="statusType"></uni-load-more>
			</view>
			<view v-else class="no-data">
				<image src="../../assets/no-data.png" class="no-data-img"></image>
				<view class="no-data-text">暂无数据</view>
			</view>
		</view>
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="警告" content="确认删除当前订单吗?"
				@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="cancelDialog" type="dialog">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="警告" content="确认取消当前订单吗?"
				@confirm="dialogCancel" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popup" background-color="#fff">
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
				currentPage: 1,
				type: '',
				total: 0,
				orderId: '',
				reason: '',
				statusType: 'noMore',
				orderList: []
			}
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
			if (allTotal < this.total) {
				this.statusType = "loading";
				this.currentPage++;
				this.getSysOrderList(); //请求更多数据列表
			} else {
				this.statusType = "noMore";
			}
		},
		onLoad(options) {
			this.type = options.type ? JSON.parse(options.type) : '';
			user = useUserStore();
			this.orgId = user.userInfo.orgId;
			// this.getSysOrderList();
		},
		onShow(){
			this.handleSearch();
		},
		methods: {
			/**
			 * @name 切换类型
			 */
			changeType(type) {
				this.type = type;
				uni.pageScrollTo({
					scrollTop: 0, // 滚动到页面的顶部
					duration: 300 // 滚动动画的持续时间，单位为ms
				});
				this.handleSearch();
			},
			/**
			 * @name 刷新
			 */
			handleSearch() {
				this.orderList = [];
				this.currentPage = 1;
				this.getSysOrderList();
			},
			/**
			 * @name 根据状态返回文字
			 */
			getTextByStatus(status) {
				switch (status) {
					case 0:
						return "待付款";
					case 1:
						return "待发货 ";
					case 2:
						return "已发货";
					case 3:
						return "已完成";
					case 4:
						return "交易关闭";
					case 5:
						return "待退款审核";
					case 6:
						return "已退款";
				}
			},
			/**
			 * @name 获取订单列表
			 */
			async getSysOrderList() {
				let params = {
					currentPage: this.currentPage,
					pageSize: 20,
					type: this.type
				};
				const res = await API.getSysOrderApi(params);
				if (res.code == 200) {
					this.orderList = this.orderList.concat(res.data.list);
					this.total = res.data.allTotal;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 删除订单
			 */
			deleteOrder(item) {
				this.orderId = item.id;
				this.$refs.alertDialog.open();
			},
			/**
			 * @name 取消订单
			 */
			cancelOrder(item) {
				this.orderId = item.id;
				this.$refs.cancelDialog.open();
			},
			/**
			 * @name 取消订单
			 */
			async dialogCancel() {
				uni.showLoading({title: '加载中',mask:true});
				const res = await API.cancelOrderApi(this.orderId);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '取消成功',
						duration: 1000 //单位毫秒
					});
					this.handleSearch();
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
			 * @name 删除
			 */
			async dialogConfirm() {
				uni.showLoading({title: '加载中',mask:true});
				const res = await API.deleteOrderApi(this.orderId);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '删除成功',
						duration: 1000 //单位毫秒
					});
					this.handleSearch();
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
			dialogClose() {},
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
			 * @name 去付款
			 */
			async continusPay(item) {
				if(!this.judgeIsTimeout(2, item.createTime)){
					uni.showLoading({title: '加载中',mask:true});
					const res = await API.orderNowPayApi(item.id);
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
				}else{
					uni.showToast({
						title: '支付超时',
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 退货
			 */
			returnGoods(item) {
				this.orderId = item.id;
				this.$refs.popup.open('bottom');
			},
			/**
			 * @name 退款
			 */
			returnMoney(item) {
				this.orderId = item.id;
				this.$refs.returnMoneyPopup.open('bottom');
			},
			/**
			 * @name 关闭退货理由
			 */
			close() {
				this.reason="";
				this.$refs.returnMoneyPopup && this.$refs.returnMoneyPopup.close();
				this.$refs.returnPopup && this.$refs.returnPopup.close();
			},
			/**
			 * @name 查看订单详情
			 */
			goToOrderDetail(item) {
				uni.navigateTo({
					url: `/pageA/orderInfo/orderInfo?id=` + item.id
				});
			},
			/**
			 * @name 确认退货
			 */
			async sureReturn() {
				uni.showLoading({title: '加载中',mask:true});
				const res = await API.returnGoodsApi({
					orderId: this.orderId,
					reason: this.reason
				});
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '已提交，请稍后',
						icon: 'success',
						duration: 2000
					})
					this.reason="";
					this.$refs.returnMoneyPopup && this.$refs.returnMoneyPopup.close();
					this.$refs.popup && this.$refs.popup.close();
					this.handleSearch();
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
			 * @name 取消退款
			 */
			async cancelReturn(item) {
				uni.showLoading({title: '加载中',mask:true});
				const res = await API.cancelReturnApi(item.id);
				if (res.code == 200) {
					uni.hideLoading();
					uni.showToast({
						title: '取消成功',
						icon: 'success',
						duration: 2000
					})
					this.handleSearch();
				} else {
					uni.hideLoading();
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
	.tab-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 80rpx;
		// padding: 0 24rpx;
		line-height: 80rpx;
		background-color: #fff;

		.tab-item {
			display: inline-block;
			width:20%;
			text-align: center;
			// padding-bottom: 14rpx;
			// margin-right: 50rpx;
		}

		.tab-item-select {
			color: #FF6617;
			font-weight: bold;
			border-bottom: 6rpx solid #FF6617;
		}
	}

	.order-box {
		margin-top: 100rpx;
		padding: 0 24rpx;
	}

	.order-item {
		height: 452rpx;
		padding: 0 20rpx;
		margin-bottom: 20rpx;
		background: #fff;
		border-radius: 10rpx;

		.create-time {
			font-size: 28rpx;
			color: #909090;
		}

		.status {
			font-size: 28rpx;
			color: #1A1A1A;
		}

		.stall-status {
			color: #FF6617;
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

		.money-text {
			font-size: 24rpx;
			color: #909090;

			.money {
				color: #1A1A1A;
				font-size: 28rpx;
			}

			.symbol {
				color: #1A1A1A;
				font-size: 24rpx;
			}
		}

		.return-goods {
			width: 160rpx;
			height: 64rpx;
			margin-top: 24rpx;
			text-align: center;
			line-height: 64rpx;
			background: #FFFFFF;
			border-radius: 32rpx;
			border: 1rpx solid #D6D6D6;
			font-size: 26rpx;
			color: #1A1A1A;
		}

		.continus-pay {
			width: 160rpx;
			height: 64rpx;
			margin-top: 24rpx;
			text-align: center;
			line-height: 64rpx;
			background: #FF6617;
			color: #fff;
			border-radius: 32rpx 32rpx 32rpx 32rpx;
			font-size: 26rpx;
		}
		.disable-continus-pay{
			width: 160rpx;
			height: 64rpx;
			margin-top: 24rpx;
			text-align: center;
			line-height: 64rpx;
			background-color: #ccc;
			border-radius: 32rpx 32rpx 32rpx 32rpx;
			font-size: 26rpx;
			color: #FFFFFF;
		}
		.cancel-continus-pay{
			width: 200rpx;
			height: 64rpx;
			margin-top: 24rpx;
			text-align: center;
			line-height: 64rpx;
			background: #FFFFFF;
			border-radius: 32rpx;
			border: 1rpx solid #D6D6D6;
			font-size: 26rpx;
			color: #1A1A1A;
		}
		.cancel-dd{
			width: 160rpx;
			height: 64rpx;
			margin-top: 24rpx;
			margin-right: 20rpx;
			text-align: center;
			line-height: 64rpx;
			background-color: #FFFFFF;
			border-radius: 32rpx 32rpx 32rpx 32rpx;
			font-size: 26rpx;
			border: 1rpx solid #D6D6D6;
			color: #1A1A1A;
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