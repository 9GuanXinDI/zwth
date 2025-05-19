<template>
	<view class="apply-company-box">
		<view class="apply-company-bg">
			<image src="../../assets/apply-company-box.png" class="appply-img"></image>
			<view class="apply-title">
				<view class="title">填写申请材料</view>
				<view class="info">请如实填写材料，以便审核通过</view>
			</view>
		</view>
		<view class="apply-company-content">
			<uni-forms ref="baseForm" :modelValue="baseFormData" :rules="rules" :label-width="100">
				<uni-forms-item label="申请人姓名" name="name" required>
					<uni-easyinput v-model="baseFormData.name" placeholder="请输入申请人姓名" />
				</uni-forms-item>
				<uni-forms-item label="公司名称" name="orgName" required>
					<uni-easyinput v-model="baseFormData.orgName" placeholder="请输入公司名称" />
				</uni-forms-item>
				<uni-forms-item label="公司性质" name="level" required>
					<uni-data-select v-model="baseFormData.level" :localdata="levelData"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="所属地" name="address" required>
					<view @click="selectAddress">
						<view v-if="addressData.length==0" class="address-text no-text">请选择所属地</view>
						<view v-else class="address-text text-ellipsis">{{addressData.map((item)=>item.name).join('/')}}
						</view>
						<uni-icons type="right" size="20" class="to-address-icon" color="#909090;"></uni-icons>
					</view>
				</uni-forms-item>
				<uni-forms-item label="上传证明（营业执照等）" name="imageValue" :label-width="100" required>
					<uni-file-picker limit="9" title="最多选择9张图片" v-model="baseFormData.imageValue" fileMediatype="image"
						mode="grid" @select="select" @delete="deleteFile" :auto-upload="false"></uni-file-picker>
				</uni-forms-item>

				<uni-forms-item label="公司简介" name="orgDesc">
					<uni-easyinput type="textarea" v-model="baseFormData.orgDesc" placeholder="请输入公司简介"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="申请理由" name="reason">
					<uni-easyinput type="textarea" v-model="baseFormData.reason" placeholder="请输入申请理由"></uni-easyinput>
				</uni-forms-item>
			</uni-forms>

		</view>
		<view class="bottom-box">
			<view class="add-address-btn" @click="applyCompany">提交申请</view>
		</view>
		<uni-popup ref="popup" background-color="#fff" :is-mask-click="false">
			<!-- <uni-icons type="closeempty" size="20" class="close-icon" @click="closeAddress"></uni-icons> -->
			<view style="height: 1000rpx;">
				<address-select v-if="isShowAddress" :addressData="addressData" @getAddress="getSelectAddress"
					@cancelAddress="closeAddress"></address-select>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	let user;
	import API from "@/request/index.js";
	import {
		useUserStore
	} from '@/store/user';
	import addressSelect from "@/components/addressSelect.vue"
	export default {
		components: {
			addressSelect
		},
		data() {
			return {
				isShowAddress: false,
				addressData: [],
				baseFormData: {
					address: "",
					addressInfo: '',
					fileIds: "",
					level: '',
					name: "",
					orgDesc: "",
					orgName: "",
					reason: "",
					imageValue: [],
				},
				type: 'add',
				idList: [],
				levelData: [{
						value: 2,
						text: "市级公司"
					},
					{
						value: 3,
						text: "区县公司"
					},
					{
						value: 4,
						text: "社区公司"
					},
				],
				rules: {
					address: {
						rules: [{
							required: true,
							errorMessage: '请选择所属地',
						}, ]
					},
					name: {
						rules: [{
							required: true,
							errorMessage: '请输入申请人姓名',
						}, ]
					},
					orgName: {
						rules: [{
							required: true,
							errorMessage: '请输入公司名称',
						}, ]
					},
					level: {
						rules: [{
							required: true,
							errorMessage: '请选择公司性质',
						}]
					},
					imageValue: {
						rules: [{
							required: true,
							errorMessage: '上传证明（营业执照等）',
						}]
					}
				}
			}
		},
		onShow() {
			user = useUserStore();
		},
		onLoad(options) {
			this.type = options.type;
			if (this.type == 'edit') {
				this.orgApplyStatus();
			}
		},
		methods: {
			/**
			 * @name 获取公司申请情况
			 */
			async orgApplyStatus() {
				const res = await API.orgApplyStatusApi();
				if (res.code == 200) {
					if (Object.keys(res.data.taskForm || {}).length > 0) {
						this.baseFormData = res.data.taskForm;
						let codeList = this.baseFormData.address.split(',');
						let nameList = this.baseFormData.addressInfo.split('-');
						this.addressData = codeList.map((item, index) => {
							return {
								name: nameList[index] ? nameList[index] : '',
								code: item
							}
						})
						this.baseFormData.imageValue = this.baseFormData.fileUrls.map((item) => {
							return {
								name: item,
								extname: item,
								url: item,
							}
						});
					}
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			},
			/**
			 * @name 选择地区
			 */
			selectAddress() {
				this.$refs.popup.open('bottom');
				this.isShowAddress = true;
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
			 * @name 关闭地区选择
			 */
			closeAddress() {
				this.isShowAddress = false;
				this.$refs.popup.close();
			},
			/**
			 * @name 上传图片
			 * @param {Object} e
			 */
			async select(e) {
				let list = e.tempFiles;
				for (let i = 0; i < list.length; i++) {
					let id = await this.upload(list[i].path, list[i].file)
					this.idList.push({
						id: id,
						name: list[i].name,
						extname: list[i].extname,
						path: list[i].path
					});
					this.baseFormData.imageValue.push(list[i])
				}
			},
			/**
			 * @name 删除文件
			 */
			deleteFile(e) {
				let index = this.idList.findIndex((item) => item.path == e.tempFilePath);
				if (index > -1) {
					this.idList.splice(index, 1);
					this.baseFormData.fileIds = this.idList.map((item) => item.id).join(',');
					this.baseFormData.imageValue.splice(index, 1);
				}
			},
			/**
			 * @name 上传文件
			 * @param {Object} path
			 * @param {Object} file
			 */
			upload(path, file) {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: 'https://zwth.xjjswh.cn/api/upload/uploadFile',
						filePath: path,
						header: {
							'Content-Type': 'multipart/form-data',
							'Token': user.userInfo.token,
						},
						name: 'updateFile',
						formData: {
							updateFile: file
						},
						success: function(res2) {
							resolve(JSON.parse(res2.data).data)
						},
						fail: function(err) {
							// 上传失败
							console.log(err);
						}
					});
				})
			},
			/**
			 * @name 提交申请
			 */
			async applyCompany() {
				this.$refs.baseForm.validate().then(res => {
					this.baseFormData.fileIds = [...this.idList].map((item) => item.id).join(',');
					let params = {
						address: this.baseFormData.address,
						fileIds: this.baseFormData.fileIds,
						level: this.baseFormData.level,
						name: this.baseFormData.name,
						orgDesc: this.baseFormData.orgDesc,
						orgName: this.baseFormData.orgName,
						reason: this.baseFormData.reason
					}
					API.orgRegisterApplyApi(params)
						.then((res) => {
							if (res.code == 200) {
								uni.showToast({
									title: this.addressId ? "编辑成功" : "新增成功",
									icon: 'success',
									duration: 2000
								})
								uni.navigateBack({
									delta: 1
								});
							} else {
								uni.showToast({
									title: res.message,
									icon: 'none',
									duration: 2000
								})
								this.type == 'edit' && this.orgApplyStatus();
							}
						}).catch((error) => {
							uni.showToast({
								title: error.errMsg,
								icon: 'none',
								duration: 2000
							})
							this.type == 'edit' && this.orgApplyStatus();
						})
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.apply-company-box {
		padding-bottom: 140rpx;
	}

	.apply-company-bg {
		position: relative;
		width: 100%;
		height: 406rpx;

		.appply-img {
			width: 100%;
			height: 100%;
		}

		.apply-title {
			position: absolute;
			top: 160rpx;
			left: 24rpx;

			.title {
				font-weight: bold;
				font-size: 42rpx;
				color: #FFFFFF;
			}

			.info {
				margin-top: 20rpx;
				font-size: 22rpx;
				color: #FFFFFF;
			}
		}
	}

	.apply-company-content {
		position: relative;
		margin: 0 24rpx;
		padding: 0 20rpx;
		margin-top: -40rpx;
		background: #FFFFFF;
		border-radius: 10rpx 10rpx 10rpx 10rpx;
	}

	.address-text {
		width: 450rpx;
		height: 97rpx;
		padding-left: 20rpx;
		line-height: 97rpx;
		font-size: 24rpx;
		border-bottom: 1px solid #EBEBEBFF !important;
	}

	.no-text {
		color: #909090;
	}

	.to-address-icon {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translate(0, -50%);
		color: #909090 !important;
	}

	.bottom-box {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #FFFFFF;
		z-index: 99;

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
	/deep/.is-input-border {
		height: 97rpx !important;
		border: 0 !important;
		border-bottom: 1px solid #EBEBEBFF !important;
	}

	/deep/ .is-textarea {
		display: contents;
		height: 82rpx !important;
		border-radius: 5rpx 5rpx 5rpx 5rpx;
		border-color: transparent !important;
		font-family: PingFangSC, PingFang SC;
		font-weight: 400;
		font-size: 14px;
		color: #858B9C;
		line-height: 20px;
		border: 0 !important;
	}


	/deep/.uni-easyinput__content-textarea {
		padding: 20rpx;
		background-color: #F0F0F0 !important;
	}

	/deep/ .uni-forms-item {
		min-height: 97rpx;
	}

	/deep/ .uni-forms-item__label {
		height: 97rpx;
	}

	/deep/ .uni-select {
		border: 0 !important;
	}

	/deep/ .uni-select__input-box {
		height: 97rpx !important;
		border-bottom: 1px solid #EBEBEBFF !important;
	}
</style>