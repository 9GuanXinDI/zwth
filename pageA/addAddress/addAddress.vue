<template>
	<view class="add-address-box">
		<uni-forms ref="baseForm" :modelValue="baseFormData" :rules="rules">
			<uni-forms-item label="收货人" name="name">
				<uni-easyinput v-model="baseFormData.name" placeholder="请输入收货人的姓名" />
			</uni-forms-item>
			<uni-forms-item label="手机号码" name="phone">
				<uni-easyinput v-model="baseFormData.phone" placeholder="请输入手机号码" />
			</uni-forms-item>
			<uni-forms-item label="所在地区" name="addressInfo">
				<view @click="selectAddress">
					<view v-if="addressData.length==0" class="address-text no-text">请选择省市区街道</view>
					<view v-else class="address-text text-ellipsis">{{addressData.map((item)=>item.name).join('/')}}
					</view>
					<uni-icons type="right" size="20" class="to-address-icon" color="#909090;"></uni-icons>
				</view>
			</uni-forms-item>
			<uni-forms-item label="详细地址" name="detail">
				<uni-easyinput type="textarea" v-model="baseFormData.detail" placeholder="小区,门牌号"></uni-easyinput>
			</uni-forms-item>
		</uni-forms>
		<view class="bottom-box">
			<view class="add-address-btn" @click="addAddress">保存地址</view>
		</view>
	</view>
	<uni-popup ref="popup" background-color="#fff" :is-mask-click="false">
		<!-- <uni-icons type="closeempty" size="20" class="close-icon" @click="closeAddress"></uni-icons> -->
		<view style="height: 1000rpx;">
			<address-select v-if="isShowAddress" :addressData="addressData" :isAll="true"
				@getAddress="getSelectAddress" @cancelAddress="closeAddress"></address-select>
		</view>
	</uni-popup>
</template>

<script>
	import API from "@/request/index.js";
	import addressSelect from "@/components/addressSelect.vue"
	export default {
		components: {
			addressSelect
		},
		data() {
			return {
				addressId: '',
				baseFormData: {
					address: "",
					addressInfo: "",
					detail: "",
					name: "",
					phone: ""
				},
				isShowAddress: false,
				addressData: [],
				rules: {
					addressInfo: {
						rules: [{
							required: true,
							errorMessage: '请选择省市区街道',
						}, ]
					},
					name: {
						rules: [{
							required: true,
							errorMessage: '请输入收件人姓名',
						}, ]
					},
					phone: {
						rules: [{
							required: true,
							errorMessage: '请输入收件人手机号',
						}, {
							validateFunction: function(rule, value, data, callback) {
								if (!(/^1[3456789]\d{9}$/.test(value))) {
									callback('手机号格式输入错误!');
								} else {
									callback();
								}
								return true
							}
						}]
					},
					detail: {
						rules: [{
							required: true,
							errorMessage: '请输入详细地址',
						}, ]
					}
				}
			}
		},
		onLoad(options) {
			this.addressId = options.id;
			uni.setNavigationBarTitle({
				title:this.addressId? '编辑地址':'新增地址'
			});
			if (this.addressId) {
				this.addressDetail();
			}
		},
		methods: {
			/**
			 * @name 获取我的地址详情
			 */
			async addressDetail() {
				const res = await API.addressDetailApi(this.addressId);
				if (res.code == 200) {
					this.baseFormData.address = res.data.address;
					this.baseFormData.addressInfo = res.data.addressInfo;
					this.baseFormData.detail = res.data.detail;
					this.baseFormData.name = res.data.name;
					this.baseFormData.phone = res.data.phone;
					this.getAddressData(res.data)
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 处理选中的地区
			 */
			getAddressData(data){
				let codeList=data.address.split(',');
				let nameList=data.addressInfo.split(',');
				this.addressData=codeList.map((item,index)=>{
					return{
						name:nameList[index]?nameList[index]:'',
						code:item
					}
				})
			},
			/**
			 * @name 选择地区
			 */
			selectAddress() {
				this.$refs.popup.open('bottom');
				this.isShowAddress = true;
			},
			/**
			 * @name 关闭地区选择
			 */
			closeAddress() {
				this.isShowAddress = false;
				this.$refs.popup.close();
			},
			/**
			 * @name 获取已选地址数据
			 */
			getSelectAddress(data) {
				this.addressData = data;
				this.baseFormData.addressInfo = this.addressData.length == 0 ? '' : this.addressData.map((item) => item
					.name).join(
					',');
				this.baseFormData.address = this.addressData.length == 0 ? '' : this.addressData.map((item) => item.code)
					.join(
						',');
				// this.closeAddress();
			},
			/**
			 * @name 确认收货地址
			 */
			async addAddress() {
				this.$refs.baseForm.validate().then(res => {
					let params = {
						...this.baseFormData,
						id: this.addressId || ''
					}
					let functionAPI = this.addressId ? API.modifyAddressApi : API.addMyAddressApi;
					functionAPI(params)
						.then((res) => {
							if (res.code == 200) {
								uni.showToast({
									title: this.addressId ? "编辑成功" : "新增成功",
									icon: 'success',
									duration: 2000
								})
								let pages = getCurrentPages();
								let prevPage = pages[ pages.length - 2 ];
								 prevPage.$vm.getAddressList();
								uni.navigateBack({
									delta: 1 //返回层数，2则上上页
								});
							} else {
								uni.showToast({
									title: res.message,
									icon: 'none',
									duration: 2000
								})
							}
						}).catch((error) => {
							uni.showToast({
								title: error.errMsg,
								icon: 'none',
								duration: 2000
							})
						})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add-address-box {
		min-height: 757rpx;
		margin: 30rpx 24rpx;
		padding: 40rpx 20rpx;
		background: #FFFFFF;
		border-radius: 10rpx;
	}

	.to-address-icon {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translate(0, -50%);
		color: #909090 !important;
	}

	.close-icon {
		position: absolute;
		top: 40rpx;
		right: 30rpx;
		color: #909090 !important;
	}

	.address-text {
		width: 450rpx;
		height: 70rpx;
		padding-left: 20rpx;
		line-height: 70rpx;
		font-size: 24rpx;
	}

	.no-text {
		color: #909090;
	}

	.bottom-box {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;

		.add-address-btn {
			width: 702rpx;
			height: 80rpx;
			margin: 15rpx auto;
			text-align: center;
			line-height: 80rpx;
			background: #FF6617;
			border-radius: 40rpx;
			font-size: 30rpx;
			color: #FFFFFF;
		}
	}
</style>
<style lang="less" scoped>
	/deep/ .is-textarea {
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 14px;
		color: #858B9C;
		line-height: 20px;
	}

	/deep/.is-input-border {
		// height: 290rpx !important;
		border: 0 !important;
		border-bottom: 1px solid #EBEBEBFF !important;
		// background: #FAFAFA !important;
	}

	/deep/ .is-textarea {
		// 使用/deep/对组件内样式修改
		border: 0 !important;
	}

	/deep/ .is-textarea {
		display: contents;
		height: 82rpx !important;
		border: 0 !important;
		border-radius: 5rpx 5rpx 5rpx 5rpx;
		border-color: transparent !important;
	}


	/deep/.uni-easyinput__content-textarea {
		padding: 20rpx;
		background-color: #F0F0F0 !important;
	}
</style>