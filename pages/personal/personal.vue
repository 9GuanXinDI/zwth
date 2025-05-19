<template>
	<view class="personal-container">
		<view class="user-info-box">
			<image src="../../assets/person-bg.png" class="personal-bg"></image>
			<view class="user-info flex-between">
				<view>
					<!-- <view v-if="userId" class="flex-start"> -->
					<!-- <image src="../../assets/user-icon.png" class="avatar-icon"></image> -->
					<view class="user-name" v-if="userId">{{userInfo.name}}</view>
					<!-- </view> -->
					<view class="user-name" v-else @click="login">点击登录</view>
					<view class="money-box">
						<image src="../../assets/money-bar.png" class="money-img"></image>
						<view class="text"><text>佣金</text><text class="money">{{userInfo.commission||0}}</text></view>
					</view>
				</view>
				<image :src="userInfo.img" class="avatar-icon" v-if="userInfo.img"></image>
				<image src="../../assets/user-icon.png" class="avatar-icon" v-else></image>
			</view>
			<view class="role-box">

				<view class="container">
					<image src="../../assets/role-banner.png" class="role-img"></image>
					<text v-if="userInfo.role==8" class="role-text">您当前为普通会员，成为爱心会员赚取推广佣金</text>
					<text v-else-if="userInfo.role==7" class="role-text">您当前为爱心会员，快快推广产品赚取佣金吧~</text>
					<text v-else-if="userInfo.role==6" class="role-text">你当前为推广员，快快推广产品赚取佣金吧~</text>
					<image src="../../assets/question.png" class="question-img" v-if="userInfo.role==8"
						@click="messageToggle"></image>
				</view>
			</view>
		</view>
		<view class="personal-content">
			<view class="order-box">
				<view class="flex-between order-title">
					<view class="left">我的订单</view>
					<view class="right flex-start" @click="gotoOrderList('')">
						全部订单
						<uni-icons type="right" size="14" style="color:#909090;"></uni-icons>
					</view>
				</view>
				<view>
					<view class="order-item" @click="gotoOrderList(1)">
						<uni-badge class="uni-badge-left-margin" :text="obj.notSend" absolute="rightTop" size="small">
							<image src="../../assets/daifahuo.png" class="order-item-img"></image>
							<view>待发货</view>
						</uni-badge>

					</view>
					<view class="order-item" @click="gotoOrderList(0)">
						<uni-badge class="uni-badge-left-margin" :text="obj.notPay" absolute="rightTop" size="small">
							<image src="../../assets/daifukuan.png" class="order-item-img"></image>
							<view>待付款</view>
						</uni-badge>
						
					</view>
					<view class="order-item" @click="gotoOrderList(2)">
						<uni-badge class="uni-badge-left-margin" :text="obj.notGet" absolute="rightTop" size="small">
							<image src="../../assets/yifahuo.png" class="order-item-img"></image>
							<view>待收货</view>
						</uni-badge>
						
					</view>
					<view class="order-item" @click="gotoOrderList(6)">
							<image src="../../assets/yituikuan.png" class="order-item-img"></image>
							<view>已退款</view>
					</view>
				</view>
			</view>
			<view class="list-box">
				<view class="list-item flex-between" style="border-bottom: 2rpx solid #D6D6D6;" @click="accountManage">
					<view>会员管理</view>
					<uni-icons type="right" size="14" style="color:#909090;"></uni-icons>
				</view>
				<view class="list-item flex-between" style="border-bottom: 2rpx solid #D6D6D6;" @click="companyManage">
					<view>公司管理</view>
					<uni-icons type="right" size="14" style="color:#909090;"></uni-icons>
				</view>
				<view class="list-item flex-between" style="border-bottom: 2rpx solid #D6D6D6;" @click="addressManage">
					<view>地址管理</view>
					<uni-icons type="right" size="14" style="color:#909090;"></uni-icons>
				</view>
				<view class="list-item flex-between" @click="passwordManage">
					<view>修改密码</view>
					<uni-icons type="right" size="14" style="color:#909090;"></uni-icons>
				</view>
			</view>
			<view class="login-box">
				<view @click="loginOut" v-if="userId">退出登录</view>
				<view @click="login" v-else>立即登录</view>
			</view>
		</view>
		<bottom-banner :tabIndex='3'></bottom-banner>
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="提示" content="确认退出当前登录吗"
				@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="message" type="message">
			<uni-popup-message type="warn" message="购买核心产品成为爱心会员" :duration="2000"></uni-popup-message>
		</uni-popup>
		<uni-popup ref="popup" background-color="#fff" :is-mask-click="false">
			<uni-icons type="closeempty" size="20" class="close-icon" @click="closePop"></uni-icons>
			<view class="title-password">修改密码</view>
			<view style="width:500rpx;padding:40rpx 50rpx;border:10rpx;">
				<uni-forms ref="baseForm" v-model="baseFormData" :rules="rules" style="width: 100%;">
					<uni-forms-item label="" name="phone">
						<view class="label" style="margin-bottom:10rpx">手机号</view>
						<uni-easyinput v-model="baseFormData.phone" placeholder="请输入您的手机号" />
					</uni-forms-item>
					<uni-forms-item label="" name="password">
						<view class="label" style="margin-bottom:10rpx">新密码</view>
						<uni-easyinput v-model="baseFormData.password" placeholder="请输入您的新密码" type="password" />
					</uni-forms-item>
					<button class="button login-btn" type="primary" @click="sureModifyPassword">确认修改</button>

				</uni-forms>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import Md5 from 'js-md5'
	import API from "@/request/index.js";
	import bottomBanner from "@/components/bottomBanner.vue"
	export default {
		components: {
			bottomBanner
		},
		data() {
			return {
				obj:{
					notGet:0,
					notPay:0,
					notSend:0
				},
				userId: '',
				userInfo: {},
				isLogin: false,
				baseFormData: {
					phone: '',
					password: ''
				},
				rules: {
					phone: {
						rules: [{
								required: true,
								errorMessage: '请输入手机号',
							},
							{
								validateFunction: function(rule, value, data, callback) {
									if (!(/^1[3456789]\d{9}$/.test(value))) {
										callback('手机号格式输入错误!');
									} else {
										callback();
									}
									return true
								}
							}
						]
					},
					password: {
						rules: [{
								required: true,
								errorMessage: '请输入密码',
							},
							{
								validateFunction: function(rule, value, data, callback) {
									let reg = /^[ ]+$/;
									let textReg = /^[\u4e00-\u9fa5]+$/;
									if (reg.test(value)) {
										callback("不支持输入空格");
									}
									if (textReg.test(value)) {
										callback("不支持输入中文");
									}
									return true
								}
							}
						]
					}
				},
			}
		},
		onShow() {
			user = useUserStore();
			if (!user.loginState) {
				this.userId = user.userInfo.userId;
				this.getUserInfo();
				user.userInfo.token&&this.getCarNum();
				this.getStatistics()
			}
		},
		onHide() {
			user = useUserStore();
			if (!user.userInfo.userId) {
				user.setUserLoginState(true)
			}
		},
		onPullDownRefresh() {
			let _this = this;
			uni.startPullDownRefresh({
				success() {
					_this.getUserInfo();
				},
				fail() {}
			})
			uni.stopPullDownRefresh();
		},
		methods: {
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
			 * @name 小程序各状态订单数量
			 */
			async getStatistics() {
				let params = {}
				const res = await API.statisticsApi(params);
				if (res.code == 200) {
					this.obj=res.data;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			
			/**
			 * @name 获取用户信息
			 */
			async getUserInfo() {
				const res = await API.getUserInfoApi();
				if (res.code == 200) {
					this.userInfo = res.data;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}

			},
			/**
			 * @name 提示
			 */
			messageToggle() {
				this.$refs.message.open()
			},
			/**
			 * @name 登录
			 */
			login() {
				uni.navigateTo({
					url: `/pageA/login/login`
				});
			},
			/**
			 * @name 退出登录
			 */
			loginOut() {
				this.msgType = 'warn'
				this.$refs.alertDialog.open();
			},
			/**
			 * @name 确认退出
			 */
			dialogConfirm() {
				user.setUserInfo({});
				user.setUserToken('');
				user.setGoodsCarInfo(false, [], '');
				uni.navigateTo({
					url: `/pageA/login/login`
				});
			},
			dialogClose() {
				console.log('点击关闭')
			},
			/**
			 * @name 查看订单管理
			 */
			gotoOrderList(type) {
				uni.navigateTo({
					url: `/pageA/orderList/orderList?type=` + type
				});
			},
			/**
			 * @name 账号管理
			 */
			accountManage() {
				uni.navigateTo({
					url: `/pageA/accountManage/accountManage`
				});
			},
			/**
			 * @name 公司管理
			 */
			companyManage(){
				uni.navigateTo({
					url: `/pageA/companyManage/companyManage`
				});
			},
			/**
			 * @name 地址管理
			 */
			addressManage() {
				uni.navigateTo({
					url: `/pageA/addressManage/addressManage`
				});
			},
			/**
			 * @name 密码管理
			 */
			passwordManage() {
				this.$refs.popup.open();
			},
			/**
			 * @name 关掉弹窗
			 */
			closePop() {
				this.baseFormData.password = '';
				this.baseFormData.phone = '';
				this.$refs.popup.close();
				this.$refs.baseForm.clearValidate(['password', 'phone']);
			},
			/**
			 * @name 确认修改密码
			 */
			sureModifyPassword() {
				this.$refs.baseForm.validate().then(async (res) => {
					if(user.userInfo.phonenumber!=this.baseFormData.phone){
						uni.showToast({
							title: '仅支持修改当前账号密码',
							icon: 'none',
							duration: 2000
						})
						return
					}
					API.forgetPwdApi({
							phone: this.baseFormData.phone,
							password: Md5(this.baseFormData.password)
						})
						.then((res) => {
							if (res.code == 200) {
								uni.showToast({
									title: '修改成功',
									icon: 'success',
									duration: 2000
								})
								this.closePop();
							} else {
								uni.showToast({
									title: res.message,
									icon: 'none',
									duration: 2000
								})
							}

						})
						.catch((error) => {
							uni.showToast({
								title: error.errMsg,
								icon: 'none',
								duration: 2000
							})
						})
				}).catch((error) => {

				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.personal-container {
		padding-bottom: 148rpx;
	}

	.user-info-box {
		position: relative;
		height: 440rpx;

		.personal-bg {
			width: 100%;
			height: 100%;
		}

		.user-info {
			position: absolute;
			left: 24rpx;
			top: 50%;
			right: 24rpx;
			transform: translate(0, -50%);
		}

		.avatar-icon {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
		}

		.user-name {
			margin-bottom: 20rpx;
			font-size: 40rpx;
			font-weight: bold;
			color: #1A1A1A;
		}

		.money-box {
			position: relative;
			width: 386rpx;
			height: 100rpx;

			.money-img {
				width: 100%;
				height: 100%;
			}

			.text {
				position: absolute;
				top: 50%;
				left: 120rpx;
				transform: translate(0, -50%);
				color: #7D5D41;
				font-size: 24rpx;

				.money {
					margin-left: 10rpx;
					font-size: 30rpx;
				}
			}
		}

		.role-box {
			position: absolute;
			left: 24rpx;
			bottom: -40rpx;
			width: 702rpx;
			height: 140rpx;

			.container {
				position: relative;
				width: 100%;
				height: 100%;
			}

			.role-img {
				width: 100%;
				height: 100%;
			}

			.role-text {
				position: absolute;
				left: 34rpx;
				bottom: 25rpx;
				font-size: 24rpx;
				color: #FFE1C7;
			}

			.question-img {
				position: absolute;
				top: 40rpx;
				right: 40rpx;
				width: 60rpx;
				height: 60rpx;
			}
		}
	}

	.personal-content {
		.order-box {
			height: 240rpx;
			margin: 70rpx 24rpx 24rpx 24rpx;
			background: #FFFFFF;
			border-radius: 10rpx;

			.order-title {
				padding: 20rpx 24rpx;

				.left {
					font-weight: bold;
					font-size: 28rpx;
					color: #1A1A1A;
				}

				.right {
					font-size: 24rpx;
					color: #909090;
				}
			}

			.order-item {
				display: inline-block;
				width: 25%;
				margin-top: 20rpx;
				text-align: center;
				font-size: 24rpx;
				color: #1A1A1A;

				.order-item-img {
					width: 80rpx;
					height: 80rpx;
					margin-bottom: 10rpx;
				}
			}
		}

		.list-box {
			min-height: 212rpx;
			margin: 0 24rpx 24rpx 24rpx;
			padding: 0 24rpx;
			background: #FFFFFF;
			border-radius: 10rpx 10rpx 10rpx 10rpx;

			.list-item {
				height: 104rpx;
				line-height: 104rpx;
				font-size: 28rpx;
				color: #1A1A1A;
			}
		}

		.login-box {
			height: 80rpx;
			margin: 0 24rpx 24rpx 24rpx;
			text-align: center;
			background: #FFFFFF;
			line-height: 80rpx;
			border-radius: 10rpx 10rpx 10rpx 10rpx;
		}
	}

	.lgout-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 10rpx;
	}

	.auth-title {
		padding: 30rpx 0;
		text-align: center;
		font-size: 32rpx;
		color: #000;
	}

	.auth-content {
		padding: 20rpx;
		font-size: 32rpx;
		color: #666;

	}

	.btn {
		margin: 20rpx 30rpx;
	}

	.login-btn {
		background-color: #FF6617 !important;
		color: #fff !important
	}

	.official-box {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 8889;
	}

	.code-img {
		width: 300rpx;
		height: 300rpx;
	}

	.title-password {
		padding: 20rpx;
		text-align: center;
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 30rpx;
		color: #909090 !important;
	}
	.avatar-icon {
		width: 120rpx;
		height: 120rpx;
		// margin-right: 20rpx;
		border-radius: 50%;
	}
</style>