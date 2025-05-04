<!-- 注销（销毁）账号 -->
<template>
	<view class="uni-content">
		<view class="problem_wrapper">
			<view class="title_view">
				一、注销是不可逆操作，注销后:
			</view>
			<view class="title_content_view">
				1.帐号将无法登录、无法找回。
			</view>
			<view class="title_content_view">
				2.帐号所有信息都会清除(个人信息、账单等)。
			</view>

			<view class="title_view">
				二、重要提示
			</view>
			<view class="title_content_view">
				1.注销后，你的手机号等绑定关系将解除(如有绑定手机号)，解除后可以绑定到其他帐号。
			</view>
			<view class="title_content_view">
				2.注销后，手机号可以注册新的帐号，新帐号不会存在之前帐号的任何信息。
			</view>
			<view class="title_content_view">
				3.视具体帐号情况而定，注销比较慢，请耐心等待。
			</view>
		</view>

		<view class="button-group">
			<button @click="nextStep" class="next" type="default">下一步</button>
			<button @click="cancel" type="warn">取消</button>
		</view>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	const dbcmd = db.command
	const xm_consumption_pages = 'xm-consumption-pages'
	export default {
		data() {
			return {

			}
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
		},
		onLoad() {},
		methods: {
			cancel() {
				uni.navigateBack()
			},
			nextStep() {
				uni.showModal({
					content: '已经仔细阅读注销提示，知晓可能带来的后果，并确认要注销',
					complete: (e) => {
						if (e.confirm) {
							if (this.userInfo && this.userInfo.role && (this.userInfo.role.indexOf(
									'system') !== -1 || this.userInfo.role.indexOf('admin') !== -1)) {
								uni.showModal({
									content: '系统账号，无法注销',
									showCancel: false,
									success: function(res) {
										if (res.confirm) {
											console.log('用户点击确定');
										} else if (res.cancel) {
											console.log('用户点击取消');
										}
									}
								});
								return
							}
							uni.showLoading({
								title: '正在删除信息...'
							})
							db.collection(xm_consumption_pages).where({
								user_id: db.getCloudEnv('$cloudEnv_uid')
							}).remove().then(() => {
								uni.showLoading({
									title: '信息成功，正在注销...'
								})
								const uniIdco = uniCloud.importObject("uni-id-co");
								uniIdco.closeAccount().then((e) => {
									uni.showToast({
										title: '注销成功',
										duration: 3000
									});
									uni.removeStorageSync('uni_id_token');
									uni.setStorageSync('uni_id_token_expired', 0)
									uni.navigateTo({
										url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
									})
								}).finally(() => {
									uni.hideLoading()
								})
							}).catch(err => {
								uni.showModal({
									title: '删除失败',
									icon: 'error',
									content: JSON.stringify(err),
									showCancel: false
								});
							}).finally(() => {
								uni.hideLoading()
							})

						} else {
							uni.navigateBack()
						}
					}
				});
			}
		}
	}
</script>

<style>
	.uni-content {
		display: flex;
		flex-direction: column;
		font-size: 28rpx;
	}

	.words {
		padding: 0 26rpx;
		line-height: 46rpx;
		margin-top: 20rpx;
		margin-bottom: 80px;
	}

	.button-group button {
		border-radius: 30rpx;
		border: none;
		width: 30%;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 32rpx;
	}

	.button-group button:after {
		border: none;
	}

	.button-group button.next {
		color: #e64340;
		border: solid 1px #e64340;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		position: fixed;
		height: 50px;
		bottom: 0px;
		width: 750rpx;
		justify-content: space-around;
		align-items: center;
		border-top: solid 1px #e4e6ec;
		/* padding-top: 10px; */
		background-color: #FFFFFF;
		/* max-width: 690px; */
	}


	@media screen and (min-width: 690px) {
		.uni-content {
			max-width: 690px;
			margin-left: calc(50% - 345px);
		}
	}

	.problem_wrapper {
		padding: 80rpx 40rpx 0;
		line-height: 1.6;
	}

	.title_view {
		padding: 30rpx 0;
		font-size: 36rpx;
		font-weight: bolder;
	}

	.title_content_view {
		padding-bottom: 30rpx;
	}

	.title_img_view {
		padding: 10rpx 6rpx;
	}
</style>