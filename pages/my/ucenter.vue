<template>
	<wrapperPage>
		<view class="center">
			<!-- #ifndef MP-WEIXIN -->
			<view v-if="hasLogin && !mobileNoticeStatus && !userInfo.mobile">
				<uni-notice-bar style="margin: 0;" show-icon show-close single scrollable text="请及时绑定手机号，防止忘记密码！"
					@close="closeNotice" />
			</view>
			<!-- #endif -->
			<view class="userInfo" @click.capture="toUserInfo">
				<view class="bg_wrapper">
				</view>
				<cloud-image width="150rpx" height="150rpx" classImg="avatar_wrapper_img"
					v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url"
					:src="userInfo.avatar_file.url"></cloud-image>
				<view v-else class="defaultAvatarUrl">
					<view class="default_avatar"></view>
				</view>

				<view class="logo-title">
					<text class="uer-name"
						v-if="hasLogin">{{userInfo.nickname||userInfo.username||userInfo.mobile}}</text>
					<text class="uer-name" v-else>未登录</text>
				</view>
			</view>
			<view class="mt15">
				<uni-list :border="false">
					<uni-list-item title="分类管理" to="/secpackage/bookkeeping/config/typeConfig/typeConfig"
						link="navigateTo"></uni-list-item>
					<uni-list-item title="备注管理" to="/secpackage/bookkeeping/config/remarkConfig/remarkConfig"
						link="navigateTo"></uni-list-item>
					<uni-list-item title="账号资料" to="/uni_modules/uni-id-pages/pages/userinfo/userinfo"
						link="navigateTo"></uni-list-item>
					<!-- <uni-list-item v-if="userInfo.mobile" title="修改密码"
					to="/uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd" link="navigateTo"></uni-list-item> -->
				</uni-list>
			</view>
			<!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
			<view class="mt15">
				<uni-list :border="false">
					<uni-list-item title="订阅消息" to="/secpackage/my/subscriptionMessage/subscriptionMessage"
						link="navigateTo"></uni-list-item>
				</uni-list>
				<!-- <uni-list :border="false">
				<uni-list-item>
					<template v-slot:body>
						<view class="flex_row switchView">
							<view>记账月报</view>
							<u-switch v-model="switchMonthFlag" asyncChange @change="switchChange"></u-switch>
						</view>
					</template>
				</uni-list-item>
			</uni-list> -->
			</view>
			<!-- #endif -->

			<view class="mt15">
				<uni-list :border="false">
					<uni-list-item title="隐私政策" to="/secpackage/my/agreement/privacyAgreement"
						link="navigateTo"></uni-list-item>
					<uni-list-item title="使用指南" to="/secpackage/my/playingmethod/playingmethod"
						link="navigateTo"></uni-list-item>
					<uni-list-item title="小明和小明的故事" to="/secpackage/my/xiaomingstory/xiaomingstory"
						link="navigateTo"></uni-list-item>
					<uni-list-item v-if="problemList.length>0" title="常见问题"
						to="/secpackage/my/problem/frequentlyAskedQuestions" link="navigateTo"></uni-list-item>
					<!-- <uni-list-item title="功能介绍" to="/secpackage/my/problem/introduction" link="navigateTo"></uni-list-item> -->
					<!-- #ifdef MP-WEIXIN -->
					<!-- <uni-list-item title="评价与反馈" clickable @click="gotoPingjia"></uni-list-item> -->
					<!-- #endif -->
					<!-- <uni-list-item title="使用指南" to="/secpackage/my/playingmethod/playingmethod"
					link="navigateTo"></uni-list-item> -->
					<uni-list-item v-if="imgList.length>0" title="请开发者喝咖啡" to="/secpackage/my/reward"
						link="navigateTo"></uni-list-item>
				</uni-list>
			</view>

			<!-- 退出/登录 按钮 -->
			<view class="bottom-back" @click="changeLoginState">
				<text class="bottom-back-text" v-if="hasLogin">退出登录</text>
				<text class="bottom-back-text" v-else>登录</text>
			</view>

			<view class="bottom-back">
				<u-button custom-style="border: none;background: transparent!important;font-size: 33rpx;"
					open-type="share">分享小程序</u-button>
			</view>

		</view>
	</wrapperPage>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store'
	const db = uniCloud.database()
	const xm_consumption_report_remind = 'xm-consumption-report-remind'
	const xm_consumption_rewards = "xm-consumption-rewards"
	const xm_consumption_problems = "xm-consumption-problems"

	export default {
		data() {
			return {
				cSrc: '',
				cSrcOld: '',
				// switchMonthFlag: false,
				mobileNoticeStatus: true,
				switchMonthFlagObj: {},
				imgList: [],
				problemList: [],
				commonInfo: {
					result: {
						share_img: ''
					}
				}
			}
		},
		onLoad() {
			db.collection(xm_consumption_rewards).where({
					show: true
				})
				.get().then(res => {
					this.imgList = res.result.data
				})
			db.collection(xm_consumption_problems)
				.where({
					isShow: true
				}).orderBy(
					'rank asc').get().then(res => {
					this.problemList = res.result.data
				})
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
		},
		watch: {
			userInfo: {
				handler(newVal, oldVal) {
					if (this.hasLogin && newVal.avatar_file && newVal.avatar_file.url) {
						let src = newVal.avatar_file.url
						if (this.cSrcOld != src) {
							this.cSrcOld = src
							if (src && src.substring(0, 8) == "cloud://") {
								uniCloud.getTempFileURL({
									fileList: [src]
								}).then(res => {
									this.cSrc = res.fileList[0].tempFileURL
								})
							} else {
								this.cSrc = src
							}
						}
					} else {
						this.cSrc = "../../static/uni-center/headers.png"
					}
				},
				immediate: true
			}
		},
		onShow() {
			if (this.hasLogin) {
				mutations.updateUserInfo()
				this.getStatus()
			}
		},
		created() {
			uniCloud.callFunction({
				name: 'getCommonInfo',
				data: {}
			}).then(com => {
				this.commonInfo = com
			});
		},
		methods: {
			// gotoPingjia() {
			// 	let plugin = requirePlugin("wxacommentplugin");
			// 	plugin.openComment({
			// 		success: (res) => {
			// 			console.log('plugin.openTradeComment success', res)
			// 			// uni.showToast({
			// 			// 	title: '您已完成了评价与反馈，请30天后再试。'
			// 			// })
			// 			uni.showModal({
			// 				title: '提示',
			// 				showCancel: false,
			// 				content: '您已完成了评价与反馈，请30天后再试。',
			// 				success: (res) => {
			// 					if (res.confirm) {
			// 						console.log('用户点击确定');
			// 					} else if (res.cancel) {
			// 						console.log('用户点击取消');
			// 					}
			// 				}
			// 			});

			// 		},
			// 		fail: (res) => {
			// 			console.log('plugin.openTradeComment fail', res)
			// 		}
			// 	})
			// },
			closeNotice() {
				let data = {
					mobileNoticeStatus: true
				}
				if (this.switchMonthFlagObj._id) {
					db.collection(xm_consumption_report_remind).doc(this.switchMonthFlagObj._id).update(data).then(
						res => {
							this.getStatus()
						})
				} else {
					db.collection(xm_consumption_report_remind).add(data).then(res => {
						this.getStatus()
					})
				}
			},
			getStatus() {
				db.collection(xm_consumption_report_remind).where({
						user_id: db.getCloudEnv('$cloudEnv_uid')
					})
					.get({
						getOne: true
					}).then(res => {
						if (res && res.result && res.result.data) {
							this.switchMonthFlagObj = res.result.data
							// this.switchMonthFlag = res.result.data.statusMonth
							this.mobileNoticeStatus = res.result.data.mobileNoticeStatus || false
						} else {
							this.mobileNoticeStatus = false
						}
					}).finally(() => {})
			},
			// switchChange(e) {
			// 	uni.showModal({
			// 		content: e ? '开启后每月第一次进入小程序将会收到月报提醒' : '关闭后将不会再收到月报提醒',
			// 		success: (res) => {
			// 			if (res.confirm) {
			// 				let data = {
			// 					statusMonth: e
			// 				}
			// 				if (this.switchMonthFlagObj._id) {
			// 					db.collection(xm_consumption_report_remind).doc(this.switchMonthFlagObj._id).update(data).then(
			// 						res => {
			// 							this.getStatus()
			// 						})
			// 				} else {
			// 					db.collection(xm_consumption_report_remind).add(data).then(res => {
			// 						this.getStatus()
			// 					})
			// 				}
			// 			}
			// 		}
			// 	})
			// },
			async changeLoginState() {
				if (this.hasLogin) {
					await mutations.logout()
				} else {
					uni.redirectTo({
						url: '/uni_modules/uni-id-pages/pages/login/login-withpwd',
					});
				}
			},
			toUserInfo() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				})
			}
		},
		onShareAppMessage() {
			return {
				// title: '欢迎体验小明记账簿',
				title: this.commonInfo.result.share_text,
				imageUrl: this.commonInfo.result.share_img,
				path: '/pages/my/ucenter'
			}
		},
		onShareTimeline() {
			return {
				title: this.commonInfo.result.share_text,
				// desc: '收支一目了然',
				path: '/pages/my/ucenter',
				imageUrl: this.commonInfo.result.share_img,
				query: ''
			}
		}
	}
