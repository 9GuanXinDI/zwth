// @ts-nocheck
import {Ref, ref} from './vue'
export function useList(time: number = 600):[Ref<any[]>, () => void] {
	const balls = ref([])
	let timer = null
	const change = () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			const flag = balls.value.every((ball) => ball.done)
			if(flag) { balls.value = [] }
		}, time * 2.5)
	}
	return [balls, change]
}