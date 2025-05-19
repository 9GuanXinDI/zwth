// #ifndef VUE3
import Vue from 'vue'
import App from './App'
Vue.config.productionTip = false

App.mpType = 'app'



// let originalSwitchTab = uni.switchTab;
// debugger;
// uni.switchTab = function(options) {
// 	debugger;
// 	// // 这里是拦截逻辑，可以根据需要进行各种检查
// 	// if (/* 检查条件，如用户是否已登录 */) {
// 	//   // 如果条件满足，调用原始的 switchTab 方法
// 	//   originalSwitchTab(options);
// 	// } else {
// 	//   // 如果条件不满足，可以阻止切换或显示提示信息
// 	//   uni.showToast({
// 	//     title: '请先登录',
// 	//     icon: 'none'
// 	//   });
// 	// }
// };
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import piniaPersist from 'pinia-plugin-persist-uni'
import {
	createPinia
} from 'pinia'
import App from './App.vue'
import * as Pinia from 'pinia';

const pinia = createPinia();
pinia.use(piniaPersist)
export function createApp() {
	// let originalSwitchTab = uni.switchTab;
	// debugger;
	// uni.switchTab = function(options) {
	// 	debugger;
	// 	// // 这里是拦截逻辑，可以根据需要进行各种检查
	// 	// if (/* 检查条件，如用户是否已登录 */) {
	// 	//   // 如果条件满足，调用原始的 switchTab 方法
	// 	//   originalSwitchTab(options);
	// 	// } else {
	// 	//   // 如果条件不满足，可以阻止切换或显示提示信息
	// 	//   uni.showToast({
	// 	//     title: '请先登录',
	// 	//     icon: 'none'
	// 	//   });
	// 	// }
	// };
	const app = createSSRApp(App)

	app.use(pinia);

	// app.config.globalProperties.wsInit();

	return {
		app
	}
}
// #endif