</script>

<style lang="scss">
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	page {
		background-color: #f8f8f8;
	}

	/* #endif*/

	.center {
		flex: 1;
		flex-direction: column;
		background-color: #f8f8f8;
	}

	.userInfo {
		// padding: 20rpx;
		padding-top: 120rpx;
		background-image: url(../../static/uni-center/headers.png);
		background-repeat: no-repeat;
		background-size: cover;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.avatar_wrapper_img {
		border-radius: 50%;
	}

	.defaultAvatarUrl {
		width: 150rpx;
		height: 150rpx;
		background-color: #007aff;
		border-radius: 50%;
		justify-content: center;
		align-items: center;
	}

	.default_avatar {
		width: 100rpx;
		height: 100rpx;
		background-image: url(../../static/logo.png);
		background-repeat: no-repeat;
		background-size: cover;
	}

	.logo-title {
		flex: 1;
		align-items: center;
		justify-content: space-between;
		flex-direction: row;
	}

	.uer-name {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 38rpx;
		color: #FFFFFF;
	}

	.center-list {
		margin-bottom: 30rpx;
		background-color: #f9f9f9;
	}

	.center-list-cell {
		width: 750rpx;
		background-color: #007AFF;
		height: 40rpx;
	}

	.grid {
		background-color: #FFFFFF;
		margin-bottom: 12rpx;
	}

	.uni-grid .text {
		font-size: 32rpx;
		height: 50rpx;
		line-height: 50rpx;
		color: #817f82;
	}

	.uni-grid .item ::v-deep .uni-grid-item__box {
		justify-content: center;
		align-items: center;
	}


	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */
	.item-footer {
		flex-direction: row;
		align-items: center;
	}

	.item-footer-text {
		color: #999;
		font-size: 24rpx;
		padding-right: 10rpx;
	}

	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}

	.bottom-back {
		margin-top: 20rpx;
		width: 750rpx;
		height: 88rpx;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		align-items: center;
		/* #ifndef APP-NVUE */
		border: none;
		/* #endif */
		border-width: 0;
		border-radius: 0;
		background-color: #FFFFFF;
	}

	.bottom-back-text {
		font-size: 33rpx;
	}

	.mt15 {
		margin-top: 30rpx;
	}

	.bg_wrapper {
		position: absolute;
		top: 0%;
		right: 0%;
		left: 0%;
		bottom: 0;
		opacity: 0.3;
		background-repeat: no-repeat;
		background-size: cover;
		background-image: url(../../static/uni-center/bg2.jpg);
		background-position: center bottom;
	}

	.switchView {
		width: 100%;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		color: #3b4144;
	}
</style>