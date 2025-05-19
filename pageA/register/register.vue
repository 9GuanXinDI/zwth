<template>
	<view class="regsiter-box">
		<view v-if="isShowWhite" class="white-page">
			<text>邀请链接已过期~</text>
		</view>
		<template v-else>
			<view class="register-bg">
				<view class="text">账号注册</view>
			</view>
			<view class="register-content">
				<uni-forms ref="baseForm" :modelValue="formData" :label-width="80" :rules="rules">
					<uni-forms-item label="手机号" name="phone" required>
						<uni-easyinput v-model="formData.phone" placeholder="请输入您的手机号" />
					</uni-forms-item>
					<uni-forms-item label="密码" name="password" required>
						<uni-easyinput v-model="formData.password" placeholder="请输入密码" type="password" />
					</uni-forms-item>
					<uni-forms-item label="确认密码" name="rePassword" required>
						<uni-easyinput v-model="formData.rePassword" placeholder="请再次输入密码" type="password" />
					</uni-forms-item>
					<uni-forms-item label="邀请码" name="code">
						<uni-easyinput v-model="formData.code" placeholder="请输入邀请码" :disabled="disabled" />
					</uni-forms-item>
					<uni-forms-item label="所属地" name="address" required>
						<view v-if="addressData.length==0" class="address-text no-text" @click="selectAddress">请选择所属地
						</view>
						<view v-else class="address-text text-ellipsis" @click="selectAddress">
							{{addressData.map((item)=>item.name).join('/')}}
						</view>
						<uni-icons type="right" size="24" class="to-address-icon" @click="selectAddress"></uni-icons>
					</uni-forms-item>
				</uni-forms>
				<view class="remember-password">
					<text>已有账号?</text><text @click="toLogin" style="margin-left:10rpx;color:#FF6617;">返回登录</text>
				</view>
				<button class="register-btn" @click="submitForm">注册</button>
			</view>
			<uni-popup ref="popup" background-color="#fff" :is-mask-click="false">
				<!-- <uni-icons type="closeempty" size="20" class="close-icon" @click="closeAddress"></uni-icons> -->
				<view style="height: 1000rpx;">
					<address-select v-if="isShowAddress" :addressData="addressData" @getAddress="getSelectAddress"
						@cancelAddress="closeAddress"></address-select>
				</view>
			</uni-popup>
			<uni-popup ref="loginPopup" background-color="#fff" :is-mask-click="false">
				<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="提示" content="当前账号已存在，是否登录？"
					@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
			</uni-popup>

			<uni-popup ref="registerPopup" background-color="#fff" :is-mask-click="false">
				<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="提示"
					content="当前邀请码已过期或不存在，是否继续注册？？" @confirm="dialogregister" @close="dialogClose"></uni-popup-dialog>
			</uni-popup>
		</template>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import Md5 from 'js-md5';
	import addressSelect from "@/components/addressSelect.vue"
	export default {
		components: {
			addressSelect
		},
		data() {
			return {
				formData: {
					phone: '',
					password: '',
					code: '',
					rePassword: '',
					address: '',
				},
				isShowAddress: false,
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
					},
					rePassword: {
						rules: [{
								required: true,
								errorMessage: '请输入',
							},
							{
								validateFunction: function(rule, value, data, callback) {
									if (data.password != value) {
										callback("确认密码与密码不一致!");
									}
									return true
								}
							}
						]
					},
					address: {
						rules: [{
							required: true,
							errorMessage: '请选择地区',
						}]
					}
				},
				disabled: false,
				dataTree: [],
				addressData: [],
				isShowWhite: false,
				code: ''
			}
		},
		onLoad(option) {
			this.code = '';
			user = useUserStore();
			if (option.createTime) {
				// this.code = option.code;
				user.setUserInviteCode(option.code);
				let minutes = this.isLoseEfficacy(option.createTime, 7);
				this.isShowWhite = minutes > 1;
			}
			this.formData.code = user.userInfo.userCode || user.userInfo.goodsCode;
			this.disabled = this.formData.code != '';
			this.userId = user.userInfo.userId;
			this.id = option.id;
			this.getGoodsDetail();
		},
		methods: {
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
			 * @name 选择地区
			 */
			selectAddress() {
				this.$refs.popup.open('bottom');
				this.isShowAddress = true;
			},
			/**
			 * @name 关闭地区选择
			 */
			closeAddress() {
				this.isShowAddress = false;
				this.$refs.popup.close();
			},
			/**
			 * @name 获取已选地址数据
			 */
			getSelectAddress(data) {
				this.addressData = data;
				this.formData.address = this.addressData.length == 0 ? '' : this.addressData.map((item) => item.code).join(
					',');
			},
			/**
			 * @name 注册账号
			 */
			submitForm() {
				this.$refs.baseForm.validate().then(res => {
					let params = {
						phone: this.formData.phone,
						password: Md5(this.formData.password),
						address: this.formData.address,
						code: this.formData.code
					}
					user.setUserInviteCode(this.formData.code);
					console.log('code:' + this.formData.code)
					API.userRegisterApi(params).then(res => {
						if (res.code == 200) {
							uni.showToast({
								title: "注册成功,请返回登录",
								icon: 'success',
								duration: 1000
							})
							setTimeout(() => {
								uni.navigateTo({
									url: `/pageA/login/login`,
								});
							}, 1000);
						} else if (res.code == 490) {
							// 手机号已注册,立即登录
							this.$refs.loginPopup.open();
						} else if (res.code == 491) {
							// 邀请码过期或不存在
							this.$refs.registerPopup.open();
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none',
								duration: 2000
							})
						}
					})
				})
			},
			/**
			 * @name 继续注册
			 */
			dialogregister() {
				this.$refs.registerPopup.close();
				this.formData.code = '';
				this.submitForm();
			},
			/**
			 * @name 去登录
			 */
			toLogin() {
				uni.navigateTo({
					url: `/pageA/login/login`,
				});
			},
			/**
			 * @name 确认登录
			 */
			dialogConfirm() {
				this.toLogin();
			},
			dialogClose() {}
		}
	}
