<template>
	<view v-if="userId">
		<view class="top-banner flex-end" @click="changeManageType">
			{{isManage?'退出管理':'管理'}}
		</view>
		<view class="content">
			<view v-if="goodsCarList.length>0">
				<view class="goods-car-item flex-start" v-for="(item,index) in goodsCarList" :key="index"
					@click="goToGoodsDetail(item)">
					<view
						:class="[item.carStatus==2?'radio-icon-disabled':item.isSelect?'radio-icon-select':'radio-icon']"
						@click.stop="selectGoods(item)">
					</view>
					<view class="goods-img-box">
						<image class="goods-img" :src="item.coverUrl">
						</image>
						<view class="lose-efficacy-box" v-if="item.carStatus==2">
							<image src="../../assets/lose-efficacy.png" class="lose-efficacy-icon"></image>
						</view>
					</view>
					<view class="goods-info">
						<view class="info-name"><text
								class="mr-10">{{item.name}}</text><text>含{{item.count}}件应急物品</text>
						</view>
						<view class="info-desc">{{item.desc}}</view>
						<view class="info-num flex-between">
							<text class="money"><text class="symbol">￥</text>{{item.price}}</text>
							<view @tap.stop.prevent>
								<uni-number-box :min="1" :value="item.total" @change.stop="changeGoods($event,item)"
									v-if="!isManage" :disabled="item.carStatus==2" />
							</view>
						</view>
					</view>
					<image src="../../assets/delete.png" class="delect-icon" v-if="isManage"
						@click.stop="delectCurrentGoods(item)"></image>
				</view>
			</view>
			<view v-else class="no-data">
				<image src="../../assets/not-data.png" class="no-data-img"></image>
				<view class="no-data-text">购物车空空如也,快去选购吧</view>
			</view>
		</view>
		<view class="goods-car-bottom flex-between" v-if="isManage">
			<view class="flex-start">
				<uni-data-checkbox v-model="isAllSelect" :multiple="true" :localdata="checkData"
					@change="selectAllData" />全选
			</view>
			<view class="settlement-btn" @click="delectGoods">删除{{goodsSelectIds.length==0?'':goodsSelectIds.length}}
			</view>

		</view>
		<view class="goods-car-bottom flex-end" v-else>
			<view class="flex-start">
				<view>
					<text class="text">合计:</text>
					<text class="money"><text class="symbol">￥</text>{{price}}</text>
				</view>
				<view class="settlement-btn" @click="buy">结算</view>
			</view>
		</view>
		<bottom-banner :tabIndex='2'></bottom-banner>
		<sure-login v-if="isShowLogin" @close-login="closeLogin"></sure-login>
	</view>
</template>

