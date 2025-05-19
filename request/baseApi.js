import * as network from './network.js'
export default {
	/**
	 * @name 登录
	 * @returns 
	 */
	getUserLoginApi: params => {
		return network.POST('/login/doLogin', params)
	},
	/**
	 * @name 获取openid
	 * @returns 
	 */
	getWxOpenIdApi: params => {
		return network.GET('/login/getWxOpenId/' + params)
	},
	/**
	 * @name 注册
	 * @returns 
	 */
	userRegisterApi: params => {
		return network.POST('/register/userRegister', params)
	},
	/**
	 * @name 获取行政区域
	 * @returns 
	 */
	getAreaListApi: params => {
		return network.POST('/sysArea/getAreaList', params)
	},
	/**
	 * @name 获取全部行政区域
	 * @returns 
	 */
	getAllAreaListApi: params => {
		return network.POST('/sysArea/getAllAreaList', params)
	},
	/**
	 * @name 获取轮播图列表
	 * @returns 
	 */
	sysBannerListApi: params => {
		return network.GET('/sysBanner/list', params)
	},
	/**
	 * @name 获取商品列表
	 * @returns 
	 */
	getGoodsListApi: params => {
		return network.POST('/sysGoods/getGoodsList', params)
	},
	/**
	 * @name 获取商品品类列表
	 * @returns 
	 */
	getCategoryListApi: params => {
		return network.POST('/goods/getCategoryList', params)
	},
	/**
	 * @name 加入购物车
	 * @returns 
	 */
	addGoodsCarApi: params => {
		return network.POST('/goodsCar/addGoodsCar', params)
	},
	/**
	 * @name 获取购物车列表
	 * @returns 
	 */
	getCarListApi: params => {
		return network.POST('/goodsCar/getCarList', params)
	},
	/**
	 * @name 删除购物车
	 * @returns 
	 */
	deleteGoodsCarApi: params => {
		return network.GET('/goodsCar/deleteGoodsCar/' + params)
	},
	/**
	 * @name 修改购物车数量
	 * @returns 
	 */
	modifyGoodsCarApi: params => {
		return network.GET('/goodsCar/modifyGoodsCar/' + params.id + '/' + params.total)
	},
	/**
	 * @name 获取商品详情
	 * @returns 
	 */
	getGoodsDetailApi: params => {
		return network.GET('/sysGoods/getGoodsDetail/' + params.id)
	},
	/**
	 * @name 获取用户详细信息
	 * @returns 
	 */
	getUserInfoApi: params => {
		return network.POST('/login/getUserInfo', params)
	},
	/**
	 * @name 获取用户订单
	 * @returns 
	 */
	getSysOrderApi: params => {
		return network.POST('/sysOrder/getOrderList', params)
	},
	/**
	 * @name 删除用户订单
	 * @returns 
	 */
	deleteOrderApi: params => {
		return network.GET('/sysOrder/deleteOrder/' + params)
	},
	/**
	 * @name 小程序未付款订单去付款
	 * @returns 
	 */
	orderNowPayApi: params => {
		return network.GET('/sysOrder/nowPay/' + params)
	},
	/**
	 * @name 小程序退货申请
	 * @returns 
	 */
	returnGoodsApi: params => {
		return network.POST('/sysOrder/returnGoods', params)
	},
	/**
	 * @name 小程序用户公司申请审核状态
	 * @returns 
	 */
	orgApplyStatusApi: params => {
		return network.POST('/register/orgApplyStatus', params)
	},
	/**
	 * @name 获取订单详情
	 * @returns 
	 */
	getOrderDetailApi: params => {
		return network.GET('/sysOrder/getOrderDetail/' + params)
	},

	/**
	 * @name 小程序取消退货
	 * @returns 
	 */
	cancelReturnApi: params => {
		return network.GET('/sysOrder/cancelReturn/' + params)
	},

	/**
	 * @name 退款
	 * @returns 
	 */
	refundApi: params => {
		return network.POST('/login/refund', params)
	},

	/**
	 * @name 小程序确认收货
	 * @returns 
	 */
	confirmGoodsApi: params => {
		return network.GET('/sysOrder/confirmGoods/' + params)
	},
	/**
	 * @name 获取我的收货地址列表
	 * @returns 
	 */
	getAddressListApi: params => {
		return network.GET('/userAddress/getAddressList', params)
	},
	/**
	 * @name 新增收货地址
	 * @returns 
	 */
	addMyAddressApi: params => {
		return network.POST('/userAddress/addMyAddress', params)
	},
	/**
	 * @name 设置默认收货地址
	 * @returns 
	 */
	defualAddressApi: params => {
		return network.GET('/userAddress/defualAddress/' + params)
	},
	/**
	 * @name 删除收货地址
	 * @returns 
	 */
	deleteAddressApi: params => {
		return network.GET('/userAddress/deleteAddress/' + params)
	},
	/**
	 * @name 获取我的地址详情
	 * @returns 
	 */
	addressDetailApi: params => {
		return network.GET('/userAddress/addressDetail/' + params)
	},
	/**
	 * @name 删除地址
	 * @returns 
	 */
	modifyAddressApi: params => {
		return network.POST('/userAddress/modifyAddress', params)
	},
	/**
	 * @name 注册成为公司
	 * @returns 
	 */
	orgRegisterApplyApi: params => {
		return network.POST('/register/orgRegisterApply', params)
	},
	/**
	 * @name 分享链接
	 * @returns 
	 */
	getShareLinkApi: params => {
		return network.POST('/register/getShareLink', params)
	},
	/**
	 * @name 修改密码
	 * @returns 
	 */
	forgetPwdApi: params => {
		return network.POST('/login/forgetPwd', params)
	},
	/**
	 * @name 商品下单
	 * @returns 
	 */
	goodsBuyApi: params => {
		return network.POST('/sysOrder/goodsBuy', params)
	},
	/**
	 * @name 获取购物车的数量
	 * @returns 
	 */
	getCarNumApi: params => {
		return network.GET('/goodsCar/getCarNum', params)
	},
	/**
	 * @name 取消订单
	 * @returns 
	 */
	cancelOrderApi: params => {
		return network.GET('/sysOrder/cancelOrder/' + params)
	},
	/**
	 * @name 小程序各状态订单数量
	 * @returns 
	 */
	statisticsApi: params => {
		return network.GET('/sysOrder/statistics' , params)
	},
	
}