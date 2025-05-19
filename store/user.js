// stores/user.js
import {
	defineStore
} from 'pinia';
import API from "@/request/index.js";
export const useUserStore = defineStore('user', {
	state: () => {
		return {
			userInfo:{
				token: '',
				avatar: '',
				userName:'',
				userId:'',
				password:'',
				loginName:'',
				phonenumber:'',
				openId:'',
				orgId:'',
				code:'',
				userCode:'',
				goodsCode:'',
				goodsCarNum:0,
			},
			
			goodsCarInfo:{
				isManage: false,
				goodsSelectIds: [],
			},
			loginState:false
		};
	},
	actions: {
		// 存购物车商品数量
		setGoodsCarNum(goodsCarNum) {
			this.userInfo.goodsCarNum = goodsCarNum;
		},
		// 存用户手机号和密码
		setUserPassword(password,loginName,remember) {
			this.userInfo.loginName = loginName;
			this.userInfo.password = password;
			this.userInfo.remember=remember;
		},
		// 存购物车数据
		setGoodsCarInfo(isManage,goodsSelectIds,goodsSelectId) {
			this.goodsCarInfo.isManage = isManage;
			this.goodsCarInfo.goodsSelectIds=goodsSelectIds;
			this.goodsCarInfo.goodsSelectId=goodsSelectId;
		},
		// 存用户token
		setUserToken(token) {
			this.userInfo.token = token||'';
		},
		// 存商品邀请码
		setGoodsCode(token) {
			this.userInfo.goodsCode = token||'';
		},
		// 存用户邀请码
		setUserInviteCode(token) {
			this.userInfo.userCode = token||'';
		},
		// 存用户openid
		setUserCode(code) {
			this.userInfo.openId = code||'';
		},
		// 修改用户登录状态
		setUserLoginState(login) {
			this.loginState=login;
		},
		// 存用户信息
		setUserInfo(userInfo) {
			this.userInfo.avatar = userInfo.avatar||'';
			this.userInfo.userName =  userInfo.name||'';
			this.userInfo.phonenumber =  userInfo.name||'';
			this.userInfo.userId = userInfo.userId||'';
			this.userInfo.orgId=userInfo.orgId||'';
			this.userInfo.code=userInfo.code||'';
			
		},
		// 获取购物车数量
		async getCarNum() {
			const res = await API.getCarNumApi({});
			if (res.code == 200) {
				this.setGoodsCarNum(res.data)
			} 
		}
	},
	persist: {
	    enabled: true,
	  },
});