<script>
	let user;
	import {
		useUserStore
	} from '@/store/user';
	import API from "@/request/index.js";
	import sureLogin from "@/components/sureLogin.vue"
	import bottomBanner from "@/components/bottomBanner.vue"
	export default {
		components: {
			sureLogin,
			bottomBanner
		},
		data() {
			return {
				userId: '',
				isShowLogin: false,
				checkData: [{
					text: '',
					value: 0
				}],
				isAllSelect: [],
				price: '0.00',
				goodsCarList: [],
				isManage: false,
				goodsSelectIds: [],
				goodsSelectId: '',
				currentPage: 1,
				goodsTotal: 0,
				statusType: 'noMore',
				total:1
			}
		},
		onLoad() {

		},
		onShow() {
			user = useUserStore();
			// if (!user.loginState) {
			this.userId = user.userInfo.userId;
			this.isManage = user.goodsCarInfo.isManage;
			this.goodsSelectId = user.goodsCarInfo.goodsSelectId;
			this.goodsSelectIds = user.goodsCarInfo.goodsSelectIds;
			this.handleSearch();
			uni.pageScrollTo({
				scrollTop: 0, // 滚动到页面的顶部
				duration: 300 // 滚动动画的持续时间，单位为ms
			});
			// }


		},
		onHide() {
			this.isManage && this.changeManageType()
			// user = useUserStore();
			// if(!user.userInfo.userId){
			// 	user.setUserLoginState(true)
			// }
		},
		mounted() {},
		onPullDownRefresh() {
			let _this = this;
			uni.startPullDownRefresh({
				success() {
					_this.handleSearch();
				},
				fail() {}
			})
			uni.stopPullDownRefresh();
		},
		onReachBottom() {
			let allTotal = this.currentPage * 10
			if (allTotal < this.goodsTotal) {
				this.statusType = "loading";
				this.currentPage++;
				this.getCarList(); //请求更多数据列表
			} else {
				this.statusType = "noMore";
			}
		},
		methods: {
			/**
			 * @name 取消登录
			 */
			closeLogin() {
				this.isShowLogin = false;
			},
			/**
			 * @name 切换管理购物车状态
			 */
			changeManageType() {
				this.isManage = !this.isManage;
				this.isAllSelect = [];
				this.goodsSelectIds = [];
				this.goodsSelectId = '';
				this.price = '0.00';
				this.goodsCarList.forEach((sitem) => {
					sitem.isSelect = false;
				})
				this.storageCarInfo();
			},
			/**
			 * @name 删除单个购物车
			 */
			async delectCurrentGoods(item) {
				const res = await API.deleteGoodsCarApi(item.id);
				if (res.code == 200) {
					let index = this.goodsCarList.findIndex((sitem) => sitem.id == item.id);
					if (index > -1) {
						this.goodsCarList.splice(index, 1);
					}
					let gindex = this.goodsSelectIds.findIndex((s) => s == item.id);
					if (gindex > -1) {
						this.goodsSelectIds.splice(gindex, 1);
					}

					if (this.goodsCarList.length == 0) {
						this.handleSearch();
					}
					this.isAllSelect = [];
					this.storageCarInfo();
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
				user.getCarNum()
			},
			/**
			 * @name 全选
			 */
			selectAllData(val) {
				let list = [];
				this.goodsCarList.forEach((item) => {
					item.isSelect = val.detail.value.length > 0
					if (item.isSelect && item.carStatus == 1) {
						list.push(item.id);
						this.goodsSelectId = item.id;
					}
				})
				this.goodsSelectIds = list;
				this.isAllSelect = val.detail.value.length > 0 ? [0] : [],
					this.storageCarInfo();
			},
			/**
			 * @name 更新全选状态
			 */
			checkAllSelect() {
				let list = this.goodsCarList.filter((item) => item.isSelect == false);
				this.isAllSelect = list.length > 0 ? [] : [0],
					this.storageCarInfo();
			},
			/**
			 * @name 删除多个购物车
			 */
			async delectGoods(item) {
				if (this.goodsSelectIds.length == 0) {
					uni.showToast({
						title: "请先选择",
						icon: 'none',
						duration: 2000
					})
					return
				}
				let id = this.goodsSelectIds.join(',')
				const res = await API.deleteGoodsCarApi(id);
				if (res.code == 200) {
					for (let i = 0; i < this.goodsCarList.length; i++) {
						if (this.goodsSelectIds.indexOf(this.goodsCarList[i].id) > -1) {
							this.goodsCarList.splice(i, 1);
							i--;

						}
					}
					this.goodsSelectIds = [];
					this.isAllSelect = [];
					if (this.goodsCarList.length == 0) {
						this.handleSearch();
					}
					this.storageCarInfo();
				}
				user.getCarNum()
			},
			/**
			 * @name 更新数据
			 */
			handleSearch() {
				this.currentPage = 1;
				this.goodsCarList = [];
				this.getCarList();
			},
			/**
			 * @name 获取购物车列表
			 */
			async getCarList() {
				let params = {
					currentPage: this.currentPage,
					pageSize: 10
				}
				const res = await API.getCarListApi(params);
				let list = this.goodsCarList.concat(res.data?.list);
				this.goodsCarList = list.map((item) => {
					return {
						...item,
						isSelect: this.isManage ? this.goodsSelectIds.indexOf(item.id) > -1 : item.id == this
							.goodsSelectId
					}
				});
				this.goodsTotal = res.data.allTotal;
				if (this.isManage) {
					this.checkAllSelect()
				} else {
					this.updatePrice();
				}
			},
			/**
			 * @name 加购和减购购物车
			 */
			changeGoods(val, item) {
				this.addShoppingCart(item, val)
			},
			/**
			 * @name 加入购物车
			 */
			async addShoppingCart(item, num) {
				const res = await API.modifyGoodsCarApi({
					id: item.id,
					total: num
				});
				if (res.code == 200) {
					item.total = num;
					this.updatePrice();
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 选择购物车数据
			 */
			selectGoods(item) {
				if (item.carStatus == 1) {
					if (this.isManage) {
						item.isSelect = !item.isSelect;
						let list = this.goodsCarList.filter((item) => item.isSelect);
						this.goodsSelectIds = this.filterData(list.map((item) => item.id))
						this.checkAllSelect()
					} else {
						this.goodsCarList.forEach((sitem) => {
							sitem.isSelect = false;
							sitem.isSelect = item.id == sitem.id;
							this.goodsSelectId = item.id;
						})
						this.updatePrice();
					}
					this.storageCarInfo();
				}

			},
			/**
			 * @name 过滤数据
			 */
			filterData(list){
				let data=this.goodsSelectIds.concat(list);
				let array=[];
				for(let i=0;i<data.length;i++){
					let object=array.filter((item)=>item==data[i])[0];
					if(!object){
						array.push(data[i])
					}
				}
				return array
			},
			/**
			 * @name 查看商品详情
			 */
			goToGoodsDetail(item) {
				uni.navigateTo({
					url: `/pageA/goodsInfo/goodsInfo?id=` + item.goodsId
				});
			},
			/**
			 * @name 更新结算金额
			 */
			updatePrice() {
				let price = 0;
				this.goodsCarList.forEach((item) => {
					if (item.isSelect) {
						price += item.total * item.price;
					}
				})
				this.price = price.toFixed(2);
				this.storageCarInfo();
			},
			buy() {
				if (!this.userId) {
					this.isShowLogin = true;
				} else {
					if(this.goodsSelectId==''){
						uni.showToast({
							title: "请先选择商品",
							icon: 'none',
							duration: 2000
						})
						return
					}
					let obj=this.goodsCarList.filter((item)=>item.id==this.goodsSelectId)[0];
					if(obj){
						this.total=obj.total
						uni.navigateTo({
							url: `/pageA/paymentInfo/paymentInfo?id=` + obj.goodsId+'&carId='+this.goodsSelectId+`&total=${this.total}`+'&type=2'
						});
					}
					
				}
			},
			/**
			 * @name 记住当前选择
			 */
			storageCarInfo() {
				user.setGoodsCarInfo(this.isManage, this.goodsSelectIds, this.goodsSelectId);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		margin-top: 100rpx;
		padding-bottom: 260rpx;
	}

	.goods-car-item {
		position: relative;
		width: 702rpx;
		height: 230rpx;
		margin: 20rpx auto 0 auto;
		background: #fff;
		border-radius: 10rpx;

		.radio-icon {
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: #fff;
			border: 2rpx solid #D6D6D6;
			border-radius: 50%;
		}

		.radio-icon-disabled {
			position: relative;
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: rgb(220, 223, 230);
			border: 2rpx solid rgb(220, 223, 230);
			border-radius: 50%;
		}

		.radio-icon-select {
			position: relative;
			width: 32rpx;
			height: 32rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			background: #fff;
			border: 2rpx solid #FF6617;
			border-radius: 50%;
		}

		.radio-icon-select::after {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			content: '';
			display: block;
			width: 20rpx;
			height: 20rpx;
			background-color: #FF6617;
			border-radius: 50%;
		}

		.goods-img {
			width: 190rpx;
			height: 190rpx;
			margin-left: 20rpx;
			border-radius: 5rpx 5rpx 5rpx 5rpx;
		}

		.lose-efficacy-box {
			position: absolute;
			top: 48%;
			left: 22rpx;
			transform: translate(0, -50%);
			width: 190rpx;
			height: 190rpx;
			text-align: center;
			border-radius: 5rpx 5rpx 5rpx 5rpx;
			background-color: rgba(0, 0, 0, 0.35);

			.lose-efficacy-icon {
				width: 120rpx;
				height: 120rpx;
				margin: 35rpx 0;
			}
		}

		.delect-icon {
			position: absolute;
			top: 50%;
			right: 8rpx;
			transform: translate(0, -50%);
			width: 30rpx;
			height: 30rpx;
		}

		.goods-info {
			width: 360rpx;
			margin-left: 20rpx;

			.info-name {
				font-size: 28rpx;
				color: #1A1A1A;
			}

			.info-desc {
				min-width: 254rpx;
				height: 44rpx;
				line-height: 44rpx;
				margin-top: 18rpx;
				text-align: center;
				background: #F0F0F0;
				border-radius: 2rpx;
				font-size: 24rpx;
				color: #909090;
			}

			.info-num {
				margin-top: 30rpx;

				.money {
					margin-right: 40rpx;
					font-size: 38rpx;
					color: #1A1A1A
				}

				.symbol {
					margin-right: 6rpx;
					font-size: 24rpx;
					color: #1A1A1A;
				}
			}
		}
	}

	.goods-img-box {
		position: relative;
	}

	.goods-car-bottom {
		position: fixed;
		bottom: 138rpx;
		left: 0;
		width: calc(100% - 48rpx);
		height: 110rpx;
		padding: 0 24rpx;
		background: #fff;
		border-bottom: 1px solid #EBEBEB;
		z-index: 2;

		.text {
			margin-right: 10rpx;
			font-size: 22rpx;
			color: #909090;
		}

		.money {
			margin-right: 40rpx;
			font-weight: bold;
			font-size: 30rpx;
			color: #FF6617;
		}

		.symbol {
			margin-right: 6rpx;
			font-weight: bold;
			font-size: 24rpx;
			color: #FF6617;
		}

		.settlement-btn {
			width: 150rpx;
			height: 80rpx;
			text-align: center;
			line-height: 80rpx;
			background: #FF6617;
			border-radius: 40rpx;
			font-size: 30rpx;
			color: #fff;
		}
	}

	.no-data {
		width: 426rpx;
		margin: 250rpx auto 0 auto;
		text-align: center;

		.no-data-img {
			width: 100%;
			height: 230rpx;
		}

		.no-data-text {
			margin-top: 79rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #1A1A1A;
		}
	}

	.top-banner {
		position: fixed;
		top: 0;
		left: 0;
		width: calc(100% - 48rpx);
		padding: 0 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: #fff;
		font-size: 26rpx;
		color: #1A1A1A;
		z-index: 6;
	}
</style>
<style lang="less" scoped>
	/deep/ .checklist-box {
		margin-right: 5rpx !important;
	}

	/deep/ .uni-data-checklist .checklist-group .checklist-box.is--default.is-checked .checkbox__inner {
		border-color: #FF6617 !important;
		background-color: #FF6617 !important;
	}
</style>