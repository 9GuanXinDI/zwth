<template>
	<!-- <uni-popup ref="confirmPopup" background-color="#fff">
		<uni-popup-dialog type="warn" cancelText="取消" confirmText="确认" title="未登录" content="未登录,请先登录"
			@confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
	</uni-popup> -->
</template>

<script>
	import API from "@/request/index.js";
	export default {
		props: {
			addressData: {
				type: Array,
				default: []
			}
		},
		data() {
			return {
				
			}
		},
		mounted() {
			uni.navigateTo({
				url: `/pageA/login/login`,
			});
			// this.$refs.confirmPopup.open();
		},
		methods: {
			dialogConfirm(){
				uni.navigateTo({
					url: `/pageA/login/login`,
				});
			},
			dialogClose(){
				this.$refs.confirmPopup.close();
				this.$emit('close-login')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.address-box {
		height: 100%;
		padding: 40rpx;

		.address-title {
			font-size: 34rpx;
			text-align: center;
		}

		.address-item {
			height: 80rpx;
			line-height: 80rpx;
			border-bottom: 1px solid #D6D6D6;
		}

		.no-text {
			color: #909090;
		}

		.select-text {
			color: #FF6617;
		}

		.addree-content {
			height: 80%;
			overflow-y: auto;
			margin-top: 20rpx;
		}

		.address-text {
			width: 150rpx;
		}
	}
</style>
<style lang="less" scoped>
	/deep/ .uni-icons {
		color: #909090 !important;
	}
</style>