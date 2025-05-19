<template>
	<view class="address-box">
		<view class="address-title">选择区域</view>
		<view class="sure-text" @click="sureSelect">确认</view>
		<view class="opt-btn flex-start">
			<view class="cancel-text" @click="closeSelect">取消</view>
	<!-- 		<view class="split-line">|</view>
			<view class="close-text" @click="closeSelect">关闭</view> -->
		</view>
		
		<view class="address-item flex-start">
			<view class="address-text mr-20 text-ellipsis" :class="[address.province?'':'no-text']"
				@click="selectProvince">
				{{address.province||'省份/地区'}}
			</view>
			<view class="address-text mr-20 text-ellipsis" v-if="address.province" :class="[address.city?'':'no-text']"
				@click="selectCity">
				{{address.city||'城市'}}
			</view>
			<view class="address-text mr-20 text-ellipsis" v-if="address.province&&address.city"
				:class="[address.district?'':'no-text']" @click="selectDistrict">
				{{address.district||'区/县'}}
			</view>
			<view class="address-text mr-20 text-ellipsis" v-if="address.province&&address.city&&address.district"
				:class="[address.community?'':'no-text']">{{address.community||'街区'}}</view>
		</view>
		<view class="addree-content">
			<view v-for="(item,index) in dataTree" class="address-item">
				<view class="flex-between">
					<view :class="[address.provinceCode == item.code?'select-text':'']" @click="selectAddress(item)"
						v-if="item.level=='1'">
						{{item.name}}
					</view>
					<view :class="[address.cityCode == item.code?'select-text':'']" @click="selectAddress(item)"
						v-else-if="item.level=='2'">
						{{item.name}}
					</view>
					<view :class="[address.districtCode == item.code?'select-text':'']" @click="selectAddress(item)"
						v-else-if="item.level=='3'">
						{{item.name}}
					</view>
					<view :class="[address.communityCode == item.code?'select-text':'']" @click="selectAddress(item)"
						v-else>
						{{item.name}}
					</view>
					<uni-icons type="right" size="16" @click="selectNextAddress(item)"
						v-if="item.more&&item.level<=4"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import API from "@/request/index.js";
	export default {
		props: {
			addressData: {
				type: Array,
				default: []
			},
			isAll:{
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				address: {
					province: '',
					provinceCode: '',
					city: '',
					cityCode: '',
					district: '',
					districtCode: '',
					community: '',
					communityCode: ''
				},
				dataTree: [],
				selectAddressData: []
			}
		},
		mounted() {
			if (this.addressData.length > 0) {
				this.selectAddressData=[...this.addressData]
				this.getSelectedAddressDataByCode()
			} else {
				this.getProvinceData();
			}
		},
		methods: {
			/**
			 * @name 获取行政区域
			 */
			async getAreaList(params) {
				let functionAPI=this.isAll?API.getAllAreaListApi:API.getAreaListApi
				const res = await functionAPI(params);
				let data = [];
				if (res.code == 200) {
					data = res.data;
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}

				return data;
			},
			/**
			 * @name 获取省级数据
			 */
			async getProvinceData() {
				let params = {
					level: '1',
					parentCode: '0'
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 根据code获取已选择得区域数据
			 */
			getSelectedAddressDataByCode() {
				switch (this.addressData.length) {
					case 1:
						this.address.province = this.addressData[0].name;
						this.address.provinceCode = this.addressData[0].code;
						this.getProvinceData();
						break;
					case 2:
						this.address.province = this.addressData[0].name;
						this.address.provinceCode = this.addressData[0].code;
						this.address.city = this.addressData[1].name;
						this.address.cityCode = this.addressData[1].code;
						this.selectCity();
						break;
					case 3:
						this.address.province = this.addressData[0].name;
						this.address.provinceCode = this.addressData[0].code;
						this.address.city = this.addressData[1].name;
						this.address.cityCode = this.addressData[1].code;
						this.address.district = this.addressData[2].name;
						this.address.districtCode = this.addressData[2].code;
						this.selectDistrict();
						break;
					case 4:
						this.address.province = this.addressData[0].name;
						this.address.provinceCode = this.addressData[0].code;
						this.address.city = this.addressData[1].name;
						this.address.cityCode = this.addressData[1].code;
						this.address.district = this.addressData[2].name;
						this.address.districtCode = this.addressData[2].code;
						this.address.community = this.addressData[3].name;
						this.address.communityCode = this.addressData[3].code;
						this.selectCommunity();
						break;
				}
			},
			/**
			 * @name 选择下一级
			 */
			async selectNextAddress(item) {
				switch (item.level) {
					case 1:
						this.address.province = item.name;
						this.address.provinceCode = item.code;
						this.address.city = '';
						this.address.cityCode = '';
						this.address.district = '';
						this.address.districtCode = '';
						this.address.community = '';
						this.address.communityCode = '';
						break;
					case 2:
						this.address.city = item.name;
						this.address.cityCode = item.code;
						this.address.district = '';
						this.address.districtCode = '';
						this.address.community = '';
						this.address.communityCode = '';
						break;
					case 3:
						this.address.district = item.name;
						this.address.districtCode = item.code;
						this.address.community = '';
						this.address.communityCode = '';
						break;
					case 4:
						this.address.community = item.name;
						this.address.communityCode = item.code;
						break;
				}
				let params = {
					level: item.level + 1,
					parentCode: item.code
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 确认选择地区
			 */
			selectAddress(item) {
				this.selectAddressData = [];
				switch (item.level) {
					case 1:
						this.address.provinceCode = item.code;
						this.selectAddressData.push({
							name: item.name,
							code: item.code
						});
						break;
					case 2:
						this.address.provinceCode = this.address.provinceCode;
						this.address.cityCode = item.code;
						this.selectAddressData.push({
							name: this.address.province,
							code: this.address.provinceCode
						})
						this.selectAddressData.push({
							name: item.name,
							code: item.code
						});
						break;

					case 3:
						this.address.provinceCode = this.address.provinceCode;
						this.address.cityCode = this.address.cityCode;
						this.address.districtCode = item.code;
						this.selectAddressData.push({
							name: this.address.province,
							code: this.address.provinceCode
						})
						this.selectAddressData.push({
							name: this.address.city,
							code: this.address.cityCode
						})
						this.selectAddressData.push({
							name: item.name,
							code: item.code
						});
						break;
					case 4:
						this.address.provinceCode = this.address.provinceCode;
						this.address.cityCode = this.address.cityCode;
						this.address.districtCode = this.address.districtCode;
						this.address.communityCode = item.code;
						this.selectAddressData.push({
							name: this.address.province,
							code: this.address.provinceCode
						})
						this.selectAddressData.push({
							name: this.address.city,
							code: this.address.cityCode
						})
						this.selectAddressData.push({
							name: this.address.district,
							code: this.address.districtCode
						})
						this.selectAddressData.push({
							name: item.name,
							code: item.code
						});
						break;
				}
				console.log(this.selectAddressData);

			},
			/**
			 * @name 确认选择
			 */
			sureSelect() {
				this.$emit('getAddress', this.selectAddressData);
				this.$emit('cancelAddress');
			},
			/**
			 * @name 取消选择
			 */
			cancelSelect(){
				this.address.province = '';
				this.address.provinceCode = '';
				this.address.city = '';
				this.address.cityCode = '';
				this.address.district = '';
				this.address.districtCode = '';
				this.address.community = '';
				this.address.communityCode = '';
				this.selectAddressData=[];
				this.selectProvince();
				this.$emit('getAddress', this.selectAddressData);
			},
			/**
			 * @name 关闭弹窗
			 */
			closeSelect(){
				this.$emit('cancelAddress');
			},
			/**
			 * @name 选择省
			 */
			async selectProvince() {
				let params = {
					level: '1',
					parentCode: '0'
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 选择城市
			 */
			async selectCity() {
				let params = {
					level: '2',
					parentCode: this.address.provinceCode
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 选择区县
			 */
			async selectDistrict() {
				let params = {
					level: '3',
					parentCode: this.address.cityCode
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 选择街道
			 */
			async selectCommunity() {
				let params = {
					level: '4',
					parentCode: this.address.districtCode
				}
				this.dataTree = await this.getAreaList(params);
			},
			/**
			 * @name 根据层级匹配code
			 */
			getSelectCodeByLevel(item) {
				switch (item.level) {
					case 1:
						return this.address.provinceCode == item.code;
					case 2:
						return this.address.cityCode == item.code;
					case 3:
						return this.address.districtCode == item.code;
					case 4:
						return this.address.communityCode == item.code;
				}
			}

		}
	}
</script>

<style lang="scss" scoped>
	.address-box {
		height: 100%;
		padding: 40rpx;

		.address-title {
			font-size: 34rpx;
			text-align: center;
		}

		.address-item {
			height: 80rpx;
			line-height: 80rpx;
			border-bottom: 1px solid #D6D6D6;
		}

		.no-text {
			color: #909090;
		}

		.select-text {
			color: #FF6617;
		}

		.addree-content {
			height: 80%;
			overflow-y: auto;
			margin-top: 20rpx;
		}

		.address-text {
			width: 150rpx;
		}
	}

	.opt-btn {
		position: absolute;
		top: 30rpx;
		right: 20rpx;
	}

	.sure-text {
		position: absolute;
		top: 30rpx;
		left: 20rpx;
		color: #409EFF;
	}
	.split-line{
		margin:0 10rpx;
		color: #D6D6D6;
	}
	.cancel-text{
		color: #E6A23C;
	}
	.close-text{
		color: #909090;
	}
</style>
<style lang="less" scoped>
	/deep/ .uni-icons {
		color: #909090 !important;
	}
</style>