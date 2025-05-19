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
		</view>
		<view>

			<view class="company-statue" v-if="statusInfo.status==0">
				<image src="../../assets/no-company.png" class="statue-img"></image>
				<view class="statue-text">暂无公司</view>
			</view>
			<view class="company-statue" v-if="statusInfo.status==1">
				<image src="../../assets/panding-app.png" class="statue-img"></image>
				<view class="statue-text" style="color:#1A1A1AFF;">审核中</view>
			</view>
			<view v-if="statusInfo.status==2||statusInfo.status==3">
				<view class="company-statue-other" v-if="statusInfo.status==2">
					<view class="flex-start" style="align-items: flex-start;">
						<image src="../../assets/sh-success.png" class="sh-icon"></image>
						<view class="right-box">
							<view class="title">审核成功</view>
							<view class="text">请移步至电脑端访问，访问地址为：</view>
							<view class="link flex-start">
								<view style="width:90%;word-wrap: break-word;">{{url}}</view>
								<image src="../../assets/copy.png" class="copy-img" @click="copyLink(url)"></image>
							</view>
							<view class="text">账号密码为该小程序的登录账号和密码</view>
						</view>
					</view>
				</view>
				<view class="company-statue-other" v-if="statusInfo.status==3">
					<view class="flex-start" style="align-items: flex-start;">
						<image src="../../assets/sh-error.png" class="sh-icon"></image>
						<view class="right-box">
							<view class="title">审核失败</view>
							<view class="text">原因：{{statusInfo.reason}}</view>
						</view>
					</view>
				</view>
				<view class="company-info-box">
					<view class="title">公司信息</view>
					<view class="info-item flex-start">
						<view class="label">申请人姓名</view>
						<view class="value">{{taskForm.name}}</view>
					</view>
					<view class="info-item flex-start">
						<view class="label">公司名称</view>
						<view class="value">{{taskForm.orgName}}</view>
					</view>
					<view class="info-item flex-start">
						<view class="label">公司性质</view>
						<view class="value">
							{{taskForm.level==1?'省公司': taskForm.level==2?'市公司': taskForm.level== 3?'区县公司':'社区公司'}}
						</view>
					</view>
					<view class="info-item flex-start">
						<view class="label">所属地</view>
						<view class="value">{{taskForm.addressInfo}}</view>
					</view>
					<view class="info-item">
						<view class="label-long">上传证明（营业执照等）</view>
						<view v-if="taskForm.fileUrls.length>0">
							<image v-for="(item,index) in taskForm.fileUrls" :key="index" :src="item" class="file-item">
							</image>
						</view>
					</view>
					<view class="info-item" style="border-bottom: 0;">
						<view class="label-long">公司简介</view>
						<view class="textarea-box">{{taskForm.orgDesc}}</view>
					</view>
					<view class="info-item" style="border-bottom: 0;">
						<view class="label-long">申请理由</view>
						<view class="textarea-box">{{taskForm.reason}}</view>
					</view>
					<view class="re-apply-btn" @click="reApply" v-if="statusInfo.status==3">
						重新申请
					</view>
				</view>

			</view>
		</view>
		<view class="apply-invite-btn" @click="inviteAndApply" v-if="statusInfo.status==0">
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
				url: '',
				userId: '',
				isShowLogin: false,
				userInfo: {},
				accountType: 'account',
				statusInfo: {},
				taskForm: {}
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
					if (Object.keys(res.data.taskForm||{}).length > 0) {
						this.taskForm = res.data.taskForm;
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
					this.applyCompany()
				}
			},
			/**
			 * @name 申请成为公司
			 */
			applyCompany() {
				uni.navigateTo({
					url: `/pageA/applyCompany/applyCompany?type=add`
				});
			},
			/**
			 * @name 重新申请
			 */
			reApply() {
				uni.navigateTo({
					url: `/pageA/applyCompany/applyCompany?type=edit`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100%;
		background-color: #FAFAFA;
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

	.company-statue-other {
		padding: 40rpx 48rpx;
		background-color: #fff;
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

	.re-apply-btn {
		// width: 702rpx;
		height: 80rpx;
		margin: 0 auto;
		margin-top: 200rpx;
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

	.sh-icon {
		width: 90rpx;
		height: 90rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}

	.right-box {
		width: calc(100% - 110rpx);

		.title {
			font-weight: bold;
			font-size: 28rpx;
			color: #1A1A1A;
		}

		.text {
			margin-top: 10rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #909090;
		}

		.link {
			margin: 18rpx 0;
			font-weight: bold;
			font-size: 28rpx;
			color: #1BCC0E;
			line-height: 34rpx;
		}
	}

	.company-info-box {
		margin-top: 20rpx;
		padding: 30rpx 48rpx;
		background-color: #fff;

		.title {
			font-weight: bold;
			font-size: 30rpx;
			color: #1A1A1A;
		}

		.info-item {
			padding: 30rpx 0;
			border-bottom: 2rpx solid #D6D6D6;

			.label {
				width: 130rpx;
				margin-right: 70rpx;
				font-size: 26rpx;
				color: #909090;
			}

			.label-long {
				font-size: 26rpx;
				color: #909090;
			}

			.value {
				font-size: 26rpx;
				color: #1A1A1A;
			}
		}
	}

	.file-item {
		width: 180rpx;
		height: 180rpx;
		margin: 18rpx 18rpx 0 0;
	}

	.textarea-box {
		width: 100%;
		// height: 203rpx;
		margin-top: 20rpx;
		padding: 24rpx;
		background: #FAFAFA;
		border-radius: 5rpx;
	}
</style>