</script>

<style lang="scss" scoped>
	.regsiter-box {
		background-color: #fff;
	}

	.register-bg {
		width: 750rpx;
		height: 465rpx;
		background: linear-gradient(180deg, #FFF1EB 0%, #FFFFFF 100%);
		border-radius: 0rpx 0rpx 0rpx 0rpx;

		.text {
			padding: 100rpx 0 0 55rpx;
			font-weight: bold;
			font-size: 48rpx;
			color: #000000;
		}
	}

	.register-content {
		margin-top: -240rpx;
		padding: 0 55rpx;
		z-index: 2;

		.remember-password {
			margin-top: 50rpx;
			font-size: 26rpx;
			text-align: left;
		}

		.register-btn {
			width: 640rpx;
			height: 90rpx;
			margin-top: 24rpx;
			background: #FF6617;
			border-radius: 45rpx 45rpx 45rpx 45rpx;
			color: #fff;
		}

		.address-text {
			width: 450rpx;
			height: 70rpx;
			padding-left: 20rpx;
			line-height: 70rpx;
			font-size: 24rpx;
		}
	}

	.close-icon {
		position: absolute;
		top: 40rpx;
		right: 30rpx;
		color: #909090 !important;
	}

	.no-text {
		color: #909090;
	}

	.to-address-icon {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translate(0, -50%);
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
	/deep/ .regsiter-box .is-input-border {
		border: none !important;
		border-color: none !important;
		background-color: transparent !important;
	}

	/deep/ .regsiter-box .uni-forms-item {
		padding-bottom: 24rpx;
		border-bottom: 1px solid #D6D6D6;
	}

	/deep/ .regsiter-box .uni-forms-item__label {
		color: #1A1A1A !important;
		font-size: 28rpx !important;
	}

	/deep/ .regsiter-box .uni-forms-item__label {
		color: #1A1A1A;
		font-size: 28rpx;
	}

	/deep/ .regsiter-box .uni-easyinput {
		color: #909090;
		font-size: 26rpx;
	}

	/deep/ .regsiter-box .input-value-border {
		border: 0 !important;
	}

	/deep/ .regsiter-box .uni-forms-item__error {
		padding-top: 40rpx !important;
	}

	/deep/ .uni-icons {
		color: #909090 !important;
	}
</style>