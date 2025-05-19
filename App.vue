<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	export default {
		onLaunch: function() {
			uni.hideTabBar({
				success: () => {
					},
					fail: () => {
						// 捕获报错，防止没有tabbar页面调用后控制台报错
					}
			})
			// user = useUserStore();
			// let userId = user.userInfo.userId;
			// const whitePageList = ['/pageA/login/login', '/pageA/register/register', '/pages/index/index',
			// 	'/pageA/goodsInfo/goodsInfo'
			// ]
			// // 全局页面跳转拦截
			// uni.addInterceptor('navigateTo', {
			// 	invoke(args) {
			// 		let url = args.url;
			// 		let index = url.indexOf('?');
			// 		let nowUrl = index > -1 ? url.substring(0, index) : url;
			// 		if (whitePageList.indexOf(nowUrl) > -1) {
			// 			return true
			// 		} else {
			// 			if (!userId) {
			// 				uni.navigateTo({
			// 					url: `/pageA/login/login`,
			// 				});
			// 			}
			// 			return true
			// 		}
			// 	},
			// })
		},
		onShow: function() {
			uni.hideTabBar({
				success: () => {
					},
					fail: () => {
						// 捕获报错，防止没有tabbar页面调用后控制台报错
					}
			})
		},
		onHide: function() {
			uni.hideTabBar({
				success: () => {
					},
					fail: () => {
						// 捕获报错，防止没有tabbar页面调用后控制台报错
					}
			})
			user = useUserStore();
			user.setGoodsCarInfo(false, [], '');
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	@import '@/index.css';

	// 设置整个项目的背景色
	page {
		height: 100%;
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>