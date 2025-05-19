// @ts-nocheck
import {Ref, ref} from './vue'
export function useState():[Ref<boolean>, () => void] {
	const state = ref(false)
	let timer = null
	const change = () => {
		state.value = true
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			state.value = false
		},300)
	}
	return [state, change]
}