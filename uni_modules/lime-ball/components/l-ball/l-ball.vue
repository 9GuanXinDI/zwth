<template>
	<view class="l-ball-wrapper" ref="l-ball-wrapper">
		<block v-for="item in balls" :key="item.time">
			<view v-if="!item.done" class="l-ball" :ref="item.ref" :style="item.style" :animation="item.data"></view>
		</block>
		<slot :active="active"></slot>
	</view>
</template>
<script lang="ts">
	// @ts-nocheck
	import { defineComponent, onMounted, getCurrentInstance, reactive, computed } from './vue';
	import { getRect } from '@/uni_modules/lime-shared/getRect';
	import { addUnit } from '@/uni_modules/lime-shared/addUnit';
	import { getStyleStr } from '@/uni_modules/lime-shared/getStyleStr';
	import { sleep } from '@/uni_modules/lime-shared/sleep';
	import { createAnimation } from '@/uni_modules/lime-shared/createAnimation';
	import BallProps from './props'
	import { useState } from './useState'
	import { useList } from './useList'
	const name = 'l-ball'
	interface Point {
		x : number
		y : number
	}
	interface StartPoint extends TouchEvent {
		x?: number
		y?: number
	}
	export default defineComponent({
		name,
		props: BallProps,
		setup(props, { expose }) {
			const context = getCurrentInstance()
			const target = reactive({x: 0,y: 0})
			const numPoints = 30;
			const [active, change] = useState()
			const [balls, update] = useList(props.duration)
			
			const calculateBezierPoint = (t: number, p0: Point, p1: Point, p2: Point) => {
				const q0x = p0.x + (p1.x - p0.x) * t;
				const q0y = p0.y + (p1.y - p0.y) * t;

				const q1x = p1.x + (p2.x - p1.x) * t;
				const q1y = p1.y + (p2.y - p1.y) * t;

				const bx = q0x + (q1x - q0x) * t;
				const by = q0y + (q1y - q0y) * t;
				return { x: bx, y: by };
			}
			
			const offset = computed(() => {
				const {offset} = props
				if(Array.isArray(offset)) {
					return offset as number[]
				} else {
					return [offset, offset]
				}
			})
			
			const action = async (start : StartPoint, end: Point = target) => {
				const time = +new Date()
				const {x, y, touches} = start
				const {clientX, clientY} = touches && touches['0'] || {}
				// 起点
				const p0 = {
					x: x || clientX,
					y: y || clientY,
				}
				// 投掷高度
				const p1 = {
					x: p0.x - end.x > offset.value[0] * 0.3 ? -offset.value[0] : offset.value[0],
					y: - offset.value[1]
				}
				// 终点
				const p2 = {
					x: end.x - p0.x,
					y: end.y - p0.y,
				}
				
				const ball = reactive({
					ref: `l-ball-${time}`,
					time,
					data: null,
					style: getStyleStr({
						left: addUnit(p0.x),
						top: addUnit(p0.y),
						width: addUnit(props.size),
						height: addUnit(props.size),
						backgroundColor: props.color,
					}),
					done: false
				})
				
				balls.value.push(ball)
				p0.x = 0
				p0.y = 0
				
				// 抛物线长度
				let length = 0
				let animation = null
				const points = []
				
				animation = createAnimation({
					duration: 0,
					timingFunction: 'linear'
				})
				
				for (let i = 0; i <= numPoints; i++) {
					const t = i / numPoints;
					const {x, y} = calculateBezierPoint(t, p0, p1, p2);
					let dist = 0 
					if(points.length > 0) {
						const prevPoint = points[points.length - 1];
						dist = Math.sqrt((x - prevPoint.x) ** 2 + (y - prevPoint.y) ** 2);
						length += dist;
					}
					points.push({x, y, d: dist})
				}
				points.forEach(({x, y, d}, i) => {
					// 由于微信小程序duration 为 0 时整段动画都不执行，故默认值为1
					//#ifndef APP-NVUE
					let duration = (d / length * props.duration) || 1
					// #endif
					
					// 由于nvue过渡太慢故设为0
					//#ifdef APP-NVUE
					duration = 0
					// #endif
					
					// animation.opacity(1 - 1 / numPoints * i).left(x).top(y).step({duration: 300})
					// 由于微信小程序createAnimation 使用位置无过渡动画，故改成translate
					animation.opacity(1 - 1 / numPoints * i).translate(x, y).step({duration})
				})
				
				// 由于微信小程序无法在生成节点时就执行动画，故在节点生成后再动态赋值
				await sleep(50)
				let totalDuration = props.duration
				let ref = null
				//#ifdef APP-NVUE
				// nvue里for出来的ref是个数组
				ref = context.refs && context.refs[ball.ref][0]
				// #endif
				ball.data = animation.export(ref)
				// 提前让接收的目标有个动画
				sleep(totalDuration * 0.52).then(() => {
					change()
				})
				sleep(totalDuration * 2).then(() => {
					ball.done = true
					update()
				})
			}


			onMounted(() => {
				sleep(150).then(() => {
					getRect(`.${name}-wrapper`, { context }).then(res => {
						target.x = res.left + res.width / 2
						target.y = res.top + res.height / 2
					})
				})
			})
			// #ifdef VUE3
			expose({
				action
			})
			// #endif
			return {
				target,
				active,
				balls,
				// #ifndef VUE3
				action
				// #endif
			}
		}
	})
</script>
<style lang="scss">
	@import './index.scss';
</style>