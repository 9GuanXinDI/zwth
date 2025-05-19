<template>
	<view class="container">
		<view class="container-bg">
			<image src="../../assets/account-bg.png" class="bg-img"></image>

			<view class="user-info">
				<view class="flex-start">
					<image :src="userInfo.img" class="avatar-icon" v-if="userInfo.img"></image>
					<image src="../../assets/user-icon.png" class="avatar-icon" v-else></image>
					<view>
						<view class="user-name">{{userInfo.name}}</view>
						<view class="vip-type flex-center">
							<image src="../../assets/vip.png" class="vip-img"></image>
							<text>{{userInfo.roleText}}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="money-info">
				<view class="money">{{userInfo.commission}}</view>
				<view class="text">佣金</view>
			</view>
		<!-- 	<view class="account-type-bar flex-start">
				<view class="account-type-item" @click="changeAccountType('account')">
					<image src="../../assets/account-select.png" class="select-img" v-if="accountType=='account'">
					</image>
					<text :class="[accountType=='account'?'select-text':'']">会员管理</text>
				</view>
				<view class="account-type-item" @click="changeAccountType('company')">
					<image src="../../assets/account-select.png" class="select-img" v-if="accountType=='company'">
					</image><text :class="[accountType=='company'?'select-text':'']">公司管理</text>
				</view>
			</view> -->
		</view>
		<view>
			<view v-if="accountType=='account'">
				<view class="flex-between account-box">
					<view>
						<view class="account-item mb-10 flex-start">
							<view class="account-label">您的身份为：</view><text
								class="account-value">{{userInfo.roleText}}</text>
						</view>
						<view class="account-item mb-10 flex-start">
							<view class="account-label">已拓展爱心会员：</view><text
								class="account-value">{{userInfo.loveVip}}人</text>
						</view>
						<view class="account-item mb-10 flex-start">
							<view class="account-label">已拓展普通会员：</view><text
								class="account-value">{{userInfo.simpleVip}}人</text>
						</view>
					</view>
					<view style="width:200rpx;height: 200rpx;">
						<image src="../../assets/tgy-role.png" class="role-icon" v-if="userInfo.role==6"></image>
						<image src="../../assets/axhy-role.png" class="role-icon" v-if="userInfo.role==7"></image>
						<image src="../../assets/pthy-role.png" class="role-icon" v-if="userInfo.role==8"></image>
					</view>
				</view>
			</view>
			<view v-else>
				<view class="company-statue" v-if="statusInfo.status==0">
					<image src="../../assets/no-company.png" class="statue-img"></image>
					<view class="statue-text">暂无公司</view>
				</view>
				<view class="company-statue" v-if="statusInfo.status==1">
					<image src="../../assets/panding-app.png" class="statue-img"></image>
					<view class="statue-text" style="color:#1A1A1AFF;">审核中</view>
				</view>
				<!--  -->
				<view class="company-statue" v-if="statusInfo.status==2">
					<image src="../../assets/app-success.png" class="statue-img"></image>
					<view class="statue-text">请移步至电脑端访问，访问地址为：</view>
					<view class="statue-text flex-start" style="color:#1A1A1AFF;">
						<view style="width:90%;word-wrap: break-word;">{{url}}</view>
						<image src="../../assets/copy.png" class="copy-img" @click="copyLink(url)"></image>
					</view>
					<view class="statue-text">账号密码为该小程序的登录账号和密码</view>
				</view>
				<view class="company-statue" v-if="statusInfo.status==3">
					<image src="../../assets/app-fail.png" class="statue-img"></image>
					<view class="statue-text" style="color:#1A1A1AFF;">审核未通过</view>
					<view class="statue-text flex-center">原因:{{statusInfo.reason}}</view>
				</view>
			</view>
		</view>
		<button id="shareBtn" open-type="share" class="apply-invite-btn" v-if="accountType=='account'">
			邀请会员
		</button>
		<view class="apply-invite-btn" @click="inviteAndApply" v-if="accountType=='company'&statusInfo.status!=1&statusInfo.status!=2">
			申请公司
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
	import sureLogin from "@/components/sureLogin.vue"
	export default {
		components: {
			sureLogin
		},
		data() {
			return {
				url:'',
				userId: '',
				isShowLogin: false,
				userInfo: {},
				accountType: 'account',
				statusInfo: {}
			}
		},
		onLoad() {
			user = useUserStore();
			this.userId = user.userInfo.userId;
			if (this.userId) {
				this.getUserInfo();
			}
			this.url = `https://zwth.xjjswh.cn/admin/company/list?to=${encodeURIComponent('/company/list')}`
		},
		onShow() {
			user = useUserStore();
			this.userId = user.userInfo.userId;
			if (this.userId) {
				this.getUserInfo();
				this.orgApplyStatus();
			}
			const url = `https://zwth.xjjswh.cn/admin/company/list?to=${encodeURIComponent('/company/list')}`
		},
		onShareAppMessage(res) {
			// let data=`/pageA/register/register?code=${user.userInfo.code}&createTime=${this.getCreatime()}`
			// uni.navigateTo({
			// 	url: data,
			// });
			// console.log(data)
			return {
				title: '580应急用品商城',
				path: `/pageA/register/register?code=${user.userInfo.code}&createTime=${this.getCreatime()}`
			}
		},
		methods: {
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
			 * @name 获取用户信息
			 */
			async getUserInfo() {
				const res = await API.getUserInfoApi();
				this.userInfo = res.data;
				this.userInfo.roleText = this.getRoleByType(res.data.role)
			},
			/**
			 * @name 根据类型获取用户角色
			 */
			getRoleByType(role) {
				switch (role) {
					case "1":
						return "超级管理员";
					case "2":
						return "省管理员";
					case "3":
						return "市管理员";
					case "4":
						return "区县管理员";
					case "5":
						return "社区管理员";
					case "6":
						return "推广员";
					case "7":
						return "爱心会员";
					case "8":
						return "普通会员";
				}
			},
			/**
			 * @name 切换类型
			 */
			changeAccountType(type) {
				this.accountType = type;
				if (this.accountType == 'company') {
					// 请求公司数据
					this.orgApplyStatus();
				}
			},
			/**
			 * @name 获取公司申请情况
			 */
			async orgApplyStatus() {
				const res = await API.orgApplyStatusApi();
				if (res.code == 200) {
					// 	审核状态 0未申请审核 1待审核 2审核通过 2已拒绝
					this.statusInfo = res.data;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 复制数据
			 */
			copyLink(text) {
				uni.setClipboardData({
					data: text,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						});
					},
					fail: () => {

					}
				});
			},
			/**
			 * @name 邀请会员或者申请成为公司
			 */
			inviteAndApply() {
				if (!this.userId) {
					this.isShowLogin = true;
				} else {
					if (this.accountType == 'account') {} else {
						this.applyCompany()
					}
				}
			},
			/**
			 * @name 申请成为公司
			 */
			applyCompany() {
				uni.navigateTo({
					url: `/pageA/applyCompany/applyCompany`
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
		height: 330rpx;

		.bg-img {
			width: 100%;
			height: 100%;
		}

		.user-info {
			position: absolute;
			left: 24rpx;
			top: 156rpx;

			.avatar-icon {
				width: 120rpx;
				height: 120rpx;
				margin-right: 20rpx;
				border-radius: 50%;
			}

			.user-name {
				margin-bottom: 23rpx;
				font-size: 30rpx;
				color: #FFFFFF;
			}

			.vip-type {
				width: 149rpx;
				height: 41rpx;
				background: rgba(204, 105, 24, 0.12);
				border-radius: 21rpx;
				font-size: 22rpx;
				color: #FFC799;

				.vip-img {
					width: 30rpx;
					height: 26rpx;
					margin-right: 6rpx;
				}
			}
		}

		.money-info {
			position: absolute;
			right: 60rpx;
			top: 156rpx;
			text-align: center;

			.money {
				margin-bottom: 10rpx;
				font-size: 38rpx;
				color: #FFE8D5;
			}

			.text {
				font-size: 22rpx;
				color: #AE8870;
			}
		}

		.account-type-bar {
			position: absolute;
			left: 0;
			bottom: 0rpx;
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			background-color: #3d3838FF;
			border-radius: 10rpx 10rpx 0 0;
			font-size: 30rpx;
			color: #D9D9D9;
		}

		.account-type-item {
			position: relative;
			width: 50%;
			height: 100%;
			text-align: center;
		}

		.select-img {
			position: absolute;
			width: 375rpx;
			height: 90rpx;
			top: 0;
			left: 0;
		}

		.select-text {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			font-weight: bold;
			font-size: 30rpx;
			color: #211C1C;
		}
	}

	.account-box {
		padding: 84rpx 60rpx;

		.account-item {
			font-size: 26rpx;
			color: #544E4E;
		}

		.account-label {
			width: 220rpx;
			text-align: end;
		}

		.account-value {
			font-size: 32rpx;
			color: #1A1A1A;
		}
	}

	.company-statue {
		width: 530rpx;
		margin: 60rpx auto;
		text-align: center;

		.statue-img {
			width: 100%;
			height: 330rpx;
		}

		.statue-text {
			margin-top: 30rpx;
			font-size: 26rpx;
			color: #909090;
		}
	}

	.copy-img {
		width: 32rpx;
		height: 32rpx;
		margin-left: 28rpx;
	}

	.apply-invite-btn {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 702rpx;
		height: 80rpx;
		margin: 15rpx 24rpx;
		text-align: center;
		line-height: 80rpx;
		background: #FF6617;
		border-radius: 40rpx;
		font-size: 30rpx;
		color: #FFFFFF;
	}

	.role-icon {
		width: 150rpx;
		height: 222rpx;
	}
</style>