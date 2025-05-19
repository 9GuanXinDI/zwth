<template>
	<view>
		<view class="list">
			<view v-for="(item, index) in 20" class="item" :key="item">
				<view>
					<!-- 如果你不是nvue 使用这段即可 -->
					<!-- <button size="mini" @click="onClick2" ><text>左加入2</text></button> -->
					<!-- 因nvue无法获取点击的坐标，需手动获取  -->
					<button size="mini" @click="onClick2($event, '.button-l' + item)" :ref="'button-l' + item" ><text>左加入2</text></button>
				</view>
				<view>
					<button size="mini" @click="onClick($event, '.button-r' + item)" :ref="'button-r' + item"><text>右加入1</text></button>
				</view>
			</view>
		</view>
		<view class="cart">
			<view class="cart-button">
				<l-ball ref="ballRef">
					<template #default="{active}">
						<view class="cart-icon">
							<image class="img" :class="{active}" mode="widthFix" style="display:flex;"
								src="https://s3.meituan.net/static-prod01/com.sankuai.wmcapp.openh5.static/images/cart-fill-new-34088a.png">
							</image>
							<text class="badge">{{num}}-1</text>
						</view>
					</template>
				</l-ball>
			</view>
			<view class="cart-prices">
				<view class="price">
					<view class="payableAmount">
						<text class="text">￥</text>
						<text class="text number">{{Math.ceil(price * 0.8)}}</text>
					</view>
					<view class="totalAmount">
						<text class="text">¥{{price}}</text>
					</view>
				</view>
			</view>
			<view class="cart-preview">去结算</view>
		</view>
	</view>
</template>
<script>
	import { computed, defineComponent, ref, getCurrentInstance } from "../l-ball/vue";
	import { getRect }  from '@/uni_modules/lime-shared/getRect'
	export default defineComponent({
		setup() {
			const context = getCurrentInstance()
			const ballRef = ref(null)
			const ballRef2 = ref(null)
			const num = ref(0)
			const price = computed(() => 450 * num.value)
			
			const onClick = (e, ref) => {
				debugger;
				if(!ballRef.value) return
				// #ifdef APP-NVUE
				getRect(ref, {context}).then(res => {
					ballRef.value.action({x: res.left, y: res.top})
				})
				// #endif
				// #ifndef APP-NVUE
				ballRef.value.action(e)
				// #endif
				num.value++
			}
			const onClick2 = (e, ref) => {
				debugger;
				if(!ballRef.value) return
				// #ifdef APP-NVUE
				getRect(ref, {context}).then(res => {
					ballRef.value.action({x: res.left, y: res.top})
				})
				// #endif
				// #ifndef APP-NVUE
				ballRef.value.action(e)
				// #endif
				num.value++
			}
			return {
				ballRef,
				ballRef2,
				onClick,
				onClick2,
				num,
				price
			}
		}
	})
</script>
<style lang="scss">
	.list {
		padding: 30rpx;
		.item {
			height: 100rpx;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			// text-align: right;
		}
	}
	.cart {
		z-index: 2;
		position: fixed;
		left: 30rpx;
		right: 30rpx;
		bottom: 350rpx;
		background: #222426;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		color: #858687;
		// flex: 1;
		flex-direction: row;
		height: 100rpx;


		&-icon {
			position: relative;
			margin: 0 20rpx;
			top: -20rpx;

			.img {
				width: 94rpx;
				transition: transform 0.3s ease;
				&.active {
					transform: scale(1.5);
				}
			}

			.badge {
				position: absolute;
				top: 70rpx;
				right: -10rpx;
				color: #fff;
				background-color: #FB4E44;
				font-size: 24rpx;
				line-height: 1;
				
				text-align: center;
				transform: translate(50%, -50%);
				border-radius: 99rpx;
				padding: 8rpx;
			}
		}
		&-prices {
			flex: 1;
			font-size: 28rpx;
			flex-direction: row;
			.price {
				display: flex;
				align-items: center;
				flex-direction: row;
			}
			.text {
				color: #858687;
			}
			.payableAmount {
				// color: #fff;
				flex-direction: row;
				padding: 0 20rpx 0 0;
				.text {
					color: #fff;
				}
			}
			.number {
				font-size: 40rpx;
			}
		}
		&-preview {
			font-weight: 500;
			font-size: 28rpx;
			color: #222426;
			height: 100rpx;
			line-height: 100rpx;
			background: #f8c74e;
			// background-image: linear-gradient(135deg, #FFDD33 0%, #FFBB33 100%);
			border-radius: 0 50rpx 50rpx 0;
			width: 150rpx;
			position: relative;
			display: flex;
			justify-content: center;
		}
	}
	.cart2 {
		bottom: 50rpx;
		justify-content: flex-end;
	}
</style>