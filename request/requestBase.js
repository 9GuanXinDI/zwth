import {
	useUserStore
} from '@/store/user.js';
/**
 * url:网络请求的url
 * params:请求参数
 * success:成功的回调函数
 * fail：失败的回调
 */
export const request = (url, data, method, isLoading = true) => {
	if (isLoading) {
		// uni.showLoading({
		// 	title: "正在加载……",
		// })
	}
	
	
	return new Promise((resolve, reject) => {
		const user = useUserStore();
		let header=user.userInfo.token?
			{
				'Token': user.userInfo.token,
				'content-type': 'application/json'
			}:{
				'content-type': 'application/json'
			}
		uni.request({
			url: url,
			data: data,
			header: header,
			method: method,
			dataType: "aa", // 处理js精度问题
			timeout: '5000',
			success: function(res) {
				isLoading = false;
				let data = JSON.parse(res.data)
				let code = data.code;
				try {
					if (code == 200) {} else if (code == 600) {
						// 登录失效
						uni.showToast({
							title: '未登录,请先登录',
							icon: 'none',
							duration: 2000
						})
						setTimeout(() => {
							uni.navigateTo({
								url: `/pageA/login/login`,
							});
						}, 1000);
					}

					uni.hideLoading({
					fail() {}
				});
				} catch (e) {
					uni.showToast({
						title: JSON.stringify(e),
						icon: 'none',
					})
					uni.hideLoading({
					fail() {}
				});
					throw new Error(e);

				}
				uni.hideLoading({
					fail() {}
				});
				if (res.statusCode == 200) {
					resolve(data)
				} else {
					reject(res)
				}
			},
			fail: async function(e) {
				isLoading = false;
				uni.hideLoading({
					fail() {}
				});
				try {
					const res = await getNetworkType();
					console.log('networkType:' + res.networkType)
					if (res.networkType === "none" || res.networkType === "unknown") {
						uni.showToast({
							title: "网络连接失败,请检查！",
							icon: "none"
						})
						return false;
					}
				} catch (e) {

				}
				uni.showToast({
					title: JSON.stringify(e.errMsg),
					icon: "none"
				})
				reject(e);
			}
		})
	});
}

const getNetworkType = function() {
	return new Promise((resolve, reject) => {
		uni.getNetworkType({
			success(res) {
				resolve(res);
			},
			fail(err) {
				reject(err);
			}
		})
	})
}