<template>
	<view class="container">

		<view class="container-bg">
			<image src="../../assets/logo-bg.png" class="bg-img"></image>
		</view>

		<view class="container-content">
			<view class="content">
				<uni-forms ref="baseForm" :modelValue="baseFormData" :rules="rules">
					<uni-forms-item label="" name="loginName">
						<view class="label">手机号</view>
						<uni-easyinput v-model="baseFormData.loginName" placeholder="请输入您的手机号" />
					</uni-forms-item>
					<uni-forms-item label="" name="password">
						<view class="label">密码</view>
						<uni-easyinput v-model="baseFormData.password" placeholder="请输入您的密码" type="password" />
					</uni-forms-item>
					<view class="remember-password">
						<text>还没账号?</text><text @click="toRegister" style="margin-left:10rpx;color:#FF6617;">立即注册</text>
					</view>
					<button class="button login-btn" type="primary" @click="userLogin">登录</button>

				</uni-forms>
			</view>
			<view class="content-check">
				<uni-data-checkbox v-model="baseFormData.isCheck" multiple :localdata="checkData" />
				<view class="check-text">我已阅读并同意<text style="color:#FF6617;"
						@click="goToUserAgreement">用户服务协议</text>和<text style="color:#FF6617;" @click="goToUserPrivacyAgreement">用户隐私协议</text></view>
			</view>
		</view>

		<view class="modal-box" v-if="isShowModal">
			<view class="card-box">
				<view class="card-title">提示</view>
				<view class="card-text">请先阅读并同意<text style="color:#FF6617;"
						@click="goToUserAgreement">用户服务协议</text>和<text style="color:#FF6617;" @click="goToUserPrivacyAgreement">用户隐私协议</text></view>
				<view class="btn-box">
					<text class="btn-box-item" @click="isShowModal=false">取消</text>
					<text class="btn-box-item" @click="agreeWith">同意</text>
				</view>
			</view>
		</view>

		<uni-popup ref="popup" background-color="#fff">
			<view class="auth-title">授权登录</view>
			<view class="auth-content"> 若需要使用该小程序的功能，需要先登录获取您的ID、姓名等信息，是否登录</view>
			<view>
				<button @click="getUserProfile" class='login-btn-sure btn'>登录</button>
				<button @click="cancelLogin" type="default" class='cancle-btn btn'>取消</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	let user;
	import API from "@/request/index.js";
	import {
		useUserStore
	} from '@/store/user';
	import Md5 from 'js-md5'
	export default {
		data() {
			return {
				// 基础表单数据
				baseFormData: {
					loginName: '',
					password: '',
					remember: [],
					isCheck: []
				},
				openId: '',
				isShowModal: false,
				rules: {
					loginName: {
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
				localdata: [{
					text: '记住密码',
					value: 0
				}],
				checkData: [{
					text: '',
					value: 0
				}],
				userId: '',
				token: user?.token,
			}

		},
		onShow() {
			user = useUserStore();
		},
		/**
		 * @name 离开当前页面
		 */
		onUnload() {
			let that = this;
			wx.enableAlertBeforeUnload({
				message: "是否返回商品页？",
				success: function(res) {
					if (!user.userInfo.userId) {
						uni.switchTab({
							url: `/pages/index/index`,
						});
					}

				},
				fail: function(errMsg) {
					console.log("失败", errMsg);
				}
			})
		},
		methods: {
			/**
			 * @name 取消登录弹窗
			 */
			cancelLogin() {
				this.$refs.popup.close();
			},
			/**
			 * @name 登录
			 */
			userLogin() {
				let that=this;
				this.$refs.baseForm.validate().then(async (res) => {
					if (this.baseFormData.isCheck.length == 0) {
						this.isShowModal = true;
						return
					}
					let isOut = await this.checkSession();
					if (isOut) {
						this.$refs.popup.open();
					} else {
						let openId = user.userInfo.openId;
						if (!openId) {
							uni.login({
								success: function(data) {
									that.getUserOpenid(data.code);
								}
							})
						} else {
							this.openId = user.userInfo.openId;
							this.login()
						}

					}
				}).catch((error) => {

				})
			},
			/**
			 * @name 检查用户的登录状态
			 */
			async checkSession() {
				let isOut = false
				try {
					// 尝试检查 session_key 是否有效
					const res = await uni.checkSession();
					// 如果 res.errMsg 包含 "ok"，则表示 session_key 有效
					if (res.errMsg === 'checkSession:ok') {
						isOut = false;
					} else {
						isOut = true;
					}
				} catch (error) {
					isOut = true;
				}
				return isOut
			},
			/**
			 * @name 用户授权
			 */
			getUserProfile() {
				this.cancelLogin();
				uni.getUserProfile({
					desc: "获取你的昵称、头像、地区及性别",
					success: (res) => {
						let that = this

						if (!res.encryptedData || !res.iv) return;

						uni.login({
							provider: 'weixin',
							success: rt => {
								uni.showLoading({
									title: '微信登录中',
									mask: true
								})

								if (rt.code) {
									that.getUserOpenid(rt.code);
								}
							}
						})
					},
					fail(res) {}
				})
			},
			/**
			 * @name 获取用户的openid
			 */
			async getUserOpenid(code) {
				const res = await API.getWxOpenIdApi(code);
				if (res.code == 200) {
					this.openId = res.data;
					user.setUserCode(res.data);
					this.login();
				}
			},
			/**
			 * @name 登录
			 */
			login() {
				let params = {
					openId: this.openId,
					password: Md5(this.baseFormData.password),
					phone: this.baseFormData.loginName,
					type: 'WX'
				}
				API.getUserLoginApi(params)
					.then((res) => {
						if (res.code == 200) {
							this.token = res.data.token;
							user.setUserToken(this.token);
							// 获取用户其他信息
							user.setUserInfo(res.data.user);
							this.userId = res.data.user.id;
							let pages = getCurrentPages();
							let prevPage = pages[pages.length - 2];
							user.setUserLoginState(false);
							if (prevPage.route == 'pageA/register/register') {
								uni.switchTab({
									url: `/pages/index/index`,
								});
							} else {
								uni.navigateBack({
									delta: 1
								});
							}

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
			},
			/**
			 * @name 去注册
			 */
			toRegister() {
				uni.navigateTo({
					url: `/pageA/register/register`,
				});
			},
			/**
			 * @name 同意阅读协议
			 */
			async agreeWith() {
				this.baseFormData.isCheck = [0];
				this.isShowModal = false;
				let that=this;
				let isOut = await this.checkSession();
				if (isOut) {
					this.$refs.popup.open();
				} else {
					let openId = user.userInfo.openId;
					if (!openId) {
						uni.login({
							success: function(data) {
								that.getUserOpenid(data.code);
							}
						})
					} else {
						this.openId = user.userInfo.openId;
						this.login()
					}
					
				}
			},
			/**
			 * @name 查看用户服务协议
			 */
			goToUserAgreement() {
				uni.navigateTo({
					url: `/pageA/serviceAgreement/serviceAgreement`,
				});
			},
			/**
			 * @name 查看用户隐私协议
			 */
			goToUserPrivacyAgreement() {
				uni.navigateTo({
					url: `/pageA/userPrivacy/userPrivacy`,
				});
			}
		}

	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100%;
	}

	.container-bg {
		position: relative;
		width: 100%;
		height: 465rpx;

		.bg-img {
			width: 100%;
			height: 100%;
		}

		.bg-text {
			position: absolute;
			left: 65rpx;
			bottom: 129rpx;
			font-family: AlimamaShuHeiTi;
			font-size: 32rpx;
			color: #000;
			font-weight: bold;
		}
	}

	.container-content {
		position: relative;
		height: calc(100% - 465rpx);
		background: #fff;

		.content {
			padding: 60rpx 55rpx 0 55rpx;
		}

		.label {
			margin-left: 15rpx;
			font-weight: bold;
		}

		.login-btn {
			width: 640rpx;
			height: 90rpx;
			margin-top: 24rpx;
			background: #FF6617;
			border-radius: 45rpx 45rpx 45rpx 45rpx;
		}

		.remember-password {
			margin-top: 50rpx;
			font-size: 26rpx;
			text-align: right;
		}

		.content-check {
			position: absolute;
			display: flex;
			align-items: center;
			justify-content: center;
			left: 86rpx;
			bottom: 50rpx;

			.check-text {
				margin-left: -50rpx;
				font-family: PingFangSC, PingFang SC;
				font-weight: 400;
				font-size: 22rpx;
				color: #646464;
			}
		}
	}

	.modal-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.42);
		z-index: 8889;

		.card-box {
			position: fixed;
			top: 466rpx;
			left: 50%;
			width: 550rpx;
			height: 250rpx;
			transform: translate(-50%, 0);
			padding-left: 40rpx;
			padding-top: 46rpx;
			background: #FFFFFF;
			border-radius: 20rpx;
			overflow-y: auto;
			z-index: 9999;

			.card-title {
				font-size: 30rpx;
				font-weight: bold;
				text-align: center;
			}

			.card-text {
				font-size: 28rpx;
				padding: 10rpx 30rpx;
				text-align: left;
			}

			.btn-box {
				position: absolute;
				left: 0;
				bottom: 0;
				width: 100%;
				height: 100rpx;
				line-height: 100rpx;
				border-top: 2rpx solid rgba(0, 0, 0, 0.1);

				.btn-box-item {
					display: inline-block;
					width: calc((100% - 2rpx) / 2);
					text-align: center;
				}

				.btn-box-item:last-child {
					color: #FF6617;
					border-left: 2rpx solid rgba(0, 0, 0, 0.1);
				}
			}
		}
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

	.login-btn-sure {
		background-color: #FF6617 !important;
		color: #fff !important
	}
</style>
<style lang="less" scoped>
	/deep/.container-content .is-input-border {
		// 使用/deep/对组件内样式修改
		border: 0 !important;
		border-bottom: 1px solid #F0F0F0 !important;
	}

	/deep/.container-content .uni-easyinput__content-input {
		height: 82rpx !important;
	}

	/deep/.container-content .uni-easyinput__placeholder-class {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 14px;
		color: #858B9C;
		line-height: 20px;
	}

	/deep/.container-content .content-clear-icon {
		padding: 0 30rpx;
	}

	/deep/.container-content .checklist-content {
		margin-left: 10rpx;
	}

	/deep/.container-content .checklist-text {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 28rpx !important;
		color: #858B9C !important;
		line-height: 40rpx !important;
	}

	/deep/.radio__inner {
		border-color: #FF6617 !important;
	}

	/deep/.radio__inner-icon {
		background-color: #FF6617 !important;
	}

	/deep/ .uni-data-checklist .checklist-group .checklist-box.is--default.is-checked .checkbox__inner {
		border-color: #FF6617 !important;
		background-color: #FF6617 !important;
	}

	/deep/ .uniui-clear {
		color: #FF6617 !important;
	}

	/deep/ .uniui-eye-filled {
		color: #FF6617 !important;
	}

	/deep/ .uni-popup .uni-popup__wrapper {
		width: 95%;
		border-radius: 5px;
	}
</style>