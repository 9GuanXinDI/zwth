<template>
	<view class="loading-box flex-center" :style="{'background':maskBg}">
		<view class="spinner">
			<view class="spinner-container container1">
				<view class="circle1"></view>
				<view class="circle2"></view>
				<view class="circle3"></view>
				<view class="circle4"></view>
			</view>
			<view class="spinner-container container2">
				<view class="circle1"></view>
				<view class="circle2"></view>
				<view class="circle3"></view>
				<view class="circle4"></view>
			</view>
			<view class="spinner-container container3">
				<view class="circle1"></view>
				<view class="circle2"></view>
				<view class="circle3"></view>
				<view class="circle4"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			maskBg: {
				type: String,
				default: 'rgba(0, 0, 0,0.42)'
			}
		},
	}
</script>

<style>
	.loading-box {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.42);
	}

	.spinner {
		position: relative;
		width: 40rpx;
		height: 40rpx;
	}

	.container1>view,
	.container2>view,
	.container3>view {
		position: absolute;
		width: 12rpx;
		height: 12rpx;
		background-color: #333;
		border-radius: 100%;
		-webkit-animation: bouncedelay 1.2s infinite ease-in-out;
		animation: bouncedelay 1.2s infinite ease-in-out;
		-webkit-animation-fill-mode: both;
		animation-fill-mode: both;
	}

	.spinner .spinner-container {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.container2 {
		-webkit-transform: rotateZ(45deg);
		transform: rotateZ(45deg);
	}

	.container3 {
		-webkit-transform: rotateZ(90deg);
		transform: rotateZ(90deg);
	}

	.circle1 {
		top: 0;
		left: 0;
	}

	.circle2 {
		top: 0;
		right: 0;
	}

	.circle3 {
		right: 0;
		bottom: 0;
	}

	.circle4 {
		left: 0;
		bottom: 0;
	}

	.container2 .circle1 {
		-webkit-animation-delay: -1.1s;
		animation-delay: -1.1s;
	}

	.container3 .circle1 {
		-webkit-animation-delay: -1.0s;
		animation-delay: -1.0s;
	}

	.container1 .circle2 {
		-webkit-animation-delay: -0.9s;
		animation-delay: -0.9s;
	}

	.container2 .circle2 {
		-webkit-animation-delay: -0.8s;
		animation-delay: -0.8s;
	}

	.container3 .circle2 {
		-webkit-animation-delay: -0.7s;
		animation-delay: -0.7s;
	}

	.container1 .circle3 {
		-webkit-animation-delay: -0.6s;
		animation-delay: -0.6s;
	}

	.container2 .circle3 {
		-webkit-animation-delay: -0.5s;
		animation-delay: -0.5s;
	}

	.container3 .circle3 {
		-webkit-animation-delay: -0.4s;
		animation-delay: -0.4s;
	}

	.container1 .circle4 {
		-webkit-animation-delay: -0.3s;
		animation-delay: -0.3s;
	}

	.container2 .circle4 {
		-webkit-animation-delay: -0.2s;
		animation-delay: -0.2s;
	}

	.container3 .circle4 {
		-webkit-animation-delay: -0.1s;
		animation-delay: -0.1s;
	}

	@-webkit-keyframes bouncedelay {

		0%,
		80%,
		100% {
			-webkit-transform: scale(0.0)
		}

		40% {
			-webkit-transform: scale(1.0)
		}
	}

	@keyframes bouncedelay {

		0%,
		80%,
		100% {
			transform: scale(0.0);
			-webkit-transform: scale(0.0);
		}

		40% {
			transform: scale(1.0);
			-webkit-transform: scale(1.0);
		}
	}
